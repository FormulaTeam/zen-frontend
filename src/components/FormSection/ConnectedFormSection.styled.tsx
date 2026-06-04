import Box, { BoxProps } from "@mui/material/Box";
import Divider, { DividerProps } from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import Typography, { TypographyProps } from "@mui/material/Typography";

export const ConnectedFormWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  width: "100%",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(3),
  marginTop: theme.spacing(2),
}));

export const ConnectedFormFieldsWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  width: "100%",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

export const ConnectedResponseDivider = styled(Divider)<DividerProps>(({ theme }) => ({
  width: "100%",
  margin: theme.spacing(4, 0),
  borderImageSource: `linear-gradient(to left, ${theme.palette.white}, ${theme.palette.input?.border}, ${theme.palette.white})`,
  borderImageSlice: 1,
}));

export const ConnectedFormTitle = styled(Typography)<TypographyProps>(({ theme }) => ({
  alignSelf: "flex-start",
  fontSize: "1.25rem",
  fontWeight: 600,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));
