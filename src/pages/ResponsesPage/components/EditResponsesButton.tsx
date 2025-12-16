import { Button, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { EditButtonWrapper } from "../styled";

interface EditResponsesButtonProps {
    isInEditMode: boolean;
    editedRowsCount: number;
    isUpdating: boolean;
    onToggleEditMode: () => void;
    onSaveChanges: () => void;
}

export const EditResponsesButton = ({
    isInEditMode,
    editedRowsCount,
    isUpdating,
    onToggleEditMode,
    onSaveChanges,
}: EditResponsesButtonProps) => {
    return (
        <EditButtonWrapper>
            {!isInEditMode ? (
                <Tooltip title="עריכת התגובות מתבצעת בלחיצה כפולה על התא הרלוונטי">
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={onToggleEditMode}
                    >
                        עריכת תגובות
                    </Button>
                </Tooltip>
            ) : (
                <>
                    <Tooltip title="שמור שינויים">
                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={onSaveChanges}
                            disabled={editedRowsCount === 0 || isUpdating}
                        >
                            {isUpdating ? "שומר..." : `שמור ${editedRowsCount > 0 ? `(${editedRowsCount})` : ""}`}
                        </Button>
                    </Tooltip>
                    <Tooltip title="בטל עריכה">
                        <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={onToggleEditMode}
                        >
                            בטל
                        </Button>
                    </Tooltip>
                </>
            )}
        </EditButtonWrapper>
    );
};
