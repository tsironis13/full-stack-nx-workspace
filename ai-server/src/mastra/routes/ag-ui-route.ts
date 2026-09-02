import type { ContextWithMastra } from '@mastra/core/server';
import { streamSSE } from 'hono/streaming';

import { parseRunAgentInput, streamAgentEvents } from './ag-ui-stream';
import { getExtendedLocalAgent } from '../extended-mastra-agent';

interface AgUiForwardedProps {
  agentMode?: unknown;
  __proxiedMCPRequest?: unknown;
}

const HIDDEN_TOOLS: Record<string, readonly string[]> = {
  travelRefinementAgent: ['renderDashboard'],
};

export async function agUiRouteHandler(
  c: ContextWithMastra,
): Promise<Response> {
  const agentId = c.req.param('agentId');
  const mastraInstance = c.get('mastra');
  const requestContext = c.get('requestContext');

  const parsed = await parseRunAgentInput(c);

  if (!parsed.ok) {
    return parsed.response;
  }

  const forwardedProps = parsed.input.forwardedProps as
    AgUiForwardedProps | undefined;
  const mode = forwardedProps?.agentMode;

  let effectiveAgentId: string;
  if (mode === 'plan') {
    effectiveAgentId = 'planningAgent';
  } else if (mode === 'execution') {
    effectiveAgentId = 'ticketingAgent';
  } else {
    effectiveAgentId = agentId ?? '';
  }

  const agent = getExtendedLocalAgent({
    mastra: mastraInstance,
    agentId: effectiveAgentId,
    resourceId: parsed.input.threadId,
    requestContext,
    tripwireMessage: 'Sorry, I cannot help with this topic.',
    hiddenToolNames: HIDDEN_TOOLS[effectiveAgentId],
    mcpAppsServerHashes: {},
  });

  agent.setAbortSignal(c.req.raw.signal);

  //   const middleware = isProxiedMcpRequest(parsed.input.forwardedProps)
  //     ? mcpAppsProxy
  //     : undefined;

  // `c` is typed against @mastra/core's bundled hono, which is structurally
  // incompatible with the project's hono `Context` that `streamSSE` expects.
  return streamSSE(
    c as unknown as Parameters<typeof streamSSE>[0],
    async (sse) => {
      await streamAgentEvents(sse, agent, parsed.input);
    },
  );
}
