import React from "react";
import { Box, Typography, Checkbox, List, ListItem } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ViewColumn } from "../../types/interfaces/tableViews.types";
import {
  ColumnItem,
  DragHandle,
  ColumnInfo,
  OrderBadge,
  ColumnsContainer,
  ColumnsHeader,
  ColumnHeaderItem,
  ColumnListItem,
} from "../ViewManager/styled";

interface Props {
  columns: ViewColumn[];
  visibleCount: number;
  onToggleVisibility: (id: string) => void;
  onDragEnd: (result: any) => void;
}

const ViewFormColumns: React.FC<Props> = ({
  columns,
  visibleCount,
  onToggleVisibility,
  onDragEnd,
}) => {
  const VISIBLE_COLUMNS_TEXT = `בתצוגה זו יוצגו ${visibleCount} מתוך ${columns.length} השדות`;

  const tableHeaders = [
    { key: "SHOW_COLUMN", label: "הצג" },
    { key: "COLUMN_TITLE", label: "שדה" },
    { key: "ORDER_COLUMN", label: "סדר" },
  ];

  return (
    <Box>
      <Typography variant="subtitle2" mb={1}>
        {VISIBLE_COLUMNS_TEXT}
      </Typography>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="columns">
          {({ innerRef, placeholder, droppableProps }) => (
            <ColumnsContainer ref={innerRef} {...droppableProps}>
              <ColumnsHeader sx={{ justifyContent: "space-between" }}>
                {tableHeaders.map(({ key, label }) => (
                  <ColumnHeaderItem key={key}>{label}</ColumnHeaderItem>
                ))}
              </ColumnsHeader>
              <List dense>
                {columns.map(({ displayName, columnId, visible }, index) => (
                  <Draggable key={columnId} draggableId={columnId} index={index}>
                    {({ draggableProps, innerRef, dragHandleProps }, { isDragging }) => (
                      <ColumnListItem ref={innerRef} {...draggableProps}>
                        <ColumnItem $isDragging={isDragging}>
                          <Checkbox
                            checked={visible}
                            onChange={() => onToggleVisibility(columnId)}
                            size="small"
                          />

                          <ColumnInfo>
                            <Typography variant="body2">{displayName}</Typography>
                          </ColumnInfo>

                          <OrderBadge>{index + 1}</OrderBadge>
                          <DragHandle {...dragHandleProps}>
                            <DragIndicatorIcon fontSize="small" />
                          </DragHandle>
                        </ColumnItem>
                      </ColumnListItem>
                    )}
                  </Draggable>
                ))}
                {placeholder}
              </List>
            </ColumnsContainer>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default ViewFormColumns;
