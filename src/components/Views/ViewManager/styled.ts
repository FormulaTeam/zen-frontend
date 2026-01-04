import styled from "styled-components";
import { Box, Paper, Typography, Card, CardContent, Button } from "@mui/material";

export const ViewManagerContainer = styled(Box)`
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

// Saved Views Section
export const SavedViewsTitle = styled(Typography)`
  margin-top: 16px;
`;

export const SavedViewsContainer = styled(Box)`
  margin-bottom: 24px;
`;

export const ViewCard = styled(Card)`
  margin-bottom: 8px;
`;

export const ViewCardContent = styled(CardContent)`
  padding: 8px 16px !important;
`;

export const ViewCardActions = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ViewCardInfo = styled(Box)``;

export const ViewCardButtons = styled(Box)``;

export const ViewNameTypography = styled(Typography)<{ $isDefault?: boolean }>`
  font-weight: ${(props) => (props.$isDefault ? "bold" : "normal")};
`;

export const ViewChipsContainer = styled(Typography)`
  gap: 8px;
  display: flex;
  align-items: center;
  margin-top: 4px;
`;

// Create New View Section
export const CreateNewViewContainer = styled(Box)`
  margin: 24px 0;
`;

export const CreateNewViewButton = styled(Button)`
  width: 100%;
`;

// Create/Edit View Section
export const ViewFormHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0;
`;

export const ViewFormTitle = styled(Typography)`
  margin-bottom: 0 !important;
`;

export const ViewFormContainer = styled(Box)`
  margin-y: 24px;
`;

export const ViewFormDivider = styled(Box)`
  margin: 16px 0;
`;

// Columns Section
export const ColumnsMainContainer = styled(Box)`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const ColumnsContainer = styled(Box)`
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fafafa;
`;

export const ColumnsHeader = styled(Box)`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: rgba(225, 225, 225, 1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  position: sticky;
  top: 0;
  z-index: 1;
`;

export const ColumnHeaderItem = styled(Box)<{ width?: string; flex?: number; textAlign?: string }>`
  ${(props) => props.width && `width: ${props.width};`}
  ${(props) => props.flex && `flex: ${props.flex};`}
  ${(props) => props.textAlign && `text-align: ${props.textAlign};`}
  ${(props) => props.flex && `padding-left: 8px;`}
`;

export const ColumnListItem = styled(Box)`
  padding: 0;
`;

export const ColumnItem = styled(Paper)<{ $isDragging?: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: ${(props) => (props.$isDragging ? "#f5f5f5" : "white")};
  border: 1px solid ${(props) => (props.$isDragging ? "#2196f3" : "#e0e0e0")};
  border-radius: 8px;
  transition: all 0.2s ease;
  width: 100%;
  &:hover {
    background-color: #f5f5f5;
  }
`;

export const DragHandle = styled(Box)`
  display: flex;
  align-items: center;
  margin-right: 8px;
  color: #999;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

export const ColumnInfo = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  text-align: right;
  padding-right: 8px;
`;

export const OrderBadge = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
`;

// Action Buttons
export const ViewActionsContainer = styled(Box)`
  margin-top: 24px;
  display: flex;
  gap: 8px;
`;

export const SubtitlesTypography = styled(Typography)`
  variant="subtitle2"
  font-size: 25px;
`;
