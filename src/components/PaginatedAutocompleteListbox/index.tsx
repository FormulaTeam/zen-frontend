import React, { useState, useCallback, useLayoutEffect, useRef } from "react";
import { useLoadMoreOnVisible } from "@src/pages/ResponsesPage/hooks/useLoadMoreOnVisible";
import {
  ListboxContainer,
  ScrollableListbox,
  ScrollbarThumb,
  ScrollbarTrack,
} from "./styled";

export const PaginatedAutocompleteListbox = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement> & {
    onLoadMore?: () => void;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    ownerState?: any;
  }
>(function Listbox(props, ref) {
  const {
    children,
    onLoadMore,
    hasNextPage,
    isFetchingNextPage,
    ownerState,
    ...otherProps
  } = props;
  const canLoadMore = hasNextPage ?? Boolean(onLoadMore);
  const [rootNode, setRootNode] = useState<HTMLElement | null>(null);
  const [sentinelNode, setSentinelNode] = useState<HTMLElement | null>(null);
  const [scrollbar, setScrollbar] = useState({ visible: false, top: 0, height: 0 });
  const [isScrollbarHovered, setIsScrollbarHovered] = useState(false);
  const [isScrollbarDragging, setIsScrollbarDragging] = useState(false);
  const scrollbarTrackRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{ pointerId: number; startY: number; startTop: number } | null>(null);

  const updateScrollbar = useCallback((node: HTMLElement | null) => {
    if (!node || node.scrollHeight <= node.clientHeight) {
      setScrollbar({ visible: false, top: 0, height: 0 });
      return;
    }

    const trackHeight = node.clientHeight - 8;
    const height = Math.max(48, (node.clientHeight / node.scrollHeight) * trackHeight);
    const maxScrollTop = node.scrollHeight - node.clientHeight;
    const maxThumbTop = trackHeight - height;
    const top = (node.scrollTop / maxScrollTop) * maxThumbTop;

    setScrollbar({ visible: true, top, height });
  }, []);

  const rootRef = useCallback(
    (node: HTMLUListElement | null) => {
      setRootNode(node);
      updateScrollbar(node);
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref, updateScrollbar],
  );

  const sentinelRef = useCallback((node: HTMLLIElement | null) => {
    setSentinelNode(node);
  }, []);

  useLoadMoreOnVisible(rootNode, sentinelNode, onLoadMore, !isFetchingNextPage && canLoadMore);

  useLayoutEffect(() => {
    if (!rootNode) return;

    updateScrollbar(rootNode);
    const resizeObserver = new ResizeObserver(() => updateScrollbar(rootNode));
    resizeObserver.observe(rootNode);

    return () => resizeObserver.disconnect();
  }, [children, rootNode, updateScrollbar]);

  const handleScroll = (event: React.UIEvent<HTMLUListElement>) => {
    updateScrollbar(event.currentTarget);
    otherProps.onScroll?.(event);
  };

  const scrollToThumbTop = (nextTop: number) => {
    const track = scrollbarTrackRef.current;

    if (!rootNode || !track) return;

    const maxThumbTop = Math.max(track.clientHeight - scrollbar.height, 0);
    const clampedTop = Math.min(Math.max(nextTop, 0), maxThumbTop);
    const maxScrollTop = Math.max(rootNode.scrollHeight - rootNode.clientHeight, 0);

    rootNode.scrollTop = maxThumbTop > 0 ? (clampedTop / maxThumbTop) * maxScrollTop : 0;
    updateScrollbar(rootNode);
  };

  const handleTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const trackRect = event.currentTarget.getBoundingClientRect();
    scrollToThumbTop(event.clientY - trackRect.top - scrollbar.height / 2);
  };

  const handleThumbPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    dragStateRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startTop: scrollbar.top,
    };
    setIsScrollbarDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleThumbPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) return;

    event.preventDefault();
    scrollToThumbTop(dragState.startTop + event.clientY - dragState.startY);
  };

  const handleThumbPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return;

    dragStateRef.current = null;
    setIsScrollbarDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <ListboxContainer>
      <ScrollableListbox
        ref={rootRef}
        {...otherProps}
        onScroll={handleScroll}
        className={[otherProps.className, "paginated-autocomplete-listbox"]
          .filter(Boolean)
          .join(" ")}
        style={{
          ...otherProps.style,
        }}>
        {children}
        {!isFetchingNextPage && canLoadMore && (
          <li
            aria-hidden
            ref={sentinelRef}
            style={{ height: 10, width: "100%", padding: 0, margin: 0, listStyle: "none" }}
          />
        )}
      </ScrollableListbox>

      {scrollbar.visible && (
        <ScrollbarTrack
          aria-hidden
          ref={scrollbarTrackRef}
          onPointerDown={handleTrackPointerDown}>
          <ScrollbarThumb
            $top={scrollbar.top}
            $height={scrollbar.height}
            $hovered={isScrollbarHovered}
            $dragging={isScrollbarDragging}
            onPointerDown={handleThumbPointerDown}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
            onPointerCancel={handleThumbPointerUp}
            onMouseEnter={() => setIsScrollbarHovered(true)}
            onMouseLeave={() => setIsScrollbarHovered(false)}
          />
        </ScrollbarTrack>
      )}
    </ListboxContainer>
  );
});
