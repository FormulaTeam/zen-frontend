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
  flexShrink: 0,
});

export const TabsBox = styled(Box)({
  flex: 1,
  display: "flex",
  justifyContent: "center",
});

export const SortControlsBox = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "16px",
  flexShrink: 0,
});

export const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: "24px !important",
  fontWeight: 600,
  marginLeft: "10px",
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