import React, { useState } from "react";
import {
  ConditionActions,
  ConditionItem,
  ContentWrapper,
  ConditionDescriptionText,
} from "./styled";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { Add, Delete, Edit } from "@mui/icons-material";
import Button from "@mui/material/Button";
import { FormField, ConditionGroup } from "../../utils/interfaces";
import { useConditionList } from "../../hooks/useConditionList";
import Box from "@mui/material/Box";
import ConfirmationPopover from "./ConfirmationPopover";

interface ConditionListProps {
  onSelect: () => void;
  formFields: FormField[];
  onEditCondition?: (conditions: ConditionGroup[], affectedFields: FormField[]) => void;
  onDeleteCondition?: (conditionId: string) => void;
}

const ConditionList: React.FC<ConditionListProps> = ({
  onSelect,
  formFields,
  onEditCondition,
  onDeleteCondition,
}) => {
  const { conditionGroups, getConditionDescription } = useConditionList({ formFields });
  const [deleteAnchorEl, setDeleteAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [conditionToDelete, setConditionToDelete] = useState<string | null>(null);

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>, conditionId: string) => {
    setDeleteAnchorEl(event.currentTarget);
    setConditionToDelete(conditionId);
  };

  const handleDeleteClose = () => {
    setDeleteAnchorEl(null);
    setConditionToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (conditionToDelete) {
      onDeleteCondition?.(conditionToDelete);
    }
    setConditionToDelete(null);
  };

  const deletePopoverOpen = Boolean(deleteAnchorEl);

  return (
    <ContentWrapper>
      {conditionGroups.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            color: "text.secondary",
          }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            אין תנאים מוגדרים
          </Typography>
          <Typography variant="body2">לחץ על "הוספת התנייה חדשה" כדי להתחיל</Typography>
        </Box>
      ) : (
        conditionGroups.map((group, i) => (
          <ConditionItem key={group.id}>
            <Box>
              <Typography variant="h6">{group.name || `התנייה #${i + 1}`}</Typography>
              <ConditionDescriptionText variant="body2">
                {getConditionDescription(group.conditions, group.affectedFields)}
              </ConditionDescriptionText>
            </Box>
            <ConditionActions>
              <IconButton onClick={() => onEditCondition?.(group.conditions, group.affectedFields)}>
                <Edit />
              </IconButton>
              <IconButton onClick={(event) => handleDeleteClick(event, group.id)}>
                <Delete />
              </IconButton>
            </ConditionActions>
          </ConditionItem>
        ))
      )}

      <Button onClick={onSelect} variant="contained">
        הוספת התנייה חדשה
        <Add />
      </Button>

      {/* Delete Confirmation Popover */}
      <ConfirmationPopover
        open={deletePopoverOpen}
        anchorEl={deleteAnchorEl}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        title="מחיקת התנייה"
        message="האם אתה בטוח שברצונך למחוק את ההתנייה?"
        confirmText="מחק"
        cancelText="ביטול"
        confirmColor="error"
      />
    </ContentWrapper>
  );
};
export default ConditionList;
