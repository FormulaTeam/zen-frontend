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
import { formIconsNamesMap, getFormIconByName } from "../../utils/utils";
import { useSuperAdmin } from "../../contexts/SuperAdminContext";
import { FormDto } from "../../types/shared";

interface DeletedResponseItemProps {
  form?: FormDto;
  response: any;
  handleRestoreResponse: (formId: number, responseId: string) => Promise<void>;
  currentDeletedForm?: FormDto | null;
  isSelected?: boolean;
  onSelect?: (responseId: string) => void;
  onDeselect?: (responseId: string) => void;
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
  const { isSuperAdmin } = useSuperAdmin();

  const hasPermission = !!isSuperAdmin;

  const deletedAt = response.deleted_at || (response as any).deletedAt || response.deleted;
  const deletedDateObj = new Date(deletedAt);
  const isValidDate = !isNaN(deletedDateObj.getTime());
  const deletedDate = isValidDate ? deletedDateObj.toLocaleDateString("he-IL") : "לא ידוע";
  const deletedTime = isValidDate ? deletedDateObj.toLocaleTimeString("he-IL") : "";
  const renderFormIcon = () => {
    const iconSrc = getFormIconByName(form?.icon ?? undefined);

    if (typeof iconSrc === "string") {
      return (
        <Img
          src={iconSrc}
          alt="form icon"
          loading="lazy"
        />
      );
    }

    const IconComponent = iconSrc;
    if (IconComponent) {
      return (
        <IconComponent color="primary" sx={{ fontSize: 24 }} />
      );
    }

    return null;
  };

  const responseIndex = response.index;
  const responseId = response.id;
  const responseFormId = response.form_id ?? response.formId;

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!responseId) return;

    if (e.target.checked) {
      onSelect?.(responseId);
    } else {
      onDeselect?.(responseId);
    }
  };

  const formName = form?.name || response.form_name;
  const formId = form?.id || responseFormId;

  const isRestoreDisabled =
    response.parentFormStatus !== "active" || (!!currentDeletedForm && response.deleted);

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
            {!currentDeletedForm && renderFormIcon()}
            <Typography variant="h6">
              תגובה מספר <StrongText color={theme.palette.primary.main}>{responseIndex}</StrongText>{" "}
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
              התגובה נמחקה לפני שהטופס נמחק. לכן במידה והטופס ישוחזר תגובה זאת לא תשוחזר עם
              הטופס.{" "}
            </Typography>
          ) : null}
        </FormInfo>
      </FlexRowItem>
      <RestoreButtonWrapper>
        <Tooltip
          title={
            isRestoreDisabled && hasPermission
              ? "לא ניתן לשחזר תגובה לטופס שנמחק"
              : "שחזור תגובה לטופס"
          }>
          <span>
            <Button
              onClick={() => {
                if (typeof responseFormId === "number" && responseId) {
                  handleRestoreResponse(responseFormId, responseId);
                }
              }}
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
