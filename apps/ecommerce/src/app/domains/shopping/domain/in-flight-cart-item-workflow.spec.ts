import {
  applyInFlightEvent,
  emptyInFlightSnapshot,
  isCartItemWorkflowSurfaceId,
  type InFlightSnapshot,
} from './in-flight-cart-item-workflow';

describe('Cart Item workflow in-flight policy', () => {
  const idle = emptyInFlightSnapshot();

  function presented(
    snapshot: InFlightSnapshot,
    surfaceId: string,
  ): InFlightSnapshot {
    return applyInFlightEvent(snapshot, {
      type: 'surface-presented',
      surfaceId,
    });
  }

  it('treats srf-cart-item-<productId> as a conversion surface and ignores error ids', () => {
    expect(isCartItemWorkflowSurfaceId('srf-cart-item-7')).toBe(true);
    expect(isCartItemWorkflowSurfaceId('srf-cart-item-error-7')).toBe(false);
    expect(isCartItemWorkflowSurfaceId('srf-other')).toBe(false);
  });

  it('keeps at most one in-flight run: a second surface abandons the first with no Cart write', () => {
    const first = presented(idle, 'srf-cart-item-7');
    expect(first.surfaceId).toBe('srf-cart-item-7');
    expect(first.abandonSurfaceId).toBeNull();

    const switched = presented(first, 'srf-cart-item-3');
    expect(switched.surfaceId).toBe('srf-cart-item-3');
    expect(switched.abandonSurfaceId).toBe('srf-cart-item-7');
  });

  it('does not abandon when the same conversion surface is presented again', () => {
    const first = presented(idle, 'srf-cart-item-7');
    const again = presented(first, 'srf-cart-item-7');
    expect(again.surfaceId).toBe('srf-cart-item-7');
    expect(again.abandonSurfaceId).toBeNull();
  });

  it('abandons an in-flight run when a new Product recommendation card is shown', () => {
    const withCards = applyInFlightEvent(idle, {
      type: 'recommendation-presented',
      toolCallId: 'rec-1',
    });
    const inFlight = presented(withCards, 'srf-cart-item-7');

    const afterNewSearch = applyInFlightEvent(inFlight, {
      type: 'recommendation-presented',
      toolCallId: 'rec-2',
    });
    expect(afterNewSearch.surfaceId).toBeNull();
    expect(afterNewSearch.abandonSurfaceId).toBe('srf-cart-item-7');
  });

  it('does not abandon when the same recommendation card is presented again', () => {
    const withCard = applyInFlightEvent(idle, {
      type: 'recommendation-presented',
      toolCallId: 'rec-1',
    });
    const inFlight = presented(withCard, 'srf-cart-item-7');
    const duplicate = applyInFlightEvent(inFlight, {
      type: 'recommendation-presented',
      toolCallId: 'rec-1',
    });
    expect(duplicate.surfaceId).toBe('srf-cart-item-7');
    expect(duplicate.abandonSurfaceId).toBeNull();
  });

  it('leaves pickers/confirm up on unrelated chatter', () => {
    const inFlight = presented(idle, 'srf-cart-item-7');
    const chatter = applyInFlightEvent(inFlight, { type: 'chatter' });
    expect(chatter.surfaceId).toBe('srf-cart-item-7');
    expect(chatter.abandonSurfaceId).toBeNull();
  });

  it('abandons on explicit cancel with no Cart write', () => {
    const inFlight = presented(idle, 'srf-cart-item-7');
    const cancelled = applyInFlightEvent(inFlight, { type: 'cancel' });
    expect(cancelled.surfaceId).toBeNull();
    expect(cancelled.abandonSurfaceId).toBe('srf-cart-item-7');
  });

  it('clears in-flight after success so a second conversion can start without a new search', () => {
    const inFlight = presented(idle, 'srf-cart-item-7');
    const afterSuccess = applyInFlightEvent(inFlight, { type: 'succeed' });
    expect(afterSuccess.surfaceId).toBeNull();
    expect(afterSuccess.abandonSurfaceId).toBeNull();

    const second = presented(afterSuccess, 'srf-cart-item-3');
    expect(second.surfaceId).toBe('srf-cart-item-3');
    expect(second.abandonSurfaceId).toBeNull();
  });
});
