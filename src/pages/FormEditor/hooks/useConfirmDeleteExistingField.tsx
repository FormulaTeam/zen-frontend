import React, { useState } from "react";
import ConfirmDeleteDialog from "@src/components/BasePopup/ConfirmDeleteDialog";

export function useConfirmDeleteExistingField() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState<null | (() => void)>(null);

  const requestConfirm = (onConfirmAction: () => void) => {
    setOnConfirm(() => onConfirmAction);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    onConfirm?.();
    setConfirmOpen(false);
    setOnConfirm(null);
  };

  const handleClose = () => {
    setConfirmOpen(false);
    setOnConfirm(null);
  };

  const ConfirmDialog =
    confirmOpen && onConfirm ? (
      <ConfirmDeleteDialog
        open={confirmOpen}
        title="אזהרה"
        message="מחיקת שדה זה תסיר גם את כל הנתונים שנאספו תחתיו. פעולה זו היא בלתי הפיכה. האם ברצונך להמשיך?"
        onConfirm={handleConfirm}
        onClose={handleClose}
        confirmText="מחק שדה"
        cancelText="בטל"
      />
    ) : null;

  return { requestConfirm, ConfirmDialog };
}
