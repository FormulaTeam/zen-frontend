import React from "react";
import { Checkbox, Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTheme } from "@mui/material/styles";
import { role } from "formula-gear";
import RolesAutocomplete from "./RolesAutocomplete";
import { RoleLabel } from "./styled";
import { ROLE_CATALOG } from "../../consts/roles";
import {
  Wrapper,
  LabelWrapper,
  LabelText,
  InfoRow,
  PermissionsWrapper,
  PermissionsRow,
  PermissionsText,
  NoteText,
} from "./publicForm.styled";

interface PublicFormSectionProps {
  isPublic: boolean;
  togglePublicForm: () => void;
  formPermission: any;
  setFormPermission: (val: any) => void;
  handleLocalFormPermissionChange: (event: any, newValue: any) => void;
}

const PublicFormSection: React.FC<PublicFormSectionProps> = ({
  isPublic,
  togglePublicForm,
  formPermission,
  setFormPermission,
  handleLocalFormPermissionChange,
}) => {
  const theme = useTheme();

  const getRoleName = () => {
    if (!formPermission) return "";
    if (typeof formPermission === "object" && formPermission.roleName) {
      return formPermission.roleName;
    }
    const roleId = typeof formPermission === "object" ? formPermission.role_id : formPermission;
    const roleObj = ROLE_CATALOG.find((r) => r.role_id === roleId);
    return roleObj ? roleObj.roleName : "";
  };

  const roleName = getRoleName();

  return (
    <Wrapper>
      <LabelWrapper $color={theme.palette.text.primary}>
        <Checkbox checked={isPublic} onChange={togglePublicForm} />
        <InfoRow>
          <LabelText>האם להגדיר טופס זה כטופס פומבי?</LabelText>
          <Tooltip title="הגדרת הטופס כפומבי תהפוך את הטופס למשותף עם כלל משתמשי המערכת">
            <IconButton size="small">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </InfoRow>
      </LabelWrapper>

      {isPublic && (
        <PermissionsWrapper>
          <PermissionsRow>
            <PermissionsText $color={theme.palette.text.secondary}>
              אילו הרשאות יוגדרו לכלל המשתמשים:
            </PermissionsText>
            {roleName ? (
              <RoleLabel
                onClick={() => setFormPermission(null)}
                $isCreator={false}
                color={theme.palette.button?.primaryText || "#000"}>
                {roleName}
              </RoleLabel>
            ) : (
              <RolesAutocomplete
                isDisabled={false}
                handleRoleChange={handleLocalFormPermissionChange}
                width="min(180px, 100%)"
                excludeRoleIds={[role.FormAdmin]}
              />
            )}
          </PermissionsRow>
          <NoteText $color={theme.palette.text.secondary}>
            כדי לשתף הטופס עם המשתמשים נדרש לשלוח קישור לטופס
          </NoteText>
        </PermissionsWrapper>
      )}
    </Wrapper>
  );
};

export default PublicFormSection;
