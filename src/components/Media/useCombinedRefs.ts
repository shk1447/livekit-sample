import { type MutableRefObject, type Ref, useCallback } from 'react';

export const useCombinedRefs = <T>(...refs: Ref<T>[]) =>
  useCallback(
    (value: T) => {
      refs.forEach((ref) => {
        if (typeof ref === 'function') {
          ref(value);
        } else if (ref !== null) {
          // eslint-disable-next-line no-param-reassign
          (ref as MutableRefObject<T>).current = value;
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
