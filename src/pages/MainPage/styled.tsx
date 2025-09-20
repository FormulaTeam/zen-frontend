import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

export const RowBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
}));

export const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: "24px !important",
  fontWeight: 600,
  marginLeft: "10px",
}));

export const CreateFormButton = styled("button")<{ $bgc?: string }>`
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