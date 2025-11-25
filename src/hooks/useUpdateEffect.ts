import { useEffect, useRef } from "react";

function useUpdateEffect(effect: () => void, deps: any) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    return effect();
  }, deps);
}

export { useUpdateEffect };