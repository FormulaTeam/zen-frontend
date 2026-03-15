import { useEffect, useRef } from "react";

function useEffectAfterMount(effect: Function, deps: Array<any>) {
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      return effect();
    } else {
      isMounted.current = true;
    }
  }, deps);
}

export { useEffectAfterMount };