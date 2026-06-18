import { useEffect, type RefObject } from "react";

type MaybeRef<T extends HTMLElement> = RefObject<T> | T | null;

const resolveNode = <T extends HTMLElement>(value: MaybeRef<T>): T | null => {
    if (!value) return null;
    if ("current" in value) return value.current;
    return value;
};

export const useLoadMoreOnVisible = (
    root: MaybeRef<HTMLElement>,
    sentinel: MaybeRef<HTMLElement>,
    onLoadMore?: () => void,
    enabled = true,
): void => {
    useEffect(() => {
        const rootNode = resolveNode(root);
        const sentinelNode = resolveNode(sentinel);

        if (!enabled || !rootNode || !sentinelNode || !onLoadMore) return;

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
    }, [root, sentinel, onLoadMore, enabled]);
};