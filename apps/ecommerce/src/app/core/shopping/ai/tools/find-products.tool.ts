import { z } from 'zod';

import { createFrontendTool } from '@full-stack-nx-workspace/shared';

export const findProductsTool = createFrontendTool({
  name: 'findProducts',
  description: `
    Searches for Products and redirects the user to the catalog page where the found Products are shown.

    Remarks:
    - For the search parameter, pass a Product name (or part of a name) as the shopper said it. Catalog search matches products.name only — not a product need, and not category or facet values.
    - Do not announce this tool call before executing it. The UI already shows that the tool is running.
    - Do not render Products or Product lists in the chat after this tool: the user is taken to the catalog route where results appear.
    - If needed, send at most one short text confirmation after the tool call has completed.
  `,
  parameters: z.object({
    productName: z.string().describe('Product name'),
  }),
  handler: async ({ productName }) => {
    console.log('findProductsTool', productName);
    return { ok: true };
  },
});
