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
        message="לתשומת לבך! ייתכן ושדה זה מכיל תוכן כחלק מהתגובות לטופס. לכן, מחיקת השדה תוביל למחיקה והסרת הנתונים מהטופס ללא יכולת שחזור. האם למחוק שדה זה מהטופס?"
        onConfirm={handleConfirm}
        onClose={handleClose}
        confirmText="מחק שדה"
        cancelText="בטל"
      />
    ) : null;

  return { requestConfirm, ConfirmDialog };
}
