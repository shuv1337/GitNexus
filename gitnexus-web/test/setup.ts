import { beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
};

const isUsableStorage = (value: unknown): value is Storage => {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as Storage).getItem === 'function' &&
    typeof (value as Storage).setItem === 'function' &&
    typeof (value as Storage).removeItem === 'function'
  );
};

const ensureStorage = (name: 'localStorage' | 'sessionStorage'): Storage => {
  const win = typeof window !== 'undefined' ? window : undefined;
  const windowDescriptor = win ? Object.getOwnPropertyDescriptor(win, name) : undefined;
  if (windowDescriptor && 'value' in windowDescriptor && isUsableStorage(windowDescriptor.value)) {
    return windowDescriptor.value;
  }

  const globalDescriptor = Object.getOwnPropertyDescriptor(globalThis, name);
  if (globalDescriptor && 'value' in globalDescriptor && isUsableStorage(globalDescriptor.value)) {
    return globalDescriptor.value;
  }

  const fallback = createMemoryStorage();
  Object.defineProperty(globalThis, name, {
    value: fallback,
    configurable: true,
    writable: true,
  });

  if (win) {
    Object.defineProperty(win, name, {
      value: fallback,
      configurable: true,
      writable: true,
    });
  }

  return fallback;
};

const testSessionStorage = ensureStorage('sessionStorage');
const testLocalStorage = ensureStorage('localStorage');

// Reset storage between tests
beforeEach(() => {
  testSessionStorage.removeItem('gitnexus-llm-settings');
  testLocalStorage.removeItem('gitnexus-llm-settings'); // legacy key (migration)
});
