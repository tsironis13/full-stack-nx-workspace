import {
  notifyRecommendationTurn,
  setRecommendationTurnListener,
} from './recommendation-turn';

describe('notifyRecommendationTurn', () => {
  afterEach(() => {
    setRecommendationTurnListener(null);
  });

  it('coalesces one Product recommendation turn into a single in-flight event id', async () => {
    const seen: string[] = [];
    setRecommendationTurnListener((id) => seen.push(id));

    notifyRecommendationTurn();
    notifyRecommendationTurn();
    notifyRecommendationTurn();
    await Promise.resolve();

    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatch(/^rec-turn-\d+$/);
  });
});
