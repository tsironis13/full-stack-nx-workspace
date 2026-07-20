import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

import type { OrderHistoryOrder } from '../domain/public-api';
import { OrdersApiService } from '../infrastructure/public-api';
import { mapOrderHistoryFromWire } from './order-history.mapper';

type OrderHistoryState = {
  orders: OrderHistoryOrder[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
};

const initialState: OrderHistoryState = {
  orders: [],
  loading: false,
  loaded: false,
  error: null,
};

export const OrderHistoryStore = signalStore(
  withState(initialState),
  withComputed(({ orders, loaded }) => ({
    isEmpty: computed(() => loaded() && orders().length === 0),
  })),
  withProps(() => ({
    api: inject(OrdersApiService),
  })),
  withMethods((store) => {
    const load = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          store.api.getOrderHistory().pipe(
            tapResponse({
              next: (wire) =>
                patchState(store, {
                  orders: mapOrderHistoryFromWire(wire),
                  loading: false,
                  loaded: true,
                }),
              error: () =>
                patchState(store, {
                  loading: false,
                  loaded: true,
                  error: 'orders.historyLoadError',
                }),
            }),
          ),
        ),
      ),
    );

    return { load };
  }),
);
