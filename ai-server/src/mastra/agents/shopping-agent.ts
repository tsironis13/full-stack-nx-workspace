import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';

import { model } from '../config';
//import { ticketingAgentPrompt } from './ticketing-agent.prompt.js';

export const shoppingAgent = new Agent({
  id: 'shoppingAgent',
  name: 'Full Stack Shopping Assistant',
  instructions:
    'You are a friendly weather assistant. When the user asks about the weather in a city, look it up. Then answer in one short, natural sentence that mentions the condition and the temperature in degrees Celsius.',
  model,
  tools: {},
  memory: new Memory(),
});
