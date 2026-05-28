import Box, { BoxProps } from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper, { PaperProps } from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

export const FieldsWrapper = styled(Paper)<PaperProps>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  width: "100%",
}));
interface SectionContainerProps extends PaperProps {
  hidden?: boolean;
}
export const SectionContainer = styled(Paper)<SectionContainerProps>(({ theme, hidden }) => ({
  display: hidden ? "none" : "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
}));
export const FormSectionsContainer = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  alignItems: "center",
  padding: theme.spacing(2),
}));

export const LoadingContainer = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  width: "100%",
  height: "100%",
  justifyContent: "center",
  padding: theme.spacing(2),
}));

interface LoadingBtnBoxProps {
  bgcolor: string;
}

export const LoadingBtnBox = styled(Box)<LoadingBtnBoxProps>`
  background-color: ${({ bgcolor }) => bgcolor};
  width: 95px;
  height: 39px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const PageContainer = styled(Container)`
  min-height: 100%;
  display: flex;
  flex-direction: column;
`;

export const Header = styled(Box)<{ backgroundColor: string }>`
  position: sticky;
  top: 0;
  z-index: 1100;
  background-color: ${({ backgroundColor }) => backgroundColor} !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
