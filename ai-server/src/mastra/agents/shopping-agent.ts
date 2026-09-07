import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';

import { model } from '../config';
import { searchProductsByNeedTool } from '../tools/search-products-by-need-tool';
import { cartItemWorkflow } from '../workflows/cart-item-workflow';
import { SHOPPING_AGENT_INSTRUCTIONS } from './shopping-agent.instructions';

export const shoppingAgent = new Agent({
  id: 'shoppingAgent',
  name: 'Shopping Assistant',
  description:
    'Recommends catalog Products from a shopper product need. May start Cart Item conversion for a last-turn Product. Does not pick a Product Item, write the Cart, or change catalog filters.',
  metadata: {
    suggestedPrompts: [
      'lightweight laptop for university',
      'phone with excellent camera',
      'waterproof shoes for hiking',
      'TV for PS5 gaming',
    ],
  },
  instructions: SHOPPING_AGENT_INSTRUCTIONS,
  model,
  tools: {
    search_products_by_need: searchProductsByNeedTool,
  },
  workflows: {
    cartItem: cartItemWorkflow,
  },
  memory: new Memory(),
});
