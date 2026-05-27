import { Tooltip, IconButton, Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { UnifiedButton } from "../styled";
import TableEditIconSvg from "../../../icons/tableEdit.svg";
import { CustomIcon } from "@theme/icons";
import { PermissionGate } from "@components/PermissionGate/PermissionGate";
import { Permission, permission } from "formula-gear";

interface EditResponsesButtonProps {
    isInEditMode: boolean;
    hasUnsavedChanges: boolean;
    isUpdating: boolean;
    onToggleEditMode: () => void;
    onSaveChanges: () => void;
    onAddNewResponse: () => void;
    permissions: Permission[] | undefined;
}

export const EditResponsesButton = ({
    isInEditMode,
    hasUnsavedChanges,
    isUpdating,
    onToggleEditMode,
    onSaveChanges,
    onAddNewResponse,
    permissions
}: EditResponsesButtonProps) => {
    const enterEditModeButton: JSX.Element = (
        <Tooltip title="עריכה מהירה">
            <UnifiedButton
                startIcon={<img src={TableEditIconSvg} alt="edit" style={{ width: 20, height: 20 }} />}
                onClick={onToggleEditMode}
            >
                עריכה מהירה
            </UnifiedButton>
        </Tooltip>
    );

    const editModeActions: JSX.Element = (
        <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Tooltip title="שמירה ויציאה מעריכה מהירה">
                <UnifiedButton
                    $isPrimary
                    onClick={onSaveChanges}
                    disabled={!hasUnsavedChanges || isUpdating}
                    startIcon={<CheckIcon />}
                >
                    שמירה
                </UnifiedButton>
            </Tooltip>
            <Tooltip title="יציאה מעריכה מהירה ללא שמירה">
                <UnifiedButton
                    onClick={onToggleEditMode}
                    startIcon={<CloseIcon />}
                >
                    ביטול
                </UnifiedButton>
            </Tooltip>
            <Tooltip title="הוספת שורה חדשה">
                <IconButton onClick={onAddNewResponse} color="primary" sx={{ 
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    borderRadius: "10px",
                    width: 42,
                    height: 42
                }}>
                    <CustomIcon
                        iconName="newComment"
                        style={{ width: 24, height: 24 }}
                        forcePointer
                    />
                </IconButton>
            </Tooltip>
        </Box>
    );

    return (
        <PermissionGate userPermissions={permissions ?? []} requiredPermissions={[permission.UpdateAnyResponse]}>
            {isInEditMode ? editModeActions : enterEditModeButton}
        </PermissionGate>
    );
};
