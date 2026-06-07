import React, { useState, useCallback, useLayoutEffect, useRef } from "react";
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
export const ExpandableLongText = ({ text, onToggle, highlightedText }: ExpandableLongTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkOverflow = useCallback(() => {
    if (containerRef.current && !isExpanded) {
      const element = containerRef.current;
      const isOverflow = element.scrollWidth > element.clientWidth;
      setIsOverflowing(isOverflow);
    }
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
  }, [checkOverflow, text]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (onToggle) {
      onToggle(newExpanded);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: isExpanded ? "flex-start" : "center",
        width: "100%",
        position: "relative",
        gap: 0.5,
        py: isExpanded ? 1 : 0,
      }}
    >
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
        }}
      >
        {highlightedText || text}
      </Box>
      {(isOverflowing || isExpanded) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: isExpanded ? -0.5 : 0,
            flexShrink: 0,
          }}
        >
          <Tooltip title={isExpanded ? "צמצם" : "הרחב"}>
            <IconButton
              size="small"
              onClick={handleToggle}
              sx={{
                padding: "2px",
                
                transform: "rotate(45deg)",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
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
