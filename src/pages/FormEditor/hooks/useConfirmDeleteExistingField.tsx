import React, { useState } from "react";
import ConfirmPopup from "@src/popups/ConfirmPopup/ConfirmPopup";

export function useConfirmDeleteExistingField() {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [onConfirm, setOnConfirm] = useState<null | (() => void)>(null);

    const requestConfirm = (onConfirmAction: () => void) => {
        setOnConfirm(() => onConfirmAction);
        setConfirmOpen(true);
    };

    const ConfirmDialog = confirmOpen && onConfirm ? (
        <ConfirmPopup
            msg={
                "לתשומת לבך! ייתכן ושדה זה מכיל תוכן כחלק מהתגובות לטופס. לכן, מחיקת השדה תוביל למחיקה והסרת הנתונים מהטופס ללא יכולת שחזור. האם למחוק שדה זה מהטופס?"
            }
            okFunc={onConfirm}
            closePopup={() => setConfirmOpen(false)}
            okBtnText="מחק שדה"
            cancelBtnText="בטל"
            title="אזהרה"
            messageType="warning"
        />
    ) : null;

    return { requestConfirm, ConfirmDialog };
}
