import Box, { BoxProps } from "@mui/material/Box";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";

export const DetailsFieldsContainer = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2),
  width: "100%",
  gap: theme.spacing(4),
}));
export const FieldContainer = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  textAlign: "start",
}));

export const OpenResponseButton = styled(IconButton)<IconButtonProps>(({ theme }) => ({
  scale: 0.8,
  color: theme.palette.primary.main,
}));
