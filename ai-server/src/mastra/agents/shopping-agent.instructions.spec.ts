import {
  SHOPPING_AGENT_CONVERSION_INSTRUCTIONS,
  SHOPPING_AGENT_INSTRUCTIONS,
} from './shopping-agent.instructions';

describe('Shopping Assistant conversion instructions', () => {
  it('starts conversion only when one shown last-turn Product is uniquely identified', () => {
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(/add the second one/i);
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /last Product recommendations/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(/uniquely identifies/i);
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(/unique name/i);
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /exactly one of those cards' name or options/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /Never pick the first card/i,
    );
  });

  it('matches option tokens literally on shown cards, not synonyms or conversion probes', () => {
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /Do not treat synonyms as a match/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /Do not start conversion to discover extra options/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /not unshown search hits/i,
    );
  });

  it('asks instead of converting when the hint matches no shown card or several cards', () => {
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(/the basket one/i);
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /say that option is not on the last recommendations/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /If several shown cards share the token/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(/Do not search/i);
  });

  it('asks when ordinal, name, and option do not resolve to the same shown Product', () => {
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /do not all resolve to the same shown Product/i,
    );
  });

  it('forwards option hints from that utterance as raw text, never a Product Item id', () => {
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /option hints in that utterance as raw text/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /Never pass a Product Item id/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /even if a hint token is not on that card/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /Do not rewrite hints into catalog words/i,
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

  it('allows at most one in-flight conversion and never two confirms', () => {
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /at most one conversion at a time/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(/two confirms/i);
  });

  it('abandons an in-flight conversion on a new product need so retrieval still works', () => {
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /new product need/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(/abandoned/i);
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(/search again/i);
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /do not write the Cart/i,
    );
  });

  it('switches to another last-turn Product instead of running two conversions', () => {
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /add the first one instead/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /uniquely identified/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /start conversion for that Product instead/i,
    );
  });

  it('leaves pickers/confirm up on unrelated chatter or an ambiguous add-reference with a short reminder', () => {
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(/wait/i);
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /does not uniquely identify a different last-turn Product/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(/short reminder/i);
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /do not abandon/i,
    );
  });

  it('allows a second conversion after success without a new search', () => {
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /After a successful Cart Item/i,
    );
    expect(SHOPPING_AGENT_CONVERSION_INSTRUCTIONS).toMatch(
      /without a new search/i,
    );
  });
});
