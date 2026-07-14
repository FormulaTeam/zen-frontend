import { useEffect, useRef } from "react";

export const useLoadMoreOnVisible = (
  rootNode: HTMLElement | null,
  sentinelNode: HTMLElement | null,
  onLoadMore?: () => void,
  enabled = true,
): void => {
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!enabled || !sentinelNode || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMoreRef.current?.();
        }
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "0px 0px 200px 0px",
      },
    );

    observer.observe(sentinelNode);

    return () => observer.disconnect();
  }, [rootNode, sentinelNode, enabled, !!onLoadMore]);
};