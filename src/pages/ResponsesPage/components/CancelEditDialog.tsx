import { Button, Typography } from "@mui/material";
import {
    StyledCancelDialog,
    StyledDialogTitle,
    StyledDialogContent,
    StyledDialogActions,
    DialogTitleBox,
} from "../styled";

interface CancelEditDialogProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const CancelEditDialog = ({
    open,
    onConfirm,
    onCancel,
}: CancelEditDialogProps) => {
    return (
        <StyledCancelDialog open={open} onClose={onCancel}>
            <StyledDialogTitle>
                <DialogTitleBox>
                    <Typography variant="h5" component="span">
                        יציאה ממצב עריכה
                    </Typography>
                </DialogTitleBox>
            </StyledDialogTitle>
            <StyledDialogContent>
                <Typography variant="body1">
                    קיימים שינויים לא שמורים.
                </Typography>
                <Typography variant="body1">
                    האם ברצונך לצאת ממצב עריכה שינויים לא שמורים ימחקו?
                </Typography>
            </StyledDialogContent>
            <StyledDialogActions>
                <Button variant="outlined" onClick={onCancel}>
                    חזרה לעריכה
                </Button>
                <Button variant="contained" onClick={onConfirm}>
                    כן, יציאה ממצב עריכה
                </Button>
            </StyledDialogActions>
        </StyledCancelDialog>
    );
};
