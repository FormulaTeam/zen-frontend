import React, { useMemo } from "react";
import { Typography, Button, useTheme, Checkbox, CircularProgress, Tooltip } from "@mui/material";
import {
  StyledListItem,
  FormInfo,
  FormTitleBox,
  RestoreButtonWrapper,
  Img,
  StrongText,
  CheckboxWrapper,
  FlexRowItem,
} from "./styled";
import { formIconsNamesMap, PERMISSION_TYPES } from "../../utils/utils";
import formX from "../../images/form_x.png";
import { Form, RoleId } from "../../utils/interfaces";
import { useAuth } from "../../contexts/AuthContext";
import { useSuperAdmin } from "../../contexts/SuperAdminContext";

interface DeletedResponseItemProps {
  form: any;
  response: any;
  handleRestoreResponse: (formId: number, responseId: number) => Promise<void>;
  currentDeletedForm?: Form | null;
  isSelected?: boolean;
  onSelect?: (responseId: number) => void;
  onDeselect?: (responseId: number) => void;
}

const DeletedResponseItem: React.FC<DeletedResponseItemProps> = ({
  response,
  handleRestoreResponse,
  form,
  currentDeletedForm = null,
  isSelected = false,
  onSelect,
  onDeselect,
}) => {
  if (!response) return null;

  const theme = useTheme();
  const { user, roles } = useAuth();
  const { isSuperAdmin } = useSuperAdmin();

  const userRole: RoleId | undefined = form?.users?.find(
    (u) => u.upn?.toLowerCase() === user?.upn?.toLowerCase(),
  )?.role_id;

  const permissionTypes = roles.find((r) => r.role_id === userRole)?.permission_types;

  const hasPermission = isSuperAdmin || permissionTypes?.includes(PERMISSION_TYPES.EDIT_FORM);

  const deletedDateObj = new Date(response.deleted);
  const isValidDate = !isNaN(deletedDateObj.getTime());
  const deletedDate = isValidDate ? deletedDateObj.toLocaleDateString("he-IL") : "לא ידוע";
  const deletedTime = isValidDate ? deletedDateObj.toLocaleTimeString("he-IL") : "";

  const formIcon = useMemo(() => {
    return form?.icon ? formIconsNamesMap.get(form.icon) : formX;
  }, [form?.icon]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelect?.(response.id);
    } else {
      onDeselect?.(response.id);
    }
  };

  const formName = form?.name || response.form_name;
  const formId = form?.id || response.form_id;

  const isRestoreDisabled = response.parentFormStatus !== "active" || !!currentDeletedForm && response.deleted;

  if (!response.deleted && !currentDeletedForm) {
    return null;
  }

  return (
    <StyledListItem>
      <FlexRowItem>
        {!currentDeletedForm && (
          <CheckboxWrapper>
            <Checkbox checked={isSelected} onChange={handleCheckboxChange} color="primary" />
          </CheckboxWrapper>
        )}
        <FormInfo>
          <FormTitleBox>
            {!currentDeletedForm && (
              <Img
                src={formIcon}
                alt="form icon"
                loading="lazy"
                onError={(e) => {
                  if (e.currentTarget.src !== formX) {
                    e.currentTarget.src = formX;
                  }
                }}
              />
            )}
            <Typography variant="h6">
              תגובה מספר <StrongText color={theme.palette.primary.main}>{response.id}</StrongText>{" "}
              שנמחקה מטופס מזהה <StrongText color={theme.palette.primary.main}>{formId}</StrongText>{" "}
              {formName ? (
                <>
                  בשם <StrongText color={theme.palette.primary.main}>{formName}</StrongText>
                </>
              ) : (
                <CircularProgress size={14} color="primary" />
              )}
            </Typography>
          </FormTitleBox>
          <Typography variant="subtitle2">
            נוצר על ידי {response.created_by_name || response.created_by}
          </Typography>{" "}
          <Typography variant="subtitle2">
            נמחק על ידי {response.deleted_by_name || response.updated_by_name}
          </Typography>
          <Typography variant="subtitle2">
            נמחק בתאריך {deletedDate} {deletedTime ? "בשעה " + deletedTime : ""}
          </Typography>
          {!response.deleted && !!currentDeletedForm ? (
            <Typography variant="subtitle2" color="warning">
              התגובה נמחקה יחד עם הטופס ותשוחזר באופן אוטומטי בעת שחזור הטופס.{" "}
            </Typography>
          ) : currentDeletedForm ? (
            <Typography variant="subtitle2" color="error">
              התגובה נמחקה לפני שהטופס נמחק. לכן במידה והטופס ישוחזר תגובה זאת לא תשוחזר עם הטופס.{" "}
            </Typography>
          ) : null}
        </FormInfo>
      </FlexRowItem>
      <RestoreButtonWrapper>
        <Tooltip
          title={
            isRestoreDisabled && hasPermission
              ? "לא ניתן לשחזר תגובה לטופס שנמחק"
              : "שחזר תגובה לטופס"
          }>
          <span>
            <Button
              onClick={() => handleRestoreResponse(response.form_id, response.id)}
              variant="contained"
              color="primary"
              disabled={isRestoreDisabled && hasPermission}>
              שחזור תגובה לטופס
            </Button>
          </span>
        </Tooltip>
      </RestoreButtonWrapper>
    </StyledListItem>
  );
};

export default DeletedResponseItem;
