import {
  CART_ITEM_WORKFLOW_DESCRIPTION,
  cartItemWorkflowInputSchema,
} from './cart-item-workflow.contract';

describe('Cart Item workflow start contract', () => {
  it('accepts a last-turn Product id plus optional hintText, never a Product Item id', () => {
    expect(cartItemWorkflowInputSchema.shape.productId).toBeDefined();
    expect(cartItemWorkflowInputSchema.shape.hintText).toBeDefined();
    expect(cartItemWorkflowInputSchema.shape).not.toHaveProperty(
      'productItemId',
    );

    expect(cartItemWorkflowInputSchema.shape.productId.description).toMatch(
      /uniquely identified Product from this thread's last shown/i,
    );
    expect(cartItemWorkflowInputSchema.shape.productId.description).toMatch(
      /Never a Product Item id/i,
    );
    expect(cartItemWorkflowInputSchema.shape.hintText.description).toMatch(
      /option hints from this utterance/i,
    );
  });

  it('describes starting conversion for one last-turn recommended Product, including natural-language add', () => {
    expect(CART_ITEM_WORKFLOW_DESCRIPTION).toMatch(
      /last shown Product recommendation cards/i,
    );
    expect(CART_ITEM_WORKFLOW_DESCRIPTION).toMatch(/the second one/i);
    expect(CART_ITEM_WORKFLOW_DESCRIPTION).toMatch(/uniquely identifies/i);
    expect(CART_ITEM_WORKFLOW_DESCRIPTION).toMatch(/no synonyms/i);
    expect(CART_ITEM_WORKFLOW_DESCRIPTION).toMatch(
      /identity is ambiguous/i,
    );
    expect(CART_ITEM_WORKFLOW_DESCRIPTION).toMatch(/hintText/);
    expect(CART_ITEM_WORKFLOW_DESCRIPTION).toMatch(/Never a Product Item id/i);
    expect(CART_ITEM_WORKFLOW_DESCRIPTION).toMatch(
      /no last-turn Product recommendation/i,
    );
    expect(CART_ITEM_WORKFLOW_DESCRIPTION).not.toMatch(/productItemId/);
  });

  it('describes one in-flight conversion at a time; a new start replaces the current run', () => {
    expect(CART_ITEM_WORKFLOW_DESCRIPTION).toMatch(
      /one conversion at a time/i,
    );
    expect(CART_ITEM_WORKFLOW_DESCRIPTION).toMatch(/abandons/i);
    expect(CART_ITEM_WORKFLOW_DESCRIPTION).toMatch(/no Cart write/i);
  });
});
