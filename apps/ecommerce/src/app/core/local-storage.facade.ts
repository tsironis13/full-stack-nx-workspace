import { isPlatformBrowser } from '@angular/common';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';

/**
 * Typed JSON helpers over {@link Window.localStorage}. Safe for SSR / missing storage:
 * reads return `null` on parse failures or absence; writes/removals are no-ops when
 * `localStorage` is unavailable. Errors are swallowed so callers never throw.
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageFacade {
  private readonly platformId = inject(PLATFORM_ID);

  /** Read `key`, parse JSON, return `null` on missing key or invalid JSON. */
  getJson<T>(key: string): T | null {
    const raw = this.getRaw(key);
    if (raw === null) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /** Store a JSON-serializable value under `key`. */
  setJson<T>(key: string, value: T): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota / private mode failures
    }
  }

  remove(key: string): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }
    try {
      storage.removeItem(key);
    } catch {
      // ignore
    }
  }

  /** Remove every key that starts with `prefix` (browser only). */
  clearByPrefix(prefix: string): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k !== null && k.startsWith(prefix)) {
          toRemove.push(k);
        }
      }
      for (const k of toRemove) {
        storage.removeItem(k);
      }
    } catch {
      // ignore
    }
  }

  private getRaw(key: string): string | null {
    const storage = this.getStorage();
    if (!storage) {
      return null;
    }
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  private getStorage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  }
}
