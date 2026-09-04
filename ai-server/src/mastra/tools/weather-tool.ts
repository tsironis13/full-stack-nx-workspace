import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const weatherTool = createTool({
  id: 'weather-tool',
  description: 'Get the current weather for a city',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: z.object({
    location: z.string(),
    temperatureCelsius: z.number(),
    conditions: z.string(),
  }),
  execute: async ({ location }, { abortSignal }) => {
    const response = await fetch(
      `https://wttr.in/${encodeURIComponent(location)}?format=j1`,
      { signal: abortSignal },
    );
    if (!response.ok) {
      throw new Error(`Weather lookup failed with HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      current_condition: Array<{
        temp_C: string;
        weatherDesc: Array<{ value: string }>;
      }>;
    };
    const current = data.current_condition[0];

    return {
      location,
      temperatureCelsius: Number(current.temp_C),
      conditions: current.weatherDesc[0].value,
    };
  },
});
