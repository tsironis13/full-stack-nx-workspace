import {
  EnvironmentInjector,
  inject,
  runInInjectionContext,
} from '@angular/core';
import { randomUUID } from '@ag-ui/client';
import {
  CopilotKit,
  FrontendToolConfig,
  HumanInTheLoopConfig,
  registerFrontendTool,
  registerHumanInTheLoop,
  registerRenderToolCall,
  RenderToolCallConfig,
} from '@copilotkit/angular';

import { AppHttpAgent } from './app-http-agent';

export interface InitAgentStoreConfig {
  agentId: string;
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  frontendTools?: readonly FrontendToolConfig<any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolCallRenderer?: readonly RenderToolCallConfig<any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  humanInTheLoop?: readonly HumanInTheLoopConfig<any>[];
  forwardedProps?: () => Record<string, unknown>;
  state?: () => unknown;
  useServerMemory?: boolean;
  threadId?: string;
  /**
   * Forward only the catalog id instead of the full descriptor. For agents
   * that never render custom components themselves but must still know which
   * catalog the surfaces belong to.
   */
  catalogIdOnly?: boolean;
}

export function initAgentStore(config: InitAgentStoreConfig): void {
  const copilotKit = inject(CopilotKit);

  const envInjector = inject(EnvironmentInjector);

  const forwardedPropsFor = (): Record<string, unknown> => {
    const forwardedProps = config.forwardedProps;
    return forwardedProps
      ? runInInjectionContext(envInjector, () => forwardedProps())
      : {};
  };

  const state = config.state;
  const stateFor = (): unknown => {
    return state
      ? runInInjectionContext(envInjector, () => state())
      : undefined;
  };

  const agentConfig = {
    agentId: config.agentId,
    url: config.url,
    threadId: config.threadId ?? randomUUID(),
  };

  const httpAgent = new AppHttpAgent(agentConfig, {
    forwardedProps: forwardedPropsFor,
    state: config.state ? stateFor : undefined,
    useServerMemory: config.useServerMemory,
  });

  //connectCatalogContext(config.agentId, config.catalogIdOnly ?? false);

  copilotKit.updateRuntime({
    selfManagedAgents: {
      ...copilotKit.agents(),
      [config.agentId]: httpAgent as any,
    },
  });

  for (const tool of config.frontendTools ?? []) {
    registerFrontendTool({
      ...tool,
      agentId: config.agentId,
    });
  }

  for (const toolCall of config.toolCallRenderer ?? []) {
    registerRenderToolCall({ ...toolCall, agentId: config.agentId });
  }

  for (const tool of config.humanInTheLoop ?? []) {
    registerHumanInTheLoop({ ...tool, agentId: config.agentId });
  }
}
