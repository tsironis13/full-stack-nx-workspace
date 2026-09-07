export type InFlightSnapshot = {
  surfaceId: string | null;
  seenRecommendationToolCallIds: readonly string[];
  abandonSurfaceId: string | null;
};

export type InFlightEvent =
  | { type: 'surface-presented'; surfaceId: string }
  | { type: 'recommendation-presented'; toolCallId: string }
  | { type: 'cancel' }
  | { type: 'succeed' }
  | { type: 'chatter' };

const CART_ITEM_SURFACE_ID = /^srf-cart-item-\d+$/;

export function emptyInFlightSnapshot(): InFlightSnapshot {
  return {
    surfaceId: null,
    seenRecommendationToolCallIds: [],
    abandonSurfaceId: null,
  };
}

export function isCartItemWorkflowSurfaceId(surfaceId: string): boolean {
  return CART_ITEM_SURFACE_ID.test(surfaceId);
}

export function applyInFlightEvent(
  snapshot: InFlightSnapshot,
  event: InFlightEvent,
): InFlightSnapshot {
  switch (event.type) {
    case 'surface-presented': {
      const previous = snapshot.surfaceId;
      const abandonSurfaceId =
        previous !== null && previous !== event.surfaceId ? previous : null;
      return {
        surfaceId: event.surfaceId,
        seenRecommendationToolCallIds: snapshot.seenRecommendationToolCallIds,
        abandonSurfaceId,
      };
    }
    case 'recommendation-presented': {
      if (snapshot.seenRecommendationToolCallIds.includes(event.toolCallId)) {
        return { ...snapshot, abandonSurfaceId: null };
      }
      return {
        surfaceId: null,
        seenRecommendationToolCallIds: [
          ...snapshot.seenRecommendationToolCallIds,
          event.toolCallId,
        ],
        abandonSurfaceId: snapshot.surfaceId,
      };
    }
    case 'cancel':
      return {
        surfaceId: null,
        seenRecommendationToolCallIds: snapshot.seenRecommendationToolCallIds,
        abandonSurfaceId: snapshot.surfaceId,
      };
    case 'succeed':
      return {
        surfaceId: null,
        seenRecommendationToolCallIds: snapshot.seenRecommendationToolCallIds,
        abandonSurfaceId: null,
      };
    case 'chatter':
      return { ...snapshot, abandonSurfaceId: null };
  }
}
