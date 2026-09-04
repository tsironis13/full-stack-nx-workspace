import { inject, Service } from '@angular/core';
import { injectInterrupt } from '@copilotkit/angular';

import { injectShoppingAgentStore } from './shopping-agent.store';
import { ChatRegistry } from '@full-stack-nx-workspace/shared';
import { SHOPPING_AGENT_ID } from './shopping-agent.config';

@Service()
export class ShoppingChatService {
  private readonly _chatRegistry = inject(ChatRegistry);
  private readonly _store = injectShoppingAgentStore();
  private readonly _interrupts = injectInterrupt({
    agentId: SHOPPING_AGENT_ID,
  });

  public init(): void {
    this._chatRegistry.setChat({
      store: this._store,
      interrupts: this._interrupts,
    });
  }
}
