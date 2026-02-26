import React from "react";
import { Tooltip, IconButton } from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { GridRowId } from "@mui/x-data-grid-pro";
import { EditButtonWrapper } from "../styled";
import { useFormStore } from "../stores/form.store";
import { PERMISSION_TYPES } from "../../../utils/utils";
import { useSuperAdmin } from "../../../contexts/SuperAdminContext";
import {
    deleteMultipleResponses,
} from "../../../api";
import { queryClient } from "../../../api/queryClient";
import { showSuccessNotification, showErrorNotification } from "../../../utils/utils";

interface RowActionsButtonsProps {
    selectedIds: GridRowId[];
    onDeleted: () => void;
}

export const RowActionsButtons: React.FC<RowActionsButtonsProps> = ({ selectedIds, onDeleted }) => {
    const navigate = useNavigate();
    const { form, permissions, rows } = useFormStore();
    const { isSuperAdmin } = useSuperAdmin();

    const isSingleSelection = selectedIds.length === 1;
    const hasSelection = selectedIds.length > 0;

    const canView =
        permissions.includes(PERMISSION_TYPES.VIEW_RESPONSE) ||
        permissions.includes(PERMISSION_TYPES.VIEW_YOUR_RESPONSES) ||
        !!isSuperAdmin;

    const canEdit =
        permissions.includes(PERMISSION_TYPES.EDIT_RESPONSE) || !!isSuperAdmin;

    const canDelete =
        permissions.includes(PERMISSION_TYPES.DELETE_RESPONSE) || !!isSuperAdmin;

    const handleView = () => {
        if (!isSingleSelection) return;
        const rowId = Number(selectedIds[0]);
        const response = rows.find((row) => row?.id === rowId);
        if (response) {
            navigate(`/response/view/${form.id}/${response.id}`);
        }
    };

    const handleEdit = () => {
        if (!isSingleSelection) return;
        const rowId = Number(selectedIds[0]);
        const response = rows.find((row) => row?.id === rowId);
        if (response) {
            navigate(`/response/edit/${form.id}/${response.id}`);
        }
    };

    const handleDelete = async () => {
        if (!hasSelection) return;
        try {
            const responseIds = selectedIds
                .map((id) => Number.parseInt(String(id), 10))
                .filter((number) => Number.isFinite(number));

            if (responseIds.length === 0) return;

            await deleteMultipleResponses({
                form_id: Number(form.id),
                response_ids: responseIds,
            });
            queryClient.invalidateQueries({ queryKey: ["rows"] });
            showSuccessNotification("מחיקת התגובות בוצעה בהצלחה");
            onDeleted();
        } catch {
            showErrorNotification("מחיקת התגובות נכשלה");
        }
    };

    return (
        <EditButtonWrapper>
            <Tooltip
                title={
                    !canView
                        ? "אין הרשאה לצפייה"
                        : !isSingleSelection
                            ? "בחר תגובה אחת כדי לצפות בה"
                            : "צפייה בתגובה"
                }
            >
                <span>
                    <IconButton
                        size="small"
                        onClick={handleView}
                        disabled={!canView || !isSingleSelection}
                    >
                        <Visibility />
                    </IconButton>
                </span>
            </Tooltip>

            <Tooltip
                title={
                    !canEdit
                        ? "אין הרשאה לעריכה"
                        : !isSingleSelection
                            ? "בחר תגובה אחת כדי לערוך"
                            : "עריכת תגובה"
                }
            >
                <span>
                    <IconButton
                        size="small"
                        onClick={handleEdit}
                        disabled={!canEdit || !isSingleSelection}
                    >
                        <Edit />
                    </IconButton>
                </span>
            </Tooltip>

            <Tooltip
                title={
                    !canDelete
                        ? "אין הרשאה למחיקה"
                        : !hasSelection
                            ? "בחר תגובות למחיקה"
                            : `מחיקת ${selectedIds.length} תגובות נבחרות`
                }
            >
                <span>
                    <IconButton
                        size="small"
                        onClick={handleDelete}
                        disabled={!canDelete || !hasSelection}
                        color="error"
                    >
                        <Delete />
                    </IconButton>
                </span>
            </Tooltip>
        </EditButtonWrapper>
    );
};

export default RowActionsButtons;
