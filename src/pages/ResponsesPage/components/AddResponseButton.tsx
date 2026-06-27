import React from "react";
import { Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { StyledAddButton, EditButtonWrapper } from "../styled";
import { useFormStore } from "../stores/form.store";
import { permission } from "formula-gear";
import { useSuperAdmin } from "../../../contexts/SuperAdminContext";

import { UnifiedButton } from "../styled";

export const AddResponseButton: React.FC = () => {
  const navigate = useNavigate();
  const { form, permissions } = useFormStore();
  const { isSuperAdmin } = useSuperAdmin();

  const canCreate = (permissions || []).includes(permission.CreateResponse) || !!isSuperAdmin;

  if (!form || !canCreate) return null;

  return (
    <UnifiedButton
      $isPrimary
      endIcon={<AddIcon />}
      onClick={() => navigate(`/forms/${form.id}/responses/new`)}
      sx={{
        paddingInlineStart: "16px",
        paddingInlineEnd: "10px",
      }}>
      הוספת תגובה
    </UnifiedButton>
  );
};

export default AddResponseButton;
