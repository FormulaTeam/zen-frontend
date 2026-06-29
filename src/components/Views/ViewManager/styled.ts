import styled from "styled-components";
import { Box, Paper, Typography, Card, CardContent, Button } from "@mui/material";

export const ViewManagerContainer = styled(Box)`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

// Saved Views Section
export const SavedViewsTitle = styled(Typography)`
  margin-top: 16px;
`;

export const SavedViewsContainer = styled(Box)`
  margin-bottom: 24px;
`;

export const SectionTitle = styled(Typography)`
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const ViewCard = styled(Paper)<{ $isSelected?: boolean }>`
  margin-bottom: 12px;
  cursor: pointer;
  border-radius: 12px !important;
  border: ${(props) => (props.$isSelected ? "2px solid #1976d2" : "1px solid #e2e8f0")} !important;
  box-shadow: none !important;
  transition: all 0.16s ease !important;
  background-color: ${(props) => (props.$isSelected ? "#f0f7ff" : "#ffffff")} !important;

  &:hover {
    background-color: ${(props) => (props.$isSelected ? "#f0f7ff" : "#f8fafc")} !important;
    border-color: ${(props) => (props.$isSelected ? "#1976d2" : "#cbd5e1")} !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ViewCardContent = styled(CardContent)`
  padding: 14px 16px !important;
  &:last-child {
    padding-bottom: 14px !important;
  }
`;

export const ViewCardActions = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const ViewCardInfo = styled(Box)`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ViewCardButtons = styled(Box)`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const ViewNameTypography = styled(Typography)<{ $isDefault?: boolean }>`
  font-weight: ${(props) => (props.$isDefault ? 700 : 600)} !important;
  font-size: 1rem !important;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ViewChipsContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
`;

// Create New View Section
export const CreateNewViewContainer = styled(Box)`
  margin: 24px 0;
  padding: 0 4px;
`;

export const CreateNewViewButton = styled(Button)`
  width: 100%;
  height: 44px;
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
  transition: all 0.16s ease !important;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    transform: translateY(-1px);
  }
`;

// Create/Edit View Section
export const ViewFormHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
`;

export const ViewFormTitle = styled(Typography)`
  margin-bottom: 0 !important;
  font-weight: 700 !important;
  color: #0f172a !important;
`;

export const ViewFormContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
`;

export const ViewFormDivider = styled(Box)`
  height: 1px;
  background-color: #e2e8f0;
  margin: 8px 0;
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
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background-color: #ffffff;
  overflow: hidden;
`;

export const ColumnsHeader = styled(Box)`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 2;
`;

export const ColumnHeaderItem = styled(Box)<{ width?: string; flex?: number; textAlign?: string }>`
  ${(props) => props.width && `width: ${props.width};`}
  ${(props) => props.flex && `flex: ${props.flex};`}
  ${(props) => props.textAlign && `text-align: ${props.textAlign};`}
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

export const ColumnListItem = styled(Box)`
  padding: 0;
  border-bottom: 1px solid #f1f5f9;
  &:last-child {
    border-bottom: none;
  }
`;

export const ColumnItem = styled(Box)<{ $isDragging?: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: ${(props) => (props.$isDragging ? "#f1f5f9" : "white")};
  transition: background-color 0.16s ease;
  width: 100%;
  &:hover {
    background-color: #f8fafc;
  }
`;

export const DragHandle = styled(Box)`
  display: flex;
  align-items: center;
  margin-right: 8px;
  color: #94a3b8;
  cursor: grab;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background-color: #e2e8f0;
    color: #475569;
  }

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
  & .MuiTypography-root {
    font-weight: 600;
    color: #334155;
  }
`;

export const OrderBadge = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  background-color: #f1f5f9;
  color: #64748b;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  margin-right: 12px;
`;

// Action Buttons
export const ViewActionsContainer = styled(Box)`
  margin-top: 8px;
  display: flex;
  gap: 8px;
`;

export const SubtitlesTypography = styled(Typography)`
  font-weight: 700 !important;
  font-size: 0.85rem !important;
  color: #64748b !important;
  margin-bottom: 8px !important;
`;
