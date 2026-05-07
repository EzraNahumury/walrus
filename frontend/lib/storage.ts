// Lightweight typed wrapper around localStorage for demo persistence.
// This is NOT the source of truth for SignalVault; Walrus + Sui are.
// localStorage is used to keep the demo experience smooth between
// page refreshes when Walrus credentials are not configured.

const PREFIX = "signalvault:v1:";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore quota / serialization errors in the demo path
  }
}

export function remove(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(PREFIX + key);
}

export function listKeys(prefix: string): string[] {
  if (!isBrowser()) return [];
  const out: string[] = [];
  const full = PREFIX + prefix;
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(full)) out.push(k.slice(PREFIX.length));
  }
  return out;
}
