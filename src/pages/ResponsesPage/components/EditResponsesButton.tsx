import { Tooltip, IconButton } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { EditButtonWrapper, StyledEditButton } from "../styled";
import TableEditIconSvg from "../../../icons/tableEdit.svg";
import { CustomIcon } from "@theme/icons";
import { PermissionGate } from "@components/PermissionGate/PermissionGate";
import { Permission, permission } from "formula-gear";

interface EditResponsesButtonProps {
    isInEditMode: boolean;
    editedRowsCount: number;
    isUpdating: boolean;
    onToggleEditMode: () => void;
    onSaveChanges: () => void;
    onAddNewResponse: () => void;
    permissions: Permission[] | undefined;
}

export const EditResponsesButton = ({
    isInEditMode,
    editedRowsCount,
    isUpdating,
    onToggleEditMode,
    onSaveChanges,
    onAddNewResponse,
    permissions
}: EditResponsesButtonProps) => {
    const enterEditModeButton: JSX.Element = (
        <Tooltip title="עריכה מהירה">
            <StyledEditButton
                variant="contained"
                size="small"
                startIcon={<img src={TableEditIconSvg} alt="edit" />}
                onClick={onToggleEditMode}
            >
                עריכה מהירה
            </StyledEditButton>
        </Tooltip>
    );

    const editModeActions: JSX.Element = (
        <>
            <Tooltip title="שמירה ויציאה מעריכה מהירה">
                <IconButton
                    size="small"
                    onClick={onSaveChanges}
                    disabled={editedRowsCount === 0 || isUpdating}
                >
                    <CheckIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="יציאה מעריכה מהירה ללא שמירה">
                <IconButton
                    size="small"
                    onClick={onToggleEditMode}
                >
                    <CloseIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="הוספת שורה חדשה">
                <div>
                    <IconButton onClick={onAddNewResponse} color="primary">
                        <CustomIcon
                            iconName="newComment"
                            style={{ width: 24, height: 24 }}
                            forcePointer
                        />
                    </IconButton>
                </div>
            </Tooltip>
        </>
    );

    return (
        <PermissionGate userPermissions={permissions ?? []} requiredPermissions={[permission.UpdateAnyResponse]}>
            <EditButtonWrapper>
                {isInEditMode ? editModeActions : enterEditModeButton}
            </EditButtonWrapper>
        </PermissionGate>
    );
};
