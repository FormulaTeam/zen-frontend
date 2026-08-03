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
import { PaintRoller, Trash2 } from "lucide-react";

export const colorRuleMenuPaperSx = {
  "& .MuiMenuItem-root": {
    fontSize: "1rem",
  },
};

export const ColorRulesDialog = styled(Dialog)`
  .MuiDialog-paper {
    outline: none;
    max-width: 1320px;
    width: 100%;
    background-color: #f1f5f9;
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

export const DeleteRuleIcon = styled(Trash2)`
  width: 20px;
  height: 20px;
  color: #e7000b;
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

export const EmptyStateIconWrapper = styled(Box)`
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 8px;
  background-color: #e3f2fd;
  border: 1px solid #bbdefb;
`;

export const EmptyStateIcon = styled(PaintRoller)`
  width: 46px;
  height: 46px;
  color: #1e88e5;
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
  flex: 1;
  min-width: 0;
  overflow-x: scroll;
  overflow-y: scroll !important;
  height: 100%;
  padding-top: 8px;
  padding-inline: 10px 8px;
  padding-bottom: 10px;
  scrollbar-width: none !important;
  -ms-overflow-style: auto !important;

  &::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
  }
`;

export const RulesTableOuter = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
  min-width: 0;
`;

export const RulesTableScrollArea = styled(Box)`
  display: flex;
  gap: 10px;
  max-height: 360px;
  min-height: 0;
  min-width: 0;
`;

export const RulesScrollbarRail = styled(Box)`
  position: relative;
  flex: 0 0 8px;
  height: 100%;
  border-radius: 9999px;
  background-color: #f1f1f1;
  cursor: default;
`;

export const RulesScrollbarThumb = styled(Box)`
  position: absolute;
  inset-inline: 0;
  border-radius: 9999px;
  background-color: #c3c0c0;
  cursor: default;

  &:active {
    cursor: default;
    background-color: #aaa7a7;
  }
`;

export const RulesScrollbarRailHorizontal = styled(Box)`
  position: relative;
  flex: 0 0 8px;
  width: 100%;
  border-radius: 9999px;
  background-color: #f1f1f1;
  cursor: default;
`;

export const RulesScrollbarThumbHorizontal = styled(Box)`
  position: absolute;
  inset-block: 0;
  border-radius: 9999px;
  background-color: #c3c0c0;
  cursor: default;

  &:active {
    cursor: default;
    background-color: #aaa7a7;
  }
`;

export const RulesGrid = styled(Box)`
  display: grid;
  grid-template-columns: 24px minmax(120px, 0.9fr) minmax(135px, 0.95fr) minmax(260px, 2fr) 100px 74px 54px 32px;
  gap: 6px;
  width: 100%;
  min-width: 840px;

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

  /* Prevent the MuiTextField "paper" background from painting behind the
     helper/error text; only the actual input surface should be white. */
  .MuiFormControl-root,
  .MuiTextField-root {
    background-color: transparent !important;
  }

  /* Unify the height and outline of every value control in a rule row */
  .MuiOutlinedInput-root {
    min-height: 40px;
    height: 40px;
    background-color: #ffffff;
    border-radius: 4px;
  }

  /* Consistent inner padding across every control for a cohesive look */
  .MuiOutlinedInput-input,
  .MuiSelect-select {
    padding-inline: 14px !important;
    display: flex;
    align-items: center;
    font-size: 1rem !important;
  }

  .MuiAutocomplete-root .MuiOutlinedInput-root {
    padding-inline: 14px !important;
  }

  .MuiAutocomplete-root .MuiOutlinedInput-root .MuiAutocomplete-input {
    padding-inline: 0 !important;
    font-size: 1rem !important;
  }

  /* Smaller icons so the extra padding is visible */
  .MuiSelect-icon,
  .MuiAutocomplete-popupIndicator svg,
  .MuiAutocomplete-clearIndicator svg,
  .MuiIconButton-root svg {
    font-size: 22px;
    width: 22px;
    height: 22px;
  }

  .MuiOutlinedInput-notchedOutline {
    border-color: rgba(148, 163, 184, 0.35);
    border-radius: 4px;
  }

  .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
    border-color: rgba(148, 163, 184, 0.6);
  }

  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #1e8fe5;
    border-width: 1px;
  }

  .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline {
    border-color: #ef000b;
  }

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
    pointer-events: none;
    user-select: none;
  }
