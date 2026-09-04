const THREAD_STORAGE_KEY = 'ec.storefront.shopping-assistant.thread.v1';

/** Tab-session thread id so follow-ups survive refresh but not a closed tab. */
export function readOrCreateShoppingAssistantThreadId(): string {
  if (typeof sessionStorage === 'undefined') {
    return crypto.randomUUID();
  }

  const existing = sessionStorage.getItem(THREAD_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const threadId = crypto.randomUUID();
  sessionStorage.setItem(THREAD_STORAGE_KEY, threadId);
  return threadId;
}
