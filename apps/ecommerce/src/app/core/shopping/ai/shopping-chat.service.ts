import { inject, Service } from '@angular/core';
import { injectInterrupt } from '@copilotkit/angular';

import {
  injectShoppingAgentStore,
  type ShoppingAgentStoreExtras,
} from './shopping-agent.store';
import { ChatRegistry } from '@full-stack-nx-workspace/shared';
import { SHOPPING_AGENT_ID } from './shopping-agent.config';

@Service()
export class ShoppingChatService {
  private readonly _chatRegistry = inject(ChatRegistry);
  private readonly _interrupts = injectInterrupt({
    agentId: SHOPPING_AGENT_ID,
  });
  private _store?: ReturnType<typeof injectShoppingAgentStore>;

  public init(extras: ShoppingAgentStoreExtras): void {
    this._store ??= injectShoppingAgentStore(extras);
    this._chatRegistry.setChat({
      store: this._store,
      interrupts: this._interrupts,
    });
  }
}
