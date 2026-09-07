let listener: ((toolCallId: string) => void) | null = null;
let scheduled = false;
let turnSeq = 0;

export function setRecommendationTurnListener(
  next: ((toolCallId: string) => void) | null,
): void {
  listener = next;
}

/** Coalesce one Shopping Assistant recommendation turn (up to 3 cards) into one id. */
export function notifyRecommendationTurn(): void {
  if (scheduled) {
    return;
  }
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    turnSeq += 1;
    listener?.(`rec-turn-${turnSeq}`);
  });
}
