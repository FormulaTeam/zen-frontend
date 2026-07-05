import { Box, Typography, Checkbox, List, Stack } from "@mui/material";
import { GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ViewColumn } from "../../../types/interfaces/tableViews.types";
import {
  ColumnInfo,
  OrderBadge,
  ColumnsContainer,
  ColumnsHeader,
  ColumnHeaderItem,
  ColumnListItem,
  ColumnItem,
  DragHandle,
  SubtitlesTypography,
} from "../ViewManager/styled";

interface ResponsesViewColumnsProps {
  columns: ViewColumn[];
  visibleCount: number;
  onToggleVisibility: (id: string) => void;
  onDragEnd: (result: any) => void;
}

export function ResponsesViewColumns({
  columns,
  visibleCount,
  onToggleVisibility,
  onDragEnd,
}: ResponsesViewColumnsProps) {
  const HebrewTitles = {
    SHOW_COLUMN: "הצג",
    COLUMN_TITLE: "שדה",
    ORDER_COLUMN: "סדר",
    VISIBLE_COLUMNS_TEXT: `בתצוגה זו יוצגו ${visibleCount} מתוך ${columns.length} השדות`,
  };

  return (
    <Box>
      <SubtitlesTypography mb={1}>{HebrewTitles.VISIBLE_COLUMNS_TEXT}</SubtitlesTypography>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="columns">
          {({ innerRef, placeholder, droppableProps }) => (
            <ColumnsContainer ref={innerRef} {...droppableProps}>
              <ColumnsHeader sx={{ justifyContent: "space-between" }}>
                <Stack direction="row" spacing={1.5}>
                  <ColumnHeaderItem>{HebrewTitles.SHOW_COLUMN}</ColumnHeaderItem>
                  <ColumnHeaderItem>{HebrewTitles.COLUMN_TITLE}</ColumnHeaderItem>
                </Stack>

                <ColumnHeaderItem mr={1.5}>{HebrewTitles.ORDER_COLUMN}</ColumnHeaderItem>
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
                          />

                          <ColumnInfo>
                            <Typography variant="body2">{displayName}</Typography>
                          </ColumnInfo>

                          <OrderBadge>{index + 1}</OrderBadge>

                          <DragHandle {...dragHandleProps}>
                            <GripVertical size={18} strokeWidth={2.4} />
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
}
