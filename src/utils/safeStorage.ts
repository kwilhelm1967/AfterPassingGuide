/**
 * Safe localStorage wrapper
 *
 * localStorage can throw when disabled or unavailable (e.g. private browsing).
 * All data is stored locally on the device—no cloud, no quota.
 * This prevents crashes during component initialization.
 */

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently fail - storage may be disabled or unavailable
  }
}
