import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

export const RowBox = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
});

export const GreetingBox = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
});

export const TabsBox = styled(Box)({
  display: "flex",
  justifyContent: "center",
  flexShrink: 0,
});

export const SortControlsBox = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "16px",
  flex: 1,
  justifyContent: "flex-end",
});

export const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: "20px !important",
  fontWeight: 600,
}));

export const CreateFormButton = styled("button") <{ $bgc?: string }>`
  background-color: ${({ $bgc }) => $bgc};
  color: white;
  padding: 5px 10px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 140px;
`;

export const PrimaryBlueButton = styled("button")(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "white",
  height: "40px",
  padding: "0 30px",
  fontSize: "16px",
  fontWeight: 600,
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark || "#1565c0",
  },
}));