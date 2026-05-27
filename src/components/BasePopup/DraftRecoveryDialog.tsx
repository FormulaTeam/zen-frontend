import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

interface DraftRecoveryDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  onRestore: () => void;
  onDiscard: () => void;
}

const DraftRecoveryDialog: React.FC<DraftRecoveryDialogProps> = ({
  open,
  title = "שחזור שינויים שלא נשמרו",
  description = "מצאנו טיוטה עם שינויים שלא נשמרו. האם תרצה לשחזר אותם?",
  onRestore,
  onDiscard,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onDiscard}
      aria-labelledby="restore-draft-title"
      aria-describedby="restore-draft-description"
    >
      <DialogTitle id="restore-draft-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="restore-draft-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDiscard} color="inherit">
          התעלם והסר טיוטה
        </Button>
        <Button onClick={onRestore} color="primary" variant="contained" autoFocus>
          שחזור טיוטה
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DraftRecoveryDialog;
