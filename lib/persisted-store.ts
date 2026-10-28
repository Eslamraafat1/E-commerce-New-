"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed external store. The server snapshot is always `empty`,
 * so SSR/hydration markup is deterministic and the persisted value appears after hydration.
 */
export function createPersistedStore<T>(key: string, empty: T) {
  let cache = empty;
  let loaded = false;
  const subs = new Set<() => void>();

  const read = () => {
    try {
      const raw = localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : empty;
    } catch {
      cache = empty;
    }
    loaded = true;
  };
  const emit = () => subs.forEach((f) => f());

  const store = {
    subscribe(cb: () => void) {
      if (!loaded) read();
      subs.add(cb);
      const onStorage = (e: StorageEvent) => { if (e.key === key) { read(); emit(); } };
      window.addEventListener("storage", onStorage);
      return () => { subs.delete(cb); window.removeEventListener("storage", onStorage); };
    },
    getSnapshot(): T {
      if (!loaded && typeof window !== "undefined") read();
      return cache;
    },
    getServerSnapshot: () => empty,
    set(next: T | ((prev: T) => T)) {
      if (!loaded) read();
      cache = typeof next === "function" ? (next as (p: T) => T)(cache) : next;
      try { localStorage.setItem(key, JSON.stringify(cache)); } catch { /* storage unavailable */ }
      emit();
    },
    use(): T {
      return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
    },
  };
  return store;
}
