import { Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import { UnifiedButton } from "../styled";
import TableEditIconSvg from "../../../icons/tableEdit.svg";
import { CustomIcon } from "@theme/icons";
import { PermissionGate } from "@components/PermissionGate/PermissionGate";
import { Permission, permission } from "formula-gear";
import { useNavigate } from "react-router-dom";
import { useFormStore } from "../stores/form.store";

interface EditResponsesButtonProps {
  isInEditMode: boolean;
  hasUnsavedChanges: boolean;
  isUpdating: boolean;
  onToggleEditMode: () => void;
  onSaveChanges: () => void;
  onAddNewResponse: () => void;
  onDuplicateResponse: (rowId: string) => void;
  permissions: Permission[] | undefined;
  selectedRows: any[];
  handleDeleteResponses: (rows: any[]) => void;
}

export const EditResponsesButton = ({
  isInEditMode,
  hasUnsavedChanges,
  isUpdating,
  onToggleEditMode,
  onSaveChanges,
  onAddNewResponse,
  onDuplicateResponse: onDuplicateResponseProp,
  permissions,
  selectedRows,
  handleDeleteResponses,
}: EditResponsesButtonProps) => {
  const navigate = useNavigate();
  const { form } = useFormStore();
  const hasSelection = selectedRows.length > 0;
  const isSingleSelection = selectedRows.length === 1;

  const onEditResponse = () => {
    if (isSingleSelection && form?.id) {
      navigate(`/forms/${form.id}/responses/${selectedRows[0].id}/edit`);
    }
  };

  const onViewResponse = () => {
    if (isSingleSelection && form?.id) {
      navigate(`/forms/${form.id}/responses/${selectedRows[0].id}`);
    }
  };

  const onDuplicateResponse = () => {
    if (isSingleSelection && form?.id) {
      if (isInEditMode) {
        onDuplicateResponseProp(String(selectedRows[0].id));
      } else {
        navigate(`/forms/${form.id}/responses/${selectedRows[0].id}/copy`);
      }
    }
  };

  // 1. QUICK EDIT MODE
  if (isInEditMode) {
    return (
      <Box sx={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <UnifiedButton
          onClick={onAddNewResponse}
          startIcon={<CustomIcon iconName="newComment" style={{ width: 22, height: 22 }} />}>
          הוספת שורה חדשה
        </UnifiedButton>

        <UnifiedButton
          $isPrimary
          onClick={onSaveChanges}
          disabled={!hasUnsavedChanges || isUpdating}
          startIcon={<CheckIcon />}>
          שמירה
        </UnifiedButton>

        <UnifiedButton onClick={onToggleEditMode} startIcon={<CloseIcon />}>
          ביטול
        </UnifiedButton>

        {hasSelection && (
          <UnifiedButton
            onClick={() => handleDeleteResponses(selectedRows.map((r) => r.id))}
            startIcon={<DeleteIcon />}
            sx={{ color: "#d32f2f" }}>
            {"מחיקה"}
          </UnifiedButton>
        )}

        {isSingleSelection && (
          <UnifiedButton onClick={onDuplicateResponse} startIcon={<ContentCopyIcon />}>
            שכפול
          </UnifiedButton>
        )}
      </Box>
    );
  }

  // 2. SELECTION MODE (OUTSIDE QUICK EDIT)
  if (hasSelection) {
    return (
      <Box sx={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <UnifiedButton
          disabled={!isSingleSelection}
          onClick={onViewResponse}
          startIcon={<VisibilityIcon />}>
          צפייה
        </UnifiedButton>

        <UnifiedButton
          disabled={!isSingleSelection}
          onClick={onEditResponse}
          startIcon={<EditIcon />}>
          עריכה
        </UnifiedButton>

        <UnifiedButton
          onClick={() => handleDeleteResponses(selectedRows.map((r) => r.id))}
          startIcon={<DeleteIcon />}
          sx={{ color: "#d32f2f" }}>
          מחיקה
        </UnifiedButton>

        <UnifiedButton
          disabled={!isSingleSelection}
          onClick={onDuplicateResponse}
          startIcon={<ContentCopyIcon />}>
          שכפול
        </UnifiedButton>
      </Box>
    );
  }

  // 3. STANDARD MODE
  return (
    <PermissionGate
      userPermissions={permissions ?? []}
      requiredPermissions={[permission.UpdateAnyResponse]}>
      <UnifiedButton
        startIcon={<img src={TableEditIconSvg} alt="edit" style={{ width: 20, height: 20 }} />}
        onClick={onToggleEditMode}>
        עריכה מהירה
      </UnifiedButton>
    </PermissionGate>
  );
};
