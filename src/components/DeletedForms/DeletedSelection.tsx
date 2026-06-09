import React from "react";
import { TopBar } from "../../pages/DeletedForms/styled";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { SelectionType } from "../../types/enums/filtersAndSorts.enum";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import CloseIcon from "@mui/icons-material/Close";

interface DeletedSelectionProps {
  selectedIds: (string | number)[];
  cancelSelection: () => void;
  onRestore: () => Promise<void>;
  selectionType?: SelectionType;
}

const DeletedSelection: React.FC<DeletedSelectionProps> = ({
  selectedIds,
  cancelSelection,
  onRestore,
  selectionType = SelectionType.Forms,
}) => {
  const theme = useTheme();
  const noun = selectionType === SelectionType.Responses ? "תגובה" : "טופס";
  const nounPlural = selectionType === SelectionType.Responses ? "תגובות" : "טפסים";

  return (
    <TopBar>
      <Typography variant="subtitle1" fontWeight={600} color={theme.palette.primary.main}>
        {selectedIds.length}{" "}
        {selectedIds.length > 1
          ? `${nounPlural} נבחרו לשחזור`
          : `${noun} ${selectionType === SelectionType.Responses ? "נבחרה" : "נבחר"} לשחזור`}
      </Typography>
      <Box display="flex" gap={1.5}>
        <Button
          variant="outlined"
          onClick={cancelSelection}
          startIcon={<CloseIcon />}
          sx={{ borderRadius: "8px", border: "none", "&:hover": { border: "none", backgroundColor: "rgba(0,0,0,0.04)" } }}>
          בטל בחירה
        </Button>
        <Button
          variant="contained"
          onClick={onRestore}
          startIcon={<RestoreFromTrashIcon />}
          sx={{ borderRadius: "8px", boxShadow: "none" }}>
          שחזור {selectedIds.length > 1 ? nounPlural : noun}
        </Button>
      </Box>
    </TopBar>
  );
};

export default DeletedSelection;
