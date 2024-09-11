import { useCallback, useEffect, useSyncExternalStore } from 'react';

function dispatchStorageEvent(key: string, newValue: string | null): void {
  window.dispatchEvent(new StorageEvent('storage', { key, newValue }));
}

const setSessionStorageItem = (key: string, value: any): void => {
  const stringifiedValue = JSON.stringify(value);
  window.sessionStorage.setItem(key, stringifiedValue);
  dispatchStorageEvent(key, stringifiedValue);
};

const removeSessionStorageItem = (key: string): void => {
  window.sessionStorage.removeItem(key);
  dispatchStorageEvent(key, null);
};

const getSessionStorageItem = (key: string): string | null => {
  return window.sessionStorage.getItem(key);
};

const useSessionStorageSubscribe = (callback: (event: StorageEvent) => void): (() => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

const getSessionStorageServerSnapshot = (): never => {
  throw Error('useSessionStorage is a client-only hook');
};

export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (v: T | ((val: T) => T)) => void] {
  const getSnapshot = () => getSessionStorageItem(key);

  const store = useSyncExternalStore(
    useSessionStorageSubscribe,
    getSnapshot,
    getSessionStorageServerSnapshot
  );

  const setState = useCallback(
    (v: T | ((val: T) => T)): void => {
      try {
        const nextState =
          typeof v === 'function' ? (v as (val: T) => T)(JSON.parse(store as string) as T) : v;

        if (nextState === undefined || nextState === null) {
          removeSessionStorageItem(key);
        } else {
          setSessionStorageItem(key, nextState);
        }
      } catch (e) {
        console.warn(e);
      }
    },
    [key, store]
  );

  useEffect(() => {
    if (getSessionStorageItem(key) === null && typeof initialValue !== 'undefined') {
      setSessionStorageItem(key, initialValue);
    }
  }, [key, initialValue]);

  return [store !== null ? (JSON.parse(store) as T) : initialValue, setState];
}
