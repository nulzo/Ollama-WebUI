import { useState } from 'react';

export function useDefault<T>(
  initialValue: T,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue);

  if (typeof state === 'undefined' || state === null) {
    return [defaultValue, setState];
  }

  return [state, setState];
}
