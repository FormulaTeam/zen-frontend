import React, { useState, useCallback, useLayoutEffect, useEffect, useRef } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";

interface ExpandableLongTextProps {
  text: string;
  onToggle?: (isExpanded: boolean) => void;
  highlightedText?: React.ReactNode;
}

/**
 * A component that displays long text with truncation and an expand/collapse toggle.
 */
export const ExpandableLongText = ({
  text,
  onToggle,
  highlightedText,
}: ExpandableLongTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isButtonHoveredRef = useRef(false);
  const reopenTooltipTimeoutRef = useRef<number | null>(null);

  const clearReopenTooltipTimeout = useCallback(() => {
    if (reopenTooltipTimeoutRef.current !== null) {
      window.clearTimeout(reopenTooltipTimeoutRef.current);
      reopenTooltipTimeoutRef.current = null;
    }
  }, []);

  const checkOverflow = useCallback(() => {
    const element = containerRef.current;

    if (!element || isExpanded) return;

    const isOverflow = element.scrollWidth > element.clientWidth;
    setIsOverflowing(isOverflow);
  }, [isExpanded]);

  useLayoutEffect(() => {
    checkOverflow();

    const element = containerRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkOverflow, text, highlightedText]);

  useEffect(() => {
    return () => {
      clearReopenTooltipTimeout();
    };
  }, [clearReopenTooltipTimeout]);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    clearReopenTooltipTimeout();
    setIsTooltipOpen(false);
    e.currentTarget.blur();

    const newExpanded = !isExpanded;

    setIsExpanded(newExpanded);
    onToggle?.(newExpanded);

    reopenTooltipTimeoutRef.current = window.setTimeout(() => {
      if (isButtonHoveredRef.current) {
        setIsTooltipOpen(true);
      }
    }, 180);
  };

  const tooltipTitle = isExpanded ? "צמצם" : "הרחב";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        position: "relative",
        gap: 0.5,
        py: 1,
      }}>
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: isExpanded ? "visible" : "hidden",
          textOverflow: isExpanded ? "initial" : "ellipsis",
          whiteSpace: isExpanded ? "pre-wrap" : "nowrap",
          display: "block",
          wordBreak: isExpanded ? "break-word" : "initial",
          lineHeight: "1.5",
        }}>
        {highlightedText || text}
      </Box>

      {(isOverflowing || isExpanded) && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <Tooltip
            title={tooltipTitle}
            placement="top"
            arrow
            open={isTooltipOpen}
            disableFocusListener
            disableTouchListener
            disableInteractive>
            <IconButton
              size="small"
              aria-label={tooltipTitle}
              onMouseEnter={() => {
                isButtonHoveredRef.current = true;
                setIsTooltipOpen(true);
              }}
              onMouseLeave={() => {
                isButtonHoveredRef.current = false;
                clearReopenTooltipTimeout();
                setIsTooltipOpen(false);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                clearReopenTooltipTimeout();
                setIsTooltipOpen(false);
              }}
              onClick={handleToggle}
              sx={{
                width: 24,
                height: 24,
                padding: "2px",
                flexShrink: 0,
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                "& svg": {
                  transform: "rotate(45deg)",
                },
              }}>
              {isExpanded ? (
                <UnfoldLessIcon fontSize="small" />
              ) : (
                <UnfoldMoreIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};
