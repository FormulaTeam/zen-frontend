import React, { useState, useCallback } from "react";
import { useLoadMoreOnVisible } from "@src/pages/ResponsesPage/hooks/useLoadMoreOnVisible";

export const PaginatedAutocompleteListbox = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement> & {
    onLoadMore?: () => void;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
  }
>(function Listbox(props, ref) {
  console.log("PaginatedAutocompleteListbox rendered", props);
  const { children, onLoadMore, hasNextPage = true, isFetchingNextPage, ...otherProps } = props;
  const [rootNode, setRootNode] = useState<HTMLElement | null>(null);
  const [sentinelNode, setSentinelNode] = useState<HTMLElement | null>(null);

  const rootRef = useCallback(
    (node: HTMLUListElement | null) => {
      setRootNode(node);
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  const sentinelRef = useCallback((node: HTMLLIElement | null) => {
    setSentinelNode(node);
  }, []);

  useLoadMoreOnVisible(rootNode, sentinelNode, onLoadMore, !isFetchingNextPage && hasNextPage);

  return (
    <ul ref={rootRef} {...otherProps}>
      {children}
      {!isFetchingNextPage && hasNextPage && (
        <li
          aria-hidden
          ref={sentinelRef}
          style={{ height: 10, width: "100%", padding: 0, margin: 0, listStyle: "none" }}
        />
      )}
    </ul>
  );
});