import React, { useState } from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Collapse, IconButton, Box, Typography } from "@mui/material";

import { ConnectedFormSegmentBox, SegmentHeaderContainer, ResponseCountBadge } from "./ConnectedFormSection.styled";

/**
 * Props for the ConnectedFormSegment component.
 */
interface ConnectedFormSegmentProps {
  /** The title of the form segment. */
  title: string;
  /** The number of responses in this segment. */
  count: number;
  /** The content to be displayed within the collapsible segment. */
  children: React.ReactNode;
}

/**
 * A collapsible segment component for connected forms that displays a title,
 * a response count badge, and a toggle button.
 */
export const ConnectedFormSegment: React.FC<ConnectedFormSegmentProps> = ({ title, count, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <ConnectedFormSegmentBox>
      <SegmentHeaderContainer onClick={toggleExpansion}>
        <Box display="flex" alignItems="center">
          <Typography variant="h6" fontWeight={600} color="textSecondary">
            {title}
          </Typography>

          <ResponseCountBadge>{count} תגובות</ResponseCountBadge>
        </Box>

        <IconButton size="small">
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </SegmentHeaderContainer>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {children}
        </Box>
      </Collapse>
    </ConnectedFormSegmentBox>
  );
};

export default ConnectedFormSegment;
