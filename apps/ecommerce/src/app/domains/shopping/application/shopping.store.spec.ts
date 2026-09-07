import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { A2uiRendererService } from '@a2ui/angular/v0_9';
import { of } from 'rxjs';

import { ChatRegistry } from '@full-stack-nx-workspace/shared';

import { CartAclReadAdapter } from '../../cart/application/anti-corruption-layer';
import {
  CartItemWorkflowApiService,
  ProductItemConversionApiService,
} from '../infrastructure/public-api';
import { CartItemConfirmHandler } from './cart-item-confirm.handler';
import { ShoppingStore } from './shopping.store';

function envelopeFor(surfaceId: string) {
  return {
    surfaceId,
    messages: [{ createSurface: { surfaceId } }],
  };
}

function abandonedCalls(processMessages: jest.Mock) {
  return processMessages.mock.calls.filter((call) =>
    JSON.stringify(call[0]).includes('Ακυρώθηκε'),
  );
}

describe('ShoppingStore in-flight Cart Item workflow', () => {
  let store: InstanceType<typeof ShoppingStore>;
  let workflowApi: { start: jest.Mock };
  let processMessages: jest.Mock;
  let confirmHandler: { apply: jest.Mock };

  beforeEach(() => {
    workflowApi = {
      start: jest.fn((input: { productId: number }) =>
        of(envelopeFor(`srf-cart-item-${input.productId}`)),
      ),
    };
    processMessages = jest.fn();
    confirmHandler = { apply: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        ShoppingStore,
        { provide: CartItemWorkflowApiService, useValue: workflowApi },
        {
          provide: ProductItemConversionApiService,
          useValue: { convert: jest.fn() },
        },
        {
          provide: ChatRegistry,
          useValue: {
            store: undefined,
            chatInfo: {
              subscribe: (
                next: (info: { store: undefined; agentId: undefined }) => void,
              ) => {
                next({ store: undefined, agentId: undefined });
                return { unsubscribe: () => undefined };
              },
            },
          },
        },
        {
          provide: A2uiRendererService,
          useValue: {
            processMessages,
            surfaceGroup: {
              onAction: { subscribe: () => ({ unsubscribe: () => undefined }) },
            },
          },
        },
        { provide: CartItemConfirmHandler, useValue: confirmHandler },
        {
          provide: CartAclReadAdapter,
          useValue: {
            writePending: signal(false),
            writeError: signal(null),
          },
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    store = TestBed.inject(ShoppingStore);
  });

  it('abandons the current run when a second conversion starts, without a Cart write', () => {
    store.startFromRecommendation(7);
    store.startFromRecommendation(3);

    expect(store.inFlightSurfaceId()).toBe('srf-cart-item-3');
    expect(abandonedCalls(processMessages).length).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(abandonedCalls(processMessages)[0])).toContain(
      'srf-cart-item-7',
    );
    expect(confirmHandler.apply).not.toHaveBeenCalled();
  });

  it('abandons on a new Product recommendation while pickers/confirm are up', () => {
    store.noteRecommendationPresented('rec-1');
    store.startFromRecommendation(7);
    processMessages.mockClear();

    store.noteRecommendationPresented('rec-2');

    expect(store.inFlightSurfaceId()).toBeNull();
    expect(abandonedCalls(processMessages)).toHaveLength(1);
    expect(confirmHandler.apply).not.toHaveBeenCalled();
  });

  it('does not abandon when the same recommendation card is presented again', () => {
    store.noteRecommendationPresented('rec-1');
    store.startFromRecommendation(7);
    processMessages.mockClear();

    store.noteRecommendationPresented('rec-1');

    expect(store.inFlightSurfaceId()).toBe('srf-cart-item-7');
    expect(abandonedCalls(processMessages)).toHaveLength(0);
  });

  it('abandons on explicit cancel without a Cart write', () => {
    store.startFromRecommendation(7);
    confirmHandler.apply.mockReturnValue({ kind: 'cancel' });
    processMessages.mockClear();

    store.handleAction({
      name: 'submitAnswer',
      surfaceId: 'srf-cart-item-7',
      context: { abandon: 'true' },
    });

    expect(store.inFlightSurfaceId()).toBeNull();
    expect(abandonedCalls(processMessages).length).toBeGreaterThanOrEqual(1);
    expect(confirmHandler.apply).toHaveBeenCalled();
    expect(confirmHandler.apply.mock.results[0]?.value).toEqual({
      kind: 'cancel',
    });
  });

  it('allows a second conversion after success without abandoning a live confirm', () => {
    store.startFromRecommendation(7);
    store.applyInFlight({ type: 'succeed' });
    processMessages.mockClear();

    store.startFromRecommendation(3);

    expect(store.inFlightSurfaceId()).toBe('srf-cart-item-3');
    expect(abandonedCalls(processMessages)).toHaveLength(0);
  });
});
