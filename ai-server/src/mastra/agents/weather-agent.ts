import { Agent } from '@mastra/core/agent';

import { model } from '../config';
import { weatherTool } from '../tools/weather-tool';

export const weatherAgent = new Agent({
  id: 'weatherAgent',
  name: 'Weather Agent',
  description: 'Sample agent that reports current weather for a city.',
  metadata: {
    suggestedPrompts: [
      "What's the weather in Athens?",
      'Is it raining in London?',
    ],
  },
  instructions: `You are a weather assistant.
Ask for a city if the user does not name one.
Call weatherTool for the current weather.
Keep the answer short.`,
  model,
  tools: { weatherTool },
});
