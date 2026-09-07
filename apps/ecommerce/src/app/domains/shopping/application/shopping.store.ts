import { effect, inject, untracked } from '@angular/core';
import { Router } from '@angular/router';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { A2uiRendererService } from '@a2ui/angular/v0_9';
import type { A2uiMessage } from '@a2ui/web_core/v0_9';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';

import { ChatRegistry } from '@full-stack-nx-workspace/shared';

import {
  CartAclReadAdapter,
} from '../../cart/application/anti-corruption-layer';
import { CartItemWorkflowApiService } from '../infrastructure/public-api';
import { CartItemConfirmHandler } from './cart-item-confirm.handler';
import {
  buildAbandonedSurface,
  buildMessageSurface,
  buildSuccessSurface,
  buildWriteErrorSurface,
  type A2uiEnvelope,
} from './cart-item-workflow-surfaces';

type ShoppingWorkflowState = {
  awaitingSurfaceId: string | null;
};

function toA2uiMessages(messages: Record<string, unknown>[]): A2uiMessage[] {
  return messages as unknown as A2uiMessage[];
}

export const ShoppingStore = signalStore(
  { providedIn: 'root' },
  withState<ShoppingWorkflowState>({ awaitingSurfaceId: null }),
  withProps(() => ({
    workflowApi: inject(CartItemWorkflowApiService),
    chatRegistry: inject(ChatRegistry),
    renderer: inject(A2uiRendererService),
    confirmHandler: inject(CartItemConfirmHandler),
    cartRead: inject(CartAclReadAdapter),
    router: inject(Router),
  })),
  withMethods((store) => ({
    presentSurface(envelope: A2uiEnvelope): void {
      const agentStore = store.chatRegistry.store;
      if (!agentStore) {
        store.renderer.processMessages(toA2uiMessages(envelope.messages));
        return;
      }
      agentStore().agent.addMessage({
        id: envelope.surfaceId,
        role: 'activity',
        activityType: 'a2ui-surface',
        content: { operations: envelope.messages },
      });
    },
    presentUpdate(envelope: A2uiEnvelope): void {
      store.renderer.processMessages(toA2uiMessages(envelope.messages));
    },
  })),
  withMethods((store) => ({
    startFromRecommendation: rxMethod<number>(
      pipe(
        switchMap((productId) =>
          store.workflowApi.start({ productId }).pipe(
            tap((surface) =>
              store.presentSurface({
                surfaceId: surface.surfaceId,
                messages: surface.messages as Record<string, unknown>[],
              }),
            ),
            catchError(() => {
              store.presentSurface(
                buildMessageSurface(
                  `srf-cart-item-error-${productId}`,
                  'Η μετατροπή απέτυχε',
                  'Δεν ήταν δυνατή η έναρξη του Cart Item workflow. Δοκιμάστε ξανά.',
                ),
              );
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
    handleAction(action: {
      name: string;
      surfaceId: string;
      context: Record<string, unknown>;
    }): void {
      if (action.name !== 'submitAnswer') {
        return;
      }
      const decision = store.confirmHandler.apply(action.context);
      if (decision.kind === 'cancel') {
        patchState(store, { awaitingSurfaceId: null });
        store.presentUpdate(buildAbandonedSurface(action.surfaceId));
        return;
      }
      if (decision.kind === 'checkout') {
        void store.router.navigate(['/checkout']);
        return;
      }
      if (decision.kind !== 'add') {
        return;
      }
      queueMicrotask(() => {
        if (store.cartRead.writePending()) {
          patchState(store, { awaitingSurfaceId: action.surfaceId });
          return;
        }
        if (store.cartRead.writeError()) {
          store.presentUpdate(buildWriteErrorSurface(action.surfaceId));
          return;
        }
        store.presentUpdate(buildSuccessSurface(action.surfaceId));
      });
    },
  })),
  withHooks({
    onInit(store) {
      store.renderer.surfaceGroup.onAction.subscribe((action) => {
        store.handleAction({
          name: action.name,
          surfaceId: action.surfaceId,
          context: (action.context ?? {}) as Record<string, unknown>,
        });
      });
      effect(() => {
        const surfaceId = store.awaitingSurfaceId();
        const pending = store.cartRead.writePending();
        if (!surfaceId || pending) {
          return;
        }
        untracked(() => {
          if (store.cartRead.writeError()) {
            store.presentUpdate(buildWriteErrorSurface(surfaceId));
          } else {
            store.presentUpdate(buildSuccessSurface(surfaceId));
          }
          patchState(store, { awaitingSurfaceId: null });
        });
      });
    },
  }),
);
