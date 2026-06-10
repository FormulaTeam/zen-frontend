import React, { useMemo } from "react";
import { Typography, Button, useTheme, Checkbox, CircularProgress, Tooltip, Box } from "@mui/material";
import {
  StyledListItem,
  FormInfo,
  FormTitleBox,
  RestoreButtonWrapper,
  Img,
  StrongText,
  CheckboxWrapper,
  FlexRowItem,
  MetadataBox,
} from "./styled";
import { formIconsNamesMap, getFormIconByName } from "../../utils/utils";
import { useSuperAdmin } from "../../contexts/SuperAdminContext";
import { FormDto } from "../../types/shared";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";

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

  const isFormDeleted = response.parentFormStatus !== "active" || !!currentDeletedForm;
  const isDeletedWithForm = response.deleted_with_form === true;

  const isRestoreDisabled = isFormDeleted || isDeletedWithForm;

  let warningMessage: string | null = null;
  if (isDeletedWithForm) {
    warningMessage = "תגובה זו נמחקה יחד עם הטופס. יש לשחזר את הטופס תחילה.";
  } else if (isFormDeleted) {
    warningMessage = "לא ניתן לשחזר את התגובה מכיוון שהטופס שלה נמחק. יש לשחזר את הטופס תחילה.";
  }

  const getCreatedByName = () => {
    if (typeof response.created_by_name === "string") return response.created_by_name;
    if (response.created_by && typeof response.created_by === "object") {
      return response.created_by.name || response.created_by.upn || "לא ידוע";
    }
    if (typeof response.created_by === "string") return response.created_by;
    return "לא ידוע";
  };

  const getDeletedByName = () => {
    if (typeof response.deleted_by_name === "string") return response.deleted_by_name;
    if (response.updated_by_name && typeof response.updated_by_name === "string") return response.updated_by_name;
    if (response.deleted_by && typeof response.deleted_by === "object") {
      return response.deleted_by.name || response.deleted_by.upn || "";
    }
    return "";
  };

  const createdBy = getCreatedByName();
  const deletedBy = getDeletedByName();

  return (
    <StyledListItem>
      <Box display="flex" alignItems="center" gap={2} flex={1}>
        {!currentDeletedForm && (
          <Checkbox checked={isSelected} onChange={handleCheckboxChange} color="primary" disabled={isRestoreDisabled} />
        )}
        <FormInfo>
          <FormTitleBox>
            {!currentDeletedForm && renderFormIcon()}
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              תגובה <StrongText color={theme.palette.primary.main}>#{responseIndex}</StrongText>
              {!currentDeletedForm && (
                <>
                  {" "}מטופס {formName ? (
                    <StrongText color={theme.palette.primary.main}>{formName}</StrongText>
                  ) : (
                    <CircularProgress size={14} color="primary" />
                  )}
                </>
              )}
            </Typography>
          </FormTitleBox>
          <MetadataBox>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonOutlineIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                נוצר ע״י {createdBy}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <EventBusyIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                נמחק בתאריך {deletedDate} {deletedTime ? "בשעה " + deletedTime : ""} {deletedBy ? `ע״י ${deletedBy}` : ""}
              </Typography>
            </Box>
          </MetadataBox>
          {warningMessage && (
            <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
              {warningMessage}
            </Typography>
          )}
        </FormInfo>
      </Box>

      <RestoreButtonWrapper>
        <Tooltip
          title={
            isRestoreDisabled && hasPermission
              ? warningMessage
              : "שחזור תגובה"
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
              disabled={isRestoreDisabled && hasPermission}
              startIcon={<RestoreFromTrashIcon />}
              sx={{ borderRadius: "8px" }}>
              שחזור תגובה
            </Button>
          </span>
        </Tooltip>
      </RestoreButtonWrapper>
    </StyledListItem>
  );
};

export default DeletedResponseItem;
