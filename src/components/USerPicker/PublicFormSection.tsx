import React from "react";
import { Checkbox, Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTheme } from "@mui/material/styles";
import RolesAutocomplete from "./RolesAutocomplete";
import { Form, User } from "../../utils/interfaces";
import { RoleLabel } from "./styled";
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
  form: Form;
  roles: any[];
  user: User | null;
  hasPermission: boolean;
  isPublic: boolean;
  togglePublicForm: () => void;
  formPermission: any;
  setFormPermission: (val: any) => void;
  handleLocalFormPermissionChange: (event: any, newValue: any) => void;
}

const PublicFormSection: React.FC<PublicFormSectionProps> = ({
  form,
  roles,
  user,
  hasPermission,
  isPublic,
  togglePublicForm,
  formPermission,
  setFormPermission,
  handleLocalFormPermissionChange,
}) => {
  const theme = useTheme();

  return (
    <Wrapper>
      <LabelWrapper disabled={!hasPermission} $color={theme.palette.text.primary}>
        <Checkbox disabled={!hasPermission} checked={isPublic} onChange={togglePublicForm} />
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
            {formPermission && formPermission.roleName ? (
              <RoleLabel
                onClick={() => setFormPermission(null)}
                $isCreator={false}
                color={theme.palette.button?.primaryText || "#000"}>
                {formPermission.roleName}
              </RoleLabel>
            ) : (
              <RolesAutocomplete
                roles={roles}
                isDisabled={!hasPermission}
                handleRoleChange={handleLocalFormPermissionChange}
                user={user}
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
