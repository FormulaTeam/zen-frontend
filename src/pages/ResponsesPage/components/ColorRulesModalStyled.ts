import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import styled from "styled-components";

export const ColorRulesDialog = styled(Dialog)`
  .MuiDialog-paper {
    outline: none;
  }

  .MuiDialog-paper:focus,
  .MuiDialog-paper:focus-visible,
  .MuiDialog-paper:active,
  .MuiDialogContent-root:focus,
  .MuiDialogContent-root:focus-visible,
  .MuiDialogContent-root:active {
    outline: none;
  }
`;

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
  width: 32px;
  height: 40px;
  padding: 4px !important;
  color: #ef000b !important;

  &:hover {
    background-color: rgba(239, 0, 11, 0.08) !important;
  }
`;

export const DeleteRuleIcon = styled.img`
  width: 20px;
  height: 20px;
`;

export const ModalContent = styled(DialogContent)`
  display: flex;
  flex-direction: column;
  height: 560px;
  min-height: 560px;

  &:focus,
  &:focus-visible,
  &:active {
    outline: none;
  }
`;

export const ModalDescription = styled(Typography)`
  color: #64748b;
  margin-bottom: 24px !important;
`;

export const EmptyStateContainer = styled(Box)`
  flex: 1;
  min-height: 360px;
  display: grid;
  place-items: center;
  padding-block: 32px 48px;
`;

export const EmptyStateContent = styled(Box)`
  display: grid;
  place-items: center;
  gap: 18px;
`;

export const EmptyStateIcon = styled.img`
  width: 46px;
  height: 46px;
`;

export const EmptyStateTitle = styled(Typography)`
  font-weight: 600 !important;
  padding-top: 8px !important;
`;

export const EmptyStateDescription = styled(Typography)`
  color: #475569;
  padding-bottom: 8px !important;
`;

export const RulesTableContainer = styled(Box)`
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 380px;
  padding-top: 8px;
  padding-inline: 4px;
  scrollbar-gutter: stable;
`;

export const RulesGrid = styled(Box)`
  display: grid;
  grid-template-columns: 24px minmax(145px, 1.1fr) minmax(120px, 0.85fr) minmax(165px, 1fr) 112px 78px 58px 32px;
  gap: 6px;
  width: 100%;
  min-width: 0;

  > * {
    min-width: 0;
  }
`;

export const RulesHeader = styled(RulesGrid)`
  align-items: center;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 700;
`;

export const RuleRow = styled(RulesGrid) <{
  $isDragging?: boolean;
  $isDragLocked?: boolean;
}>`
  align-items: start;
  margin-bottom: 12px;
  border: 1px solid transparent;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 2px;
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    box-shadow 120ms ease,
    opacity 120ms ease;

  ${({ $isDragging }) =>
    $isDragging
      ? `
        position: relative;
        z-index: 2;
        background-color: #ffffff;
        border-color: transparent;
        outline: 1px solid #1e8fe5;
        outline-offset: -1px;
        box-shadow: 0 4px 10px rgba(15, 23, 42, 0.12);
      `
      : ""}

  ${({ $isDragLocked }) =>
    $isDragLocked
      ? `
        opacity: 0.72;
      `
      : ""}
`;

export const DragHandle = styled(Box) <{ $isDragging?: boolean; $canDrag?: boolean }>`
  position: relative;
  width: 24px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  cursor: ${({ $canDrag, $isDragging }) => {
    if (!$canDrag) return "default";
    return $isDragging ? "grabbing" : "grab";
  }};
  user-select: none;

  svg {
    font-size: 18px;
  }
`;

export const AddRuleRow = styled(Box)`
  display: grid;
  grid-template-columns: 24px minmax(145px, 1.1fr) minmax(120px, 0.85fr) minmax(165px, 1fr) 112px 78px 58px 32px;
  gap: 6px;
  align-items: center;
  width: 100%;
  min-width: 0;
  padding-top: 8px;

  > * {
    min-width: 0;
  }
`;

export const ColorSelectValue = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 20px;
  gap: 8px;
`;

export const ColorSwatch = styled(Box) <{ $backgroundColor: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-block-start: 2px;
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
  margin-top: auto;

  svg {
    font-size: 16px;
    color: #64748b;
  }
`;

export const ModalActions = styled(DialogActions)`
  justify-content: space-between !important;
`;

export const AddRuleButton = styled(Button)`
  justify-self: start;
  min-width: auto !important;
  width: fit-content;
  font-weight: 700 !important;
  gap: 10px;
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
