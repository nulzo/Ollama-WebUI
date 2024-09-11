import { useState, useCallback, useEffect } from 'react';

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) {
    return decodeURIComponent(match[2]);
  }
  return null;
};

const setCookie = (name: string, value: string, days: number = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

const deleteCookie = (name: string) => {
  setCookie(name, '', -1);
};

export function useCookie(
  key: string
): [string | null, (value: string, days?: number) => void, () => void] {
  const [cookie, setCookieState] = useState<string | null>(() => getCookie(key));

  const updateCookie = useCallback(
    (value: string, days?: number) => {
      setCookie(key, value, days);
      setCookieState(value);
    },
    [key]
  );

  const deleteCookieCallback = useCallback(() => {
    deleteCookie(key);
    setCookieState(null);
  }, [key]);

  useEffect(() => {
    setCookieState(getCookie(key));
  }, [key]);

  return [cookie, updateCookie, deleteCookieCallback];
}
