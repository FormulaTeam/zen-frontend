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
  return (
    <Box>
      <Typography variant="subtitle2" mb={1}>
        שדות ({visibleCount} יוצגו)
      </Typography>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="columns">
          {(provided) => (
            <ColumnsContainer ref={provided.innerRef} {...provided.droppableProps}>
              <ColumnsHeader>
                <ColumnHeaderItem width="60px">הצג</ColumnHeaderItem>
                <ColumnHeaderItem flex={1}>שדה</ColumnHeaderItem>
                <ColumnHeaderItem width="60px">סדר</ColumnHeaderItem>
                <ColumnHeaderItem width="30px" />
              </ColumnsHeader>

              <List dense>
                {columns.map((col, index) => (
                  <Draggable key={col.columnId} draggableId={col.columnId} index={index}>
                    {(p, s) => (
                      <ColumnListItem ref={p.innerRef} {...p.draggableProps}>
                        <ColumnItem $isDragging={s.isDragging}>
                          <Checkbox
                            checked={col.visible}
                            onChange={() => onToggleVisibility(col.columnId)}
                            size="small"
                          />

                          <ColumnInfo>
                            <Typography variant="body2">{col.displayName}</Typography>
                          </ColumnInfo>

                          <OrderBadge>{index + 1}</OrderBadge>
                          <DragHandle {...p.dragHandleProps}>
                            <DragIndicatorIcon fontSize="small" />
                          </DragHandle>
                        </ColumnItem>
                      </ColumnListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            </ColumnsContainer>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default ViewFormColumns;
