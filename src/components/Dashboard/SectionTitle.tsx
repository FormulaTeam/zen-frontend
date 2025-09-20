import React from "react";
import { Box, Typography, IconButton, Tooltip, tooltipClasses, TooltipProps } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import styled from "styled-components";

interface SectionTitleProps {
  tooltip: string;
  children: React.ReactNode;
}

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))`
  & .${tooltipClasses.tooltip} {
    white-space: pre-line;
  }
`;

const SectionTitle: React.FC<SectionTitleProps> = ({ tooltip, children }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
    <Typography variant="h6" gutterBottom m={0}>
      {children}
    </Typography>

    <StyledTooltip title={tooltip} placement="top" arrow>
      <IconButton size="small">
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
    </StyledTooltip>
  </Box>
);

export default SectionTitle;
