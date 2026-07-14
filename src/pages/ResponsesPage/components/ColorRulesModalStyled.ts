import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import styled from "styled-components";

export const ModalTitle = styled(DialogTitle)`
  position: relative;
  display: flex;
  justify-content: center;
  font-weight: 600 !important;
  padding-bottom: 0 !important;
`;

export const TitleContent = styled(Box)`
  display: inline-flex;
  align-items: center;
  text-align: center;
  gap: 8px;
  font-size: 30px;
`;

export const CloseButton = styled(IconButton)`
  position: absolute !important;
  left: 0px;
  top: 0px;
  width: 32px;
  height: 32px;
  padding: 4px !important;

  svg {
    font-size: 20px;
  }
`;

export const DeleteRuleButton = styled(IconButton)`
  width: 40px;
  height: 40px;
  padding: 8px !important;
  color: #ef000b !important;

  svg {
    font-size: 24px;
  }

  &:hover {
    background-color: rgba(239, 0, 11, 0.08) !important;
  }
`;

export const ModalContent = styled(DialogContent)`
  min-height: 430px;
`;

export const ModalDescription = styled(Typography)`
  color: #64748b;
  margin-bottom: 24px !important;
  font-size: 16 !important;
`;

export const EmptyStateContainer = styled(Box)`
  min-height: 280px;
  display: grid;
  place-items: center;
  gap: 16px;
`;

export const EmptyStateContent = styled(Box)`
  display: grid;
  place-items: center;
  gap: 12px;
`;

export const EmptyStateIcon = styled.img`
  width: 46px;
  height: 46px;
`;

export const EmptyStateTitle = styled(Typography)`
  font-weight: 600 !important;
  padding-top: 5px !important;
`;

export const EmptyStateDescription = styled(Typography)`
  color: #475569;
  padding-bottom: 5px !important;
`;

export const RulesTableContainer = styled(Box)`
  overflow-x: auto;
  padding-top: 8px;
`;

export const RulesGrid = styled(Box)`
  display: grid;
  grid-template-columns: 24px minmax(180px, 1.15fr) minmax(160px, 0.9fr) minmax(220px, 1.15fr) 150px 120px 72px 42px;
  gap: 8px;
  min-width: 1120px;
`;

export const RulesHeader = styled(RulesGrid)`
  align-items: center;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 700;
`;

export const RuleRow = styled(RulesGrid)`
  align-items: start;
  margin-bottom: 12px;
`;

export const DragHandle = styled(Box)`
  width: 24px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  cursor: grab;

  svg {
    font-size: 18px;
  }
`;

export const AddRuleRow = styled(Box)`
  min-width: 1120px;
  padding-top: 8px;
`;

export const ColorSelectValue = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ColorSwatch = styled(Box) <{ $backgroundColor: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
`;

export const ColorMenuSwatch = styled(Box) <{ $backgroundColor: string }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-left: 8px;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
`;

export const OverlapNotice = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  color: #64748b;
  margin-top: 32px;

  svg {
    font-size: 16px;
    color: #64748b;
  }
`;

export const ModalActions = styled(DialogActions)`
  justify-content: space-between !important;
`;

export const AddRuleButton = styled(Button)`
  min-width: auto !important;
  font-weight: 700 !important;
  gap: 10px
`;

export const DeleteConfirmContent = styled(Box)`
  position: relative;
  width: 280px;
  padding: 16px 16px 14px;
  border-radius: 4px;
  background-color: #ffffff;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.16);

  &::before {
    content: "";
    position: absolute;
    inset-block-start: -8px;
    inset-inline-start: 50%;
    width: 16px;
    height: 16px;
    background-color: #ffffff;
    transform: translateX(-50%) rotate(45deg);
    box-shadow: -2px -2px 3px rgba(15, 23, 42, 0.04);
  }
`;

export const DeleteConfirmText = styled(Typography)`
  color: #0f172a;
  font-size: 18px !important;
  line-height: 1.6 !important;
  font-weight: 500 !important;
`;

export const DeleteConfirmActions = styled(Box)`
  display: flex;
  gap: 10px;
  margin-top: 18px;
`;

export const DeleteConfirmButton = styled(Button)`
  min-width: 86px !important;
  height: 44px;
  border-radius: 6px !important;
  background-color: #ef000b !important;
  color: #ffffff !important;
  font-weight: 700 !important;

  &:hover {
    background-color: #d9000a !important;
  }
`;

export const DeleteCancelButton = styled(Button)`
  min-width: 86px !important;
  height: 44px;
  border-radius: 6px !important;
  background-color: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #dbe3ec !important;
  font-weight: 700 !important;
`;

export const ActionButtons = styled(Box)`
  display: flex;
  gap: 12px;
`;

export const CancelButton = styled(Button)`
  min-width: 86px !important;
  height: 42px;
  padding: 0 22px !important;
  border-radius: 8px !important;
  background-color: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #dbe3ec !important;
  font-weight: 600 !important;
  line-height: 1 !important;
`;

export const SaveButton = styled(Button)`
  min-width: 100px !important;
  height: 42px;
  padding: 0 22px !important;
  border-radius: 8px !important;
  background-color: #1e8fe5 !important;
  color: #ffffff !important;
  border: 0 !important;
  box-shadow: none !important;
  font-weight: 800 !important;
  line-height: 1 !important;

  &:hover {
    background-color: #187fd0 !important;
    box-shadow: none !important;
  }

  &.Mui-disabled {
    background-color: #86c3ef !important;
    color: #ffffff !important;
    opacity: 1;
  }
`;
