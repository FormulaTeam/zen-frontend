import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { ScrollbarState } from "./SupportPopup.types";

type UseSupportPopupScrollbarParams = {
  isOpen: boolean;
  refreshKey: unknown;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const useSupportPopupScrollbar = ({
  isOpen,
  refreshKey,
}: UseSupportPopupScrollbarParams) => {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    startY: number;
    startThumbTop: number;
  } | null>(null);

  const [isDraggingScrollbar, setIsDraggingScrollbar] = useState(false);

  const [scrollbarState, setScrollbarState] = useState<ScrollbarState>({
    isScrollable: false,
    thumbHeight: 0,
    thumbTop: 0,
    canScrollUp: false,
    canScrollDown: false,
  });

  const updateScrollbar = useCallback(() => {
    const element = scrollAreaRef.current;

    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const isScrollable = scrollHeight > clientHeight + 1;

    if (!isScrollable) {
      setScrollbarState({
        isScrollable: false,
        thumbHeight: clientHeight,
        thumbTop: 0,
        canScrollUp: false,
        canScrollDown: false,
      });
      return;
    }

    const minThumbHeight = 48;
    const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, minThumbHeight);
    const maxThumbTop = clientHeight - thumbHeight;
    const maxScrollTop = scrollHeight - clientHeight;
    const thumbTop = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

    setScrollbarState({
      isScrollable: true,
      thumbHeight,
      thumbTop,
      canScrollUp: scrollTop > 1,
      canScrollDown: scrollTop + clientHeight < scrollHeight - 1,
    });
  }, []);

  const scrollToThumbTop = useCallback(
    (thumbTop: number) => {
      const element = scrollAreaRef.current;

      if (!element) return;

      const { scrollHeight, clientHeight } = element;
      const maxScrollTop = scrollHeight - clientHeight;
      const maxThumbTop = clientHeight - scrollbarState.thumbHeight;

      if (maxScrollTop <= 0 || maxThumbTop <= 0) return;

      element.scrollTop = (thumbTop / maxThumbTop) * maxScrollTop;
      updateScrollbar();
    },
    [scrollbarState.thumbHeight, updateScrollbar],
  );

  const handleScrollbarThumbPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!scrollbarState.isScrollable) return;

      event.preventDefault();
      event.stopPropagation();

      dragStateRef.current = {
        startY: event.clientY,
        startThumbTop: scrollbarState.thumbTop,
      };

      setIsDraggingScrollbar(true);
    },
    [scrollbarState.isScrollable, scrollbarState.thumbTop],
  );

  const handleScrollbarTrackPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!scrollbarState.isScrollable) return;

      const element = scrollAreaRef.current;

      if (!element) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const clickY = event.clientY - rect.top;
      const maxThumbTop = element.clientHeight - scrollbarState.thumbHeight;
      const nextThumbTop = clamp(clickY - scrollbarState.thumbHeight / 2, 0, maxThumbTop);

      scrollToThumbTop(nextThumbTop);
    },
    [scrollbarState.isScrollable, scrollbarState.thumbHeight, scrollToThumbTop],
  );

  useEffect(() => {
    if (!isOpen) return;

    const animationFrameId = window.requestAnimationFrame(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = 0;
      }

      updateScrollbar();
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, updateScrollbar]);

  useEffect(() => {
    if (!isOpen) return;

    const animationFrameId = window.requestAnimationFrame(updateScrollbar);
    const element = scrollAreaRef.current;
    const resizeObserver = new ResizeObserver(updateScrollbar);

    if (element) {
      resizeObserver.observe(element);

      if (element.firstElementChild) {
        resizeObserver.observe(element.firstElementChild);
      }
    }

    window.addEventListener("resize", updateScrollbar);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollbar);
    };
  }, [isOpen, refreshKey, updateScrollbar]);

  useEffect(() => {
    if (!isDraggingScrollbar) return;

    const previousUserSelect = document.body.style.userSelect;

    document.body.style.userSelect = "none";

    const handlePointerMove = (event: PointerEvent) => {
      const element = scrollAreaRef.current;
      const dragState = dragStateRef.current;

      if (!element || !dragState) return;

      const maxThumbTop = element.clientHeight - scrollbarState.thumbHeight;

      if (maxThumbTop <= 0) return;

      const nextThumbTop = clamp(
        dragState.startThumbTop + event.clientY - dragState.startY,
        0,
        maxThumbTop,
      );

      scrollToThumbTop(nextThumbTop);
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
      setIsDraggingScrollbar(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDraggingScrollbar, scrollbarState.thumbHeight, scrollToThumbTop]);

  return {
    scrollAreaRef,
    scrollbarState,
    isDraggingScrollbar,
    updateScrollbar,
    handleScrollbarThumbPointerDown,
    handleScrollbarTrackPointerDown,
  };
};
