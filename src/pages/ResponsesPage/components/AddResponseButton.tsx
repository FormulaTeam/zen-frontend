import React from "react";
import { Tooltip } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import { StyledAddButton, EditButtonWrapper } from "../styled";
import { useFormStore } from "../stores/form.store";
import { PERMISSION_TYPES } from "../../../utils/utils";
import { useSuperAdmin } from "../../../contexts/SuperAdminContext";

export const AddResponseButton: React.FC = () => {
    const navigate = useNavigate();
    const { form, permissions } = useFormStore();
    const { isSuperAdmin } = useSuperAdmin();

    const canCreate = (permissions || []).includes(PERMISSION_TYPES.CREATE_RESPONSE) || !!isSuperAdmin;

    if (!form || !canCreate) return null;

    return (
        <EditButtonWrapper>
            <Tooltip title="תגובה חדשה">
                <StyledAddButton
                    variant="contained"
                    size="small"
                    endIcon={<AddIcon />}
                    onClick={() => navigate(`/response/create/${form.id}`)}
                >
                    הוספת תגובה
                </StyledAddButton>
            </Tooltip>
        </EditButtonWrapper>
    );
};

export default AddResponseButton;
