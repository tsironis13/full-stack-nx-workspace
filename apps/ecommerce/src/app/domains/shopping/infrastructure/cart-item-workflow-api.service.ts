import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';

import { ENV_CONFIG } from '../../../../environments/environment';
import type {
  CartItemWorkflowRunWire,
  CartItemWorkflowStartWire,
  CartItemWorkflowSurfaceWire,
} from './cart-item-workflow-api.model';

const WORKFLOW_ID = 'cart-item-workflow';

@Injectable({ providedIn: 'root' })
export class CartItemWorkflowApiService {
  readonly #http = inject(HttpClient);
  readonly #base = inject(ENV_CONFIG).aiServerUrl.replace(/\/$/, '');

  start(
    input: CartItemWorkflowStartWire,
  ): Observable<CartItemWorkflowSurfaceWire> {
    const workflowUrl = `${this.#base}/api/workflows/${WORKFLOW_ID}`;
    return this.#http
      .post<{ runId: string }>(`${workflowUrl}/create-run`, {})
      .pipe(
        switchMap((created) =>
          this.#http.post<CartItemWorkflowRunWire>(
            `${workflowUrl}/start-async`,
            { inputData: input },
            { params: { runId: created.runId } },
          ),
        ),
        map((run) => {
          const surface = run.result;
          if (
            run.status !== 'success' ||
            !surface?.surfaceId ||
            !Array.isArray(surface.messages)
          ) {
            throw new Error('Cart Item workflow did not return a surface');
          }
          return surface;
        }),
      );
  }
}
