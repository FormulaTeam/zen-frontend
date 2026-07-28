import { Tooltip } from "@mui/material";
import { cloneElement, ReactElement, useLayoutEffect, useRef, useState } from "react";

type EllipsisTooltipProps = {
    text: string;
    children: ReactElement;
};

export const EllipsisTooltip = ({ text, children }: EllipsisTooltipProps): JSX.Element => {
    const ref = useRef<HTMLElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        const truncated = element.scrollWidth > element.clientWidth;
        setIsTruncated((prev) => (prev === truncated ? prev : truncated));
    });

    return (
        <Tooltip title={isTruncated ? text : ""} enterDelay={400} disableInteractive arrow>
            {cloneElement(children, { ref })}
        </Tooltip>
    );
};

export default EllipsisTooltip;
