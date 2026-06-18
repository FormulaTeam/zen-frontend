import { useEffect, type RefObject } from "react";

export const useLoadMoreOnVisible = (
    rootRef: RefObject<HTMLElement>,
    sentinelRef: RefObject<HTMLElement>,
    onLoadMore?: () => void,
): void => {
    useEffect(() => {
        const rootNode = rootRef.current;
        const sentinelNode = sentinelRef.current;

        if (!rootNode || !sentinelNode || !onLoadMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    onLoadMore();
                }
            },
            { root: rootNode, threshold: 0 },
        );

        observer.observe(sentinelNode);

        return () => observer.disconnect();
    }, [rootRef, sentinelRef, onLoadMore]);
};