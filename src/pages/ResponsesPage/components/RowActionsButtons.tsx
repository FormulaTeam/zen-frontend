import React from "react";
import { Tooltip, IconButton } from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { GridRowId, GridRowSelectionModel } from "@mui/x-data-grid-pro";
import { EditButtonWrapper } from "../styled";
import { useFormStore } from "../stores/form.store";
import { useSuperAdmin } from "../../../contexts/SuperAdminContext";
import { softDeleteResponses } from "../../../api";
import { queryClient } from "../../../api/queryClient";
import { showSuccessNotification, showErrorNotification } from "../../../utils/utils";
import { permission } from "formula-gear";

interface RowActionsButtonsProps {
  rowSelectionModel: GridRowSelectionModel;
  onDeleted: () => void;
}

export const RowActionsButtons: React.FC<RowActionsButtonsProps> = ({
  rowSelectionModel,
  onDeleted,
}) => {
  const navigate = useNavigate();
  const { form, permissions, rows } = useFormStore();
  const { isSuperAdmin } = useSuperAdmin();

  if (!form || !permissions) return null;

  const isExcludeAll = rowSelectionModel.type === "exclude";
  const excludedIds = new Set(Array.from(rowSelectionModel.ids).map((id) => String(id)));

  const selectedIds: GridRowId[] = isExcludeAll
    ? rows.filter((row) => !excludedIds.has(String(row.id))).map((row) => row.id)
    : Array.from(rowSelectionModel.ids);

  const isSingleSelection = selectedIds.length === 1;
  const hasSelection = selectedIds.length > 0;

  const canView =
    permissions.includes(permission.ReadAnyResponse) ||
    !!isSuperAdmin;

  const canEdit = permissions.includes(permission.UpdateAnyResponse) || !!isSuperAdmin;

  const canDelete = permissions.includes(permission.DeleteAnyResponse) || !!isSuperAdmin;

  const handleView = () => {
    if (!isSingleSelection) return;

    const rowId = String(selectedIds[0]);
    const response = rows.find((row) => String(row?.id) === rowId);

    if (response) {
      navigate(`/response/view/${form.id}/${response.id}`);
    }
  };

  const handleEdit = () => {
    if (!isSingleSelection) return;

    const rowId = String(selectedIds[0]);
    const response = rows.find((row) => String(row?.id) === rowId);

    if (response) {
      navigate(`/response/edit/${form.id}/${response.id}`);
    }
  };

  const handleDelete = async () => {
    if (!hasSelection) return;

    try {
      const responseIds = selectedIds.map((id) => String(id)).filter((id) => id.trim().length > 0);

      if (responseIds.length === 0) return;

      await softDeleteResponses(Number(form.id), responseIds);

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
        }>
        <span>
          <IconButton size="small" onClick={handleView} disabled={!canView || !isSingleSelection}>
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
        }>
        <span>
          <IconButton size="small" onClick={handleEdit} disabled={!canEdit || !isSingleSelection}>
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
        }>
        <span>
          <IconButton
            size="small"
            onClick={handleDelete}
            disabled={!canDelete || !hasSelection}
            color="error">
            <Delete />
          </IconButton>
        </span>
      </Tooltip>
    </EditButtonWrapper>
  );
};

export default RowActionsButtons;
