import React, { useEffect, useMemo, useRef } from "react";
import { Box, TableBody, TableContainer, TableHead, TableRow } from "@mui/material";

import { Row } from "@utils/interfaces";

import { FormDto, FormFieldDto } from "../../../../types/shared";
import { fieldType } from "formula-gear";
import { ChildResponseRow } from "./ChildResponseRow";
import { DetailsRowContainer, ResponseCell, ResponseTitle, StyledTable } from "./styled";

interface ChildResponsesPanelProps {
  responses: Row[];
  form: FormDto;
  title: string;
  parentFormId?: number;
  isInEditMode?: boolean;
  searchQuery?: string;
}

export const ChildResponsesPanel: React.FC<ChildResponsesPanelProps> = ({
  responses,
  form,
  parentFormId,
  title,
  isInEditMode = false,
  searchQuery,
}) => {
  const tableScrollerRef = useRef<HTMLDivElement | null>(null);
  const horizontalScrollbarTrackRef = useRef<HTMLDivElement | null>(null);
  const horizontalScrollbarThumbRef = useRef<HTMLDivElement | null>(null);
  const horizontalScrollbarFrame = useRef<number | null>(null);

  const displayFields = useMemo(() => {
    const sortedSections = [...(form.sections ?? [])]
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .map((section) => ({
        ...section,
        fields: [...(section.fields ?? [])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0)),
      }));

    return sortedSections
      .flatMap((section) => section.fields ?? [])
      .filter((field) => field.fieldType !== fieldType.Form);
  }, [form.sections]);

  const sortedResponses = useMemo(() => [...responses], [responses]);

  useEffect(() => {
    const scroller = tableScrollerRef.current;
    const track = horizontalScrollbarTrackRef.current;
    const thumb = horizontalScrollbarThumbRef.current;

    if (!scroller || !track || !thumb) return;

    let isDragging = false;
    let dragStartClientX = 0;
    let dragStartThumbLeft = 0;

    const getScrollRange = (element: HTMLElement) =>
      Math.max(element.scrollWidth - element.clientWidth, 0);

    const getNormalizedScrollLeft = (element: HTMLElement) => {
      const maxScrollLeft = getScrollRange(element);

      if (maxScrollLeft <= 0) return 0;

      const direction = window.getComputedStyle(element).direction;

      if (direction === "rtl") {
        return element.scrollLeft <= 0
          ? maxScrollLeft - Math.min(Math.abs(element.scrollLeft), maxScrollLeft)
          : Math.min(element.scrollLeft, maxScrollLeft);
      }

      return Math.min(Math.max(element.scrollLeft, 0), maxScrollLeft);
    };

    const setNormalizedScrollLeft = (element: HTMLElement, normalizedLeft: number) => {
      const maxScrollLeft = getScrollRange(element);
      const nextLeft = Math.min(Math.max(normalizedLeft, 0), maxScrollLeft);
      const direction = window.getComputedStyle(element).direction;

      if (direction === "rtl") {
        element.scrollLeft = element.scrollLeft <= 0 ? nextLeft - maxScrollLeft : nextLeft;
        return;
      }

      element.scrollLeft = nextLeft;
    };

    const updateHorizontalScrollbar = () => {
      if (horizontalScrollbarFrame.current !== null) return;

      horizontalScrollbarFrame.current = window.requestAnimationFrame(() => {
        horizontalScrollbarFrame.current = null;

        const maxScrollLeft = getScrollRange(scroller);

        if (maxScrollLeft <= 1) {
          track.style.display = "none";
          return;
        }

        const trackHeight = 14;
        const trackWidth = scroller.clientWidth;
        const thumbWidth = Math.max((scroller.clientWidth / scroller.scrollWidth) * trackWidth, 64);
        const maxThumbLeft = Math.max(trackWidth - thumbWidth, 0);
        const normalizedLeft = getNormalizedScrollLeft(scroller);
        const thumbLeft = maxScrollLeft > 0 ? (normalizedLeft / maxScrollLeft) * maxThumbLeft : 0;

        track.style.display = "block";
        track.style.left = "0px";
        track.style.right = "auto";
        track.style.bottom = "0px";
        track.style.width = `${trackWidth}px`;
        track.style.height = `${trackHeight}px`;

        thumb.style.left = "0px";
        thumb.style.right = "auto";
        thumb.style.width = `${thumbWidth}px`;
        thumb.style.transform = `translate3d(${thumbLeft}px, 0, 0)`;
      });
    };

    const getThumbLeft = () => {
      const transform = window.getComputedStyle(thumb).transform;
      if (!transform || transform === "none") return 0;

      const matrix = new DOMMatrixReadOnly(transform);
      return matrix.m41;
    };

    const scrollToThumbPosition = (thumbLeft: number) => {
      const maxThumbLeft = Math.max(track.clientWidth - thumb.offsetWidth, 0);
      const ratio =
        maxThumbLeft > 0 ? Math.min(Math.max(thumbLeft, 0), maxThumbLeft) / maxThumbLeft : 0;

      setNormalizedScrollLeft(scroller, ratio * getScrollRange(scroller));
    };

    const handleTrackPointerDown = (event: PointerEvent) => {
      event.preventDefault();

      const thumbRect = thumb.getBoundingClientRect();
      const nextThumbLeft =
        event.clientX - track.getBoundingClientRect().left - thumbRect.width / 2;

      scrollToThumbPosition(nextThumbLeft);
      updateHorizontalScrollbar();
    };

    const handleThumbPointerDown = (event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();

      isDragging = true;
      dragStartClientX = event.clientX;
      dragStartThumbLeft = getThumbLeft();
      thumb.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) return;

      event.preventDefault();
      scrollToThumbPosition(dragStartThumbLeft + event.clientX - dragStartClientX);
      updateHorizontalScrollbar();
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!isDragging) return;

      isDragging = false;
      thumb.releasePointerCapture(event.pointerId);
    };

    updateHorizontalScrollbar();
    scroller.addEventListener("scroll", updateHorizontalScrollbar, { passive: true });
    window.addEventListener("resize", updateHorizontalScrollbar);
    track.addEventListener("pointerdown", handleTrackPointerDown);
    thumb.addEventListener("pointerdown", handleThumbPointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      if (horizontalScrollbarFrame.current !== null) {
        window.cancelAnimationFrame(horizontalScrollbarFrame.current);
        horizontalScrollbarFrame.current = null;
      }

      scroller.removeEventListener("scroll", updateHorizontalScrollbar);
      window.removeEventListener("resize", updateHorizontalScrollbar);
      track.removeEventListener("pointerdown", handleTrackPointerDown);
      thumb.removeEventListener("pointerdown", handleThumbPointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [displayFields.length, sortedResponses.length, isInEditMode]);

  return (
    <DetailsRowContainer>
      <ResponseTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          flexWrap: "wrap",
        }}>
        {responses.length > 1 ? (
          <>
            <span dir="auto">{title}</span>
            <span style={{ whiteSpace: "nowrap" }}>- {responses.length} תגובות</span>
          </>
        ) : (
          <>
            <span dir="auto">{title}</span>
            <span style={{ whiteSpace: "nowrap" }}> - תגובה אחת</span>
          </>
        )}
      </ResponseTitle>
      <TableContainer
        ref={tableScrollerRef}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none !important",
          msOverflowStyle: "none",
          "&.MuiTableContainer-root": {
            scrollbarWidth: "none !important",
            msOverflowStyle: "none",
          },
          "&::-webkit-scrollbar, &.MuiTableContainer-root::-webkit-scrollbar": {
            width: "0px !important",
            height: "0px !important",
            display: "none !important",
          },
          "&::-webkit-scrollbar-thumb, &.MuiTableContainer-root::-webkit-scrollbar-thumb": {
            display: "none !important",
          },
          "&::-webkit-scrollbar-track, &.MuiTableContainer-root::-webkit-scrollbar-track": {
            display: "none !important",
          },
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        }}>
        <StyledTable isInEditMode={isInEditMode} size="small">
          <TableHead>
            <TableRow>
              <ResponseCell align="center" sx={{ width: "60px !important" }}>
                צפייה
              </ResponseCell>
              {displayFields.map((field: FormFieldDto) => (
                <ResponseCell key={field.id}>{field.displayName}</ResponseCell>
              ))}
              <ResponseCell sx={{ minWidth: "120px" }}>תאריך יצירה</ResponseCell>
              <ResponseCell sx={{ minWidth: "150px" }}>נוצר על ידי</ResponseCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedResponses.map((response) => (
              <ChildResponseRow
                response={response}
                linkedFormId={form.id}
                key={response.id}
                formFields={displayFields}
                parentFormId={parentFormId}
                searchQuery={searchQuery}
              />
            ))}
          </TableBody>
        </StyledTable>
      </TableContainer>
      <Box
        ref={horizontalScrollbarTrackRef}
        sx={{
          position: "absolute",
          display: "none",
          height: "14px",
          borderRadius: "999px",
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          direction: "ltr",
          cursor: "pointer",
          pointerEvents: "auto",
          zIndex: 20,
        }}>
        <Box
          ref={horizontalScrollbarThumbRef}
          sx={{
            position: "absolute",
            top: "2px",
            left: 0,
            height: "8px",
            minWidth: "64px",
            borderRadius: "999px",
            backgroundColor: "#cbd5e1",
            cursor: "grab",
            touchAction: "none",
            transform: "translate3d(0, 0, 0)",
            willChange: "transform",
            "&:hover": {
              backgroundColor: "#94a3b8",
            },
            "&:active": {
              cursor: "grabbing",
              backgroundColor: "#64748b",
            },
          }}
        />
      </Box>
    </DetailsRowContainer>
  );
};
