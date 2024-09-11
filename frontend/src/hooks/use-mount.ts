import { useEffect } from 'react';

const useEffectOnce = (effect: () => void | (() => void | undefined)) => {
  useEffect(effect, []);
};

export const useMount = (fn: () => void) => {
  useEffectOnce(() => {
    fn();
  });
};
