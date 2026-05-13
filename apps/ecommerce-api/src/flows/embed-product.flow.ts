// import { genkit, z } from 'genkit';
// import { openAI } from '@genkit-ai/compat-oai/openai';

// const ai = genkit({
//   //plugins: [openAI({ apiKey: process.env.OPENAI_API_KEY })],
//   plugins: [
//     openAI({
//       apiKey: '',
//     }),
//   ],
// });

// export const embedProduct = ai.defineFlow(
//   {
//     name: 'embedProduct',
//     inputSchema: z.object({
//       name: z.string(),
//       description: z.string(),
//       category: z.string(),
//     }),
//     outputSchema: z.object({ embedding: z.array(z.number()) }),
//   },
//   async (input) => {
//     const text = `
//       Product Name: ${input.name}
//       Description: ${input.description}
//       Category: ${input.category}
//     `;

//     // Use OpenAI embedding model
//     const result = await ai.embed({
//       embedder: openAI.embedder('text-embedding-ada-002'),
//       content: text,
//     });

//     return { embedding: result[0].embedding };
//   }
// );
