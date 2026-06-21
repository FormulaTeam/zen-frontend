import React, { useImperativeHandle, useRef } from "react";
import { useLoadMoreOnVisible } from "@src/pages/ResponsesPage/hooks/useLoadMoreOnVisible";

export const PaginatedAutocompleteListbox = React.forwardRef<
    HTMLUListElement,
    React.HTMLAttributes<HTMLUListElement> & { onLoadMore?: () => void }
>(function PaginatedAutocompleteListbox({ children, onLoadMore, ...props }, ref) {
    const listRef = useRef<HTMLUListElement>(null);
    const sentinelRef = useRef<HTMLLIElement>(null);

    useImperativeHandle(ref, () => listRef.current as HTMLUListElement);
    useLoadMoreOnVisible(listRef, sentinelRef, onLoadMore);

    return (
        <ul ref={listRef} {...props}>
            {children}
            <li
                aria-hidden
                ref={sentinelRef}
                style={{ height: 1, padding: 0, margin: 0, listStyle: "none" }}
            />
        </ul>
    );
});