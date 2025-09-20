import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Icon, { IconProps } from "@mui/material/Icon";
import { styled } from "@mui/material/styles";

interface GridIconProps extends IconProps {
  selected?: boolean;
  hidePointer?: boolean;
}

export const IconsGridWrapper = styled(Box)(() => ({
  minHeight: "50vh",
  maxHeight: "50vh",
  position: "relative",
}));
export const IconsGridContainer = styled(Grid)(() => ({
  alignContent: "flex-start",
  justifyContent: "flex-start",
  minHeight: "35vh",
  maxHeight: "35vh",
  overflowY: "auto",
  marginBottom: "100px",
}));
export const loadingContainer = styled(Box)(() => ({
  minHeight: "50vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));
export const GridIcon = styled(Icon)<GridIconProps>(({ theme, selected, hidePointer = false }) => ({
  fontSize: 40,
  cursor: hidePointer ? "default" : "pointer",
  color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
  "&:hover": {
    color: "primary.main",
  },
}));


export const DialogActionWrapper = styled(Box)`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 0;
  button {
    width: 50%;
  }
`;