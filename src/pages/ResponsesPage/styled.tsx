import Box, { BoxProps } from "@mui/material/Box";
import Paper, { PaperProps } from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

export const DetailsContainer = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
  overflowY: "auto",
  width: "100%",
  gap: theme.spacing(1),
  padding: theme.spacing(2),
}));

interface LoadingBtnBoxProps {
  $bgColor: string;
}

export const LoadingBtnBox = styled(Box)<LoadingBtnBoxProps>`
  background-color: ${({ $bgColor }) => $bgColor};
  width: 39px;
  height: 39px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
