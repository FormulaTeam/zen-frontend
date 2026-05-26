import React, { useState, useCallback, useLayoutEffect, useRef } from "react";
import { Tooltip, TooltipProps, Box } from "@mui/material";

interface OverflowTooltipProps extends Omit<TooltipProps, "title"> {
  title: string;
  children: React.ReactElement;
}

/**
 * A tooltip that only appears when its content overflows its container.
 * Wraps the child in a stable container to measure overflow without interfering with the child's refs.
 */
export const OverflowTooltip = ({ title, children, ...props }: OverflowTooltipProps) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkOverflow = useCallback(() => {
    if (containerRef.current) {
      const element = containerRef.current;
      const isOverflow = element.scrollWidth > element.clientWidth;
      setIsOverflowing(isOverflow);
    }
  }, []);

  useLayoutEffect(() => {
    checkOverflow();

    const element = containerRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkOverflow, title]);

  return (
    <Tooltip
      title={title}
      disableHoverListener={!isOverflowing}
      disableTouchListener={!isOverflowing}
      disableFocusListener={!isOverflowing}
      {...props}>
      <Box
        ref={containerRef}
        sx={{
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "block",
        }}>
        {children}
      </Box>
    </Tooltip>
  );
};
