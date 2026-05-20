import React from "react";
import { Tooltip, IconButton } from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { GridRowId, GridRowSelectionModel } from "@mui/x-data-grid-pro";
import { useNavigate } from "react-router-dom";

import { permission } from "formula-gear";

import { useSoftDeleteResponses } from "../../../api";
import { useSuperAdmin } from "../../../contexts/SuperAdminContext";
import { showSuccessNotification, showErrorNotification } from "../../../utils/utils";
import { EditButtonWrapper } from "../styled";
import { useFormStore } from "../stores/form.store";

interface RowActionsButtonsProps {
  rowSelectionModel: GridRowSelectionModel;
  onDeleted: () => void;
  onDeleteResponses?: (ids: GridRowId[]) => Promise<void>;
  currentUserUpn?: string;
}

export const RowActionsButtons: React.FC<RowActionsButtonsProps> = ({
  rowSelectionModel,
  onDeleted,
  onDeleteResponses,
  currentUserUpn,
}) => {
  const navigate = useNavigate();
  const { form, permissions, rows, setForm } = useFormStore();
  const { isSuperAdmin } = useSuperAdmin();

  const { mutateAsync: softDeleteResponses } = useSoftDeleteResponses(Number(form?.id ?? 0));

  if (!form || !permissions) return null;

  const isExcludeAll = rowSelectionModel.type === "exclude";
  const excludedIds = new Set(Array.from(rowSelectionModel.ids).map((id) => String(id)));

  const selectedIds: GridRowId[] = isExcludeAll
    ? rows.filter((row) => !excludedIds.has(String(row.id))).map((row) => row.id)
    : Array.from(rowSelectionModel.ids);

  const isSingleSelection = selectedIds.length === 1;
  const hasSelection = selectedIds.length > 0;

  const singleSelectedResponse = isSingleSelection
    ? rows.find((row) => String(row?.id) === String(selectedIds[0]))
    : undefined;

  const responseCreatedByCurrentUser = !!(
    currentUserUpn &&
    singleSelectedResponse &&
    (singleSelectedResponse.upn === currentUserUpn || singleSelectedResponse.createdByUpn === currentUserUpn)
  );

  const canView = !!isSuperAdmin || permissions.some(p => p === permission.ReadAnyResponse || p === permission.ReadForm);
  const canEdit = !!isSuperAdmin || permissions.includes(permission.UpdateAnyResponse) || (permissions.includes(permission.UpdateMyResponse) && responseCreatedByCurrentUser);
  const canDelete = !!isSuperAdmin || permissions.includes(permission.DeleteAnyResponse);

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

    const responseIds = selectedIds.map((id) => String(id)).filter((id) => id.trim().length > 0);

    if (responseIds.length === 0) return;

    try {
      if (onDeleteResponses) {
        await onDeleteResponses(selectedIds);
      } else {
        setForm({
          ...form,
          responsesCount: Math.max(0, (form.responsesCount ?? 0) - responseIds.length),
        } as any);

        await softDeleteResponses({ responsesIds: responseIds });
        showSuccessNotification("מחיקת התגובות בוצעה בהצלחה");
      }

      onDeleted();
    } catch {
      setForm(form);

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