`;

export const AddRuleRow = styled(Box)`
  display: grid;
  grid-template-columns: 24px minmax(120px, 0.9fr) minmax(135px, 0.95fr) minmax(260px, 2fr) 100px 74px 54px 32px;
  gap: 6px;
  align-items: center;
  width: 100%;
  min-width: 840px;
  padding-top: 12px;
  padding-inline: 12px 18px;

  > * {
    min-width: 0;
  }
`;

export const ColorSelectValue = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  gap: 8px;
`;

export const RangeInputsWrapper = styled(Box) <{ $stacked?: boolean }>`
  display: flex;
  flex-direction: ${({ $stacked }) => ($stacked ? "column" : "row")};
  align-items: ${({ $stacked }) => ($stacked ? "stretch" : "flex-start")};
  gap: 6px;
  width: 100%;
  min-width: 0;
`;

export const RangeErrorColumn = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  width: 100%;
  min-width: 0;
`;

export const RangeInput = styled(Box)`
  display: flex;
  align-items: center;
  gap: 3px;
  width: 100%;
  min-width: 0;
`;

export const DateTimeSplitRow = styled(Box)`
  display: flex;
  align-items: stretch;
  gap: 6px;
  width: 100%;
  min-width: 0;
`;

/* Time is placed first (right side in RTL) and is narrower than the date */
export const DateTimeTimeSlot = styled(Box)`
  flex: 0 0 34%;
  min-width: 0;
  display: flex;
`;

export const DateTimeDateSlot = styled(Box)`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
`;

export const RangePrefix = styled("span")`
  flex: 0 0 auto;
  width: 24px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
`;

export const FieldPlaceholder = styled("span")`
  color: #94a3b8;
`;

export const FieldValueLabel = styled("span")`
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const FieldMenuItemLabel = styled("span")`
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ColorRulePickerWrapper = styled(Box) <{ $timeAlignRight?: boolean }>`
  width: 100%;
  min-width: 0;

  .MuiFormControl-root {
    width: 100%;
  }

  .MuiInputBase-root {
    height: 40px !important;
    min-height: 40px !important;
    max-height: 40px !important;
    box-sizing: border-box;
    align-items: center;
    padding-block: 0 !important;
    padding-inline: 10px !important;
    background-color: #ffffff;
    border: 1px solid rgba(148, 163, 184, 0.35);
    border-radius: 4px !important;
    overflow: hidden;
  }

  /* Vertically center the date/time sections within the 40px control */
  .MuiPickersInputBase-root,
  .MuiPickersInputBase-sectionsContainer,
  .MuiPickersSectionList-root {
    height: 40px !important;
    min-height: 40px !important;
    max-height: 40px !important;
    display: flex !important;
    align-items: center !important;
    padding-block: 0 !important;
    margin-block: 0 !important;
    line-height: 40px !important;
  }

  .MuiPickersInputBase-root .MuiPickersInputBase-sectionsContainer,
  .MuiPickersInputBase-root .MuiPickersSectionList-root {
    flex: 1 1 auto !important;
    width: 100% !important;
  }

  .MuiPickersSectionList-section,
  .MuiPickersSectionList-sectionContent,
  .MuiPickersSectionList-sectionSeparator,
  .MuiPickersInputBase-sectionsContainer,
  .MuiPickersSectionList-root,
  [contenteditable="true"],
  [role="spinbutton"] {
    display: inline-flex !important;
    align-items: center !important;
    height: 40px !important;
    line-height: 40px !important;
    font-size: 1rem !important;
  }

  /* Smaller picker icon so the extra padding is visible */
  .MuiIconButton-root {
    padding: 4px !important;
  }

  .MuiIconButton-root svg {
    font-size: 22px;
    width: 22px;
    height: 22px;
  }

  /* Space between the time/date text and the trailing icon */
  .MuiInputAdornment-root {
    margin-inline-start: 8px;
    height: 100% !important;
    max-height: none !important;
  }

  && .MuiInputBase-input {
    height: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding-block: 0 !important;
    text-align: right !important;
    font-size: 1rem !important;
  }

  .MuiInputBase-root::before {
    border: 0 !important;
    border-radius: 4px !important;
  }

  .MuiInputBase-root.Mui-error {
    border-color: #ef000b !important;
  }

  .MuiInputBase-root::after {
    border: 0 !important;
    border-radius: 4px !important;
  }
`;

export const ColorSwatch = styled(Box) <{ $backgroundColor: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translateY(2px);
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
  width: 320px;
  padding: 16px 16px 14px;
  border-radius: 4px;
  background-color: #ffffff;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.16);

  &::before {
    content: "";
    position: absolute;
    inset-block-start: -8px;
    inset-inline-start: calc(50% - 10px);
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
  justify-content: flex-end;
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
