import React, { useRef, useState, useEffect } from 'react';
import { Tooltip, TooltipProps } from '@mui/material';

interface OverflowTooltipProps extends Omit<TooltipProps, 'title'> {
  title: string;
  children: React.ReactElement;
}

export const OverflowTooltip: React.FC<OverflowTooltipProps> = ({ title, children, ...props }) => {
  const textElementRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (textElementRef.current) {
        setIsOverflowing(textElementRef.current.scrollWidth > textElementRef.current.clientWidth);
      }
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [title]);

  const clonedChild = React.cloneElement(children as React.ReactElement<any>, {
    ref: textElementRef,
    style: {
      ...((children as React.ReactElement<any>).props.style || {}),
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'block',
    }
  });

  return isOverflowing ? (
    <Tooltip title={title} {...props}>
      {clonedChild}
    </Tooltip>
  ) : (
    clonedChild
  );
};
