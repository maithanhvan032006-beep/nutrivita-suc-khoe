// Local persistence adapter for guest users ("đăng nhập sau")
export function isGuestUser(userId: string): boolean {
  return typeof userId === 'string' && userId.startsWith('guest_');
}

export function getGuestData<T>(userId: string, key: string, fallback: T): T {
  const fullKey = `nutrivita_${userId}_${key}`;
  const data = localStorage.getItem(fullKey);
  if (!data) return fallback;
  try {
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

export function setGuestData<T>(userId: string, key: string, value: T): void {
  const fullKey = `nutrivita_${userId}_${key}`;
  localStorage.setItem(fullKey, JSON.stringify(value));
}

export function clearGuestData(userId: string): void {
  const prefix = `nutrivita_${userId}_`;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}
