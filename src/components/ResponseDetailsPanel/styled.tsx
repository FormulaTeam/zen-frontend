import Box, { BoxProps } from "@mui/material/Box";
import Link, { LinkProps } from "@mui/material/Link";
import Paper, { PaperProps } from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import TableCell, { TableCellProps } from "@mui/material/TableCell";
import Typography, { TypographyProps } from "@mui/material/Typography";

export const DetailsRowContainer = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  alignItems: "start",
  flexDirection: "column",
  width: "100%",
  gap: theme.spacing(1),
}));

export const DetailsResponseContainer = styled(Paper)<PaperProps>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  width: "100%",
  gap: theme.spacing(1),
}));

export const ResponseTitle = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  color: "inherit",
  display: "flex",
  alignItems: "center",
}));

export const ResponseCell = styled(TableCell)<TableCellProps>(({ theme }) => ({
  textAlign: "start",
  // First cell is for the view button, no need for it to take full width
  "&:first-of-type": {
    width: 90,
  },
}));
