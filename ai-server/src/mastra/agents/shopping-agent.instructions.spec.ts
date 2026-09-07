import {
  SHOPPING_AGENT_CONVERSION_INSTRUCTIONS,
  SHOPPING_AGENT_INSTRUCTIONS,
} from './shopping-agent.instructions';

describe('Shopping Assistant conversion instructions', () => {
  it('starts conversion from an ordinal or name in this thread’s last Product recommendations', () => {
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(/add the second one/i);
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /last Product recommendations/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(/naming/i);
  });

  it('forwards option hints from that utterance as raw text, never a Product Item id', () => {
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /option hints in that utterance as raw text/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /Never pass a Product Item id/i,
    );
  });

  it('refuses a first message that names a Product with no last-turn recommendation', () => {
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /add the blue Nike/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /not a catalog name resolver/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /no last Product recommendation/i,
    );
  });

  it('does not offer product-detail add this', () => {
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /Product-detail "add this" is not offered/i,
    );
  });

  it('resolves one Product when the shopper asks to add two last-turn recommendations', () => {
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /add the second and the third/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /first mentioned, or ask which/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /Do not start two conversions/i,
    );
  });

  it('does not teach A2UI authoring or name tools', () => {
    expect(SHOPPING_AGENT_INSTRUCTIONS).not.toMatch(/NEVER plain text/i);
    expect(SHOPPING_AGENT_INSTRUCTIONS).not.toMatch(/ALWAYS render/i);
    expect(SHOPPING_AGENT_INSTRUCTIONS).not.toMatch(/renderA2ui/i);
    expect(SHOPPING_AGENT_INSTRUCTIONS).not.toMatch(/search_products_by_need/);
    expect(SHOPPING_AGENT_INSTRUCTIONS).not.toMatch(/cart-item-workflow/);
    expect(SHOPPING_AGENT_INSTRUCTIONS).not.toMatch(/\bcartItem\b/);
  });

  it('keeps retrieval, idle off-catalog chat, and account/Order refusal', () => {
    expect(SHOPPING_AGENT_INSTRUCTIONS).toMatch(
      /Search only when the message is a product need/i,
    );
    expect(SHOPPING_AGENT_INSTRUCTIONS).toMatch(/Off-catalog topics: refuse/i);
    expect(SHOPPING_AGENT_INSTRUCTIONS).toMatch(
      /orders, account.*say you only recommend Products/i,
    );
    expect(SHOPPING_AGENT_INSTRUCTIONS).toMatch(
      /These instructions never name tools/i,
    );
  });
});
