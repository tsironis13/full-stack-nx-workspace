import { injectAgentStore } from '@copilotkit/angular';
import { inject } from '@angular/core';

import { initAgentStore } from '@full-stack-nx-workspace/shared';
import { SHOPPING_AGENT_ID } from './shopping-agent.config';
import { ENV_CONFIG } from '../../../../environments/environment';

export function injectShoppingAgentStore() {
  initAgentStore({
    agentId: SHOPPING_AGENT_ID,
    url: `${inject(ENV_CONFIG).agUiUrl}/${SHOPPING_AGENT_ID}`,
    useServerMemory: true,
    frontendTools: [],
  });

  return injectAgentStore(SHOPPING_AGENT_ID);
}
