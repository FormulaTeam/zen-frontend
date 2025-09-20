import React from "react";
import { TopBar } from "../../pages/DeletedForms/styled";
import { Box, Button, Typography } from "@mui/material";
import { SelectionType } from "../../types/enums/filtersAndSorts.enum";

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
  const noun = selectionType === SelectionType.Responses ? "תגובה" : "טופס";
  const nounPlural = selectionType === SelectionType.Responses ? "תגובות" : "טפסים";

  return (
    <TopBar>
      <Typography>
        {selectedIds.length}{" "}
        {selectedIds.length > 1
          ? `${nounPlural} נבחרו לשחזור`
          : `${noun} ${selectionType === SelectionType.Responses ? "נבחרה" : "נבחר"} לשחזור`}
      </Typography>
      <Box display="flex" gap={1}>
        <Button variant="outlined" onClick={cancelSelection}>
          בטל בחירה
        </Button>
        <Button variant="contained" onClick={onRestore}>
          שחזור {selectedIds.length > 1 ? nounPlural : noun}
        </Button>
      </Box>
    </TopBar>
  );
};

export default DeletedSelection;
