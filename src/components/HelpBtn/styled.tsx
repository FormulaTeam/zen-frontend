import { Box, Button, Divider, List, Typography } from "@mui/material";
import styled from "styled-components";
import { styled as muiStyled } from "@mui/material/styles";
import ListItem, { ListItemProps } from "@mui/material/ListItem";

export const HelpButton = styled(Button)`
  z-index: 9999 !important;
  border-radius: 50% !important;
  background: white !important;
  width: 50px !important;
  min-width: 50px !important;
  height: 50px !important;
  position: fixed !important;
  bottom: 10px !important;
  right: 97vw;
  color: white !important;
  background-color: #1976d2 !important;
  cursor: pointer !important;
  box-shadow: 0 5px 15px rgba(0, 123, 255, 0.4) !important;
  &:hover {
    background-color: white !important;
    color: #1976d2 !important;
  }
`;

export const ContainerDiv = styled(Box)`
  position: absolute;
  width: 100%;
  height: 100vh;
  background-color: transparent;
  z-index: 9999 !important;
`;

export const HelpCardContainer = styled(Box)`
  position: fixed;
  top: 0%;
  left: 0%;
  background: rgba(3, 3, 3, 0.5);
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  overflow: hidden;
`;
export const HelpCard = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 0px !important;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  width: 600px;
  height: 750px;
  min-height: 750px;
  max-height: 750px;
  z-index: 1000;
  overflow-y: hidden;
  padding: 1rem;
`;

export const HelpCardTitle = muiStyled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  fontSize: "30px !important",
  background: theme.palette.primary.main,
  color: theme.palette.white,
  padding: "5px",
  paddingRight: "10px",
}));

export const HelpCardSubTitle = muiStyled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  color: theme.palette.text.primary,
  fontSize: "20px !important",
  marginTop: "15px",
}));

export const HelpCardDivider = styled(Divider)`
  margin-top: 10px !important;
  margin-bottom: 20px !important;
  width: 100%;
  border-color: black;
`;

export const HelpQandAList = styled(List)`
  min-height: 500px;
  max-height: 500px;
  overflow-y: auto;
`;
export const HelpQandABox = styled(Box)`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

export const QuestionTitle = muiStyled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  fontSize: "18px !important",
  color: theme.palette.text.primary,
}));

export const AnswerBox = styled(Box)`
  mt: 1;
  max-height: 150px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5;
`;

export const RegularAnswerText = muiStyled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: "18px !important",
}));

interface QandAListItemProps extends ListItemProps {
  $selected?: boolean; // 🔒 Use $ prefix to indicate styling-only prop
}

export const QandAListItem = styled(ListItem)<QandAListItemProps>(({ $selected, theme }) => ({
  flexDirection: "column",
  alignItems: "flex-start",
  borderRadius: 1,
  backgroundColor: $selected ? "rgba(0, 0, 0, 0.05)" : "transparent",
  transition: "background-color 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: $selected ? "rgba(0, 0, 0, 0.08)" : "rgba(0, 0, 0, 0.03)",
  },
}));
