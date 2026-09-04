import { injectAgentStore } from '@copilotkit/angular';
import { inject } from '@angular/core';

import {
  initAgentStore,
  type InitAgentStoreConfig,
} from '@full-stack-nx-workspace/shared';
import { SHOPPING_AGENT_ID } from './shopping-agent.config';
import { ENV_CONFIG } from '../../../../environments/environment';
import { findProductsTool } from './tools/find-products.tool';

export type ShoppingAgentStoreExtras = Omit<
  InitAgentStoreConfig,
  'agentId' | 'url'
> & {
  widgets?: InitAgentStoreConfig['frontendTools'];
};

export function injectShoppingAgentStore(extras: ShoppingAgentStoreExtras) {
  const { widgets, frontendTools, useServerMemory = true, ...rest } = extras;

  initAgentStore({
    ...rest,
    agentId: SHOPPING_AGENT_ID,
    url: `${inject(ENV_CONFIG).agUiUrl}/${SHOPPING_AGENT_ID}`,
    useServerMemory,
    frontendTools: [
      findProductsTool,
      ...(frontendTools ?? []),
      ...(widgets ?? []),
    ],
  });

  return injectAgentStore(SHOPPING_AGENT_ID);
}
