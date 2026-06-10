import React, { useEffect, useState } from "react";
import { Typography, Button, Tooltip, Checkbox, Box } from "@mui/material";
import { StyledListItem, FormInfo, FormTitleBox, MetadataBox, RestoreButtonWrapper } from "./styled";
import { getFormIconByName } from "../../utils/utils";
import { FormIconWrapper } from "../FormCard/styled";
import * as MuiIcons from "@mui/icons-material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

interface DeletedFormItemProps {
  form: any;
  handleRestoreForm: (formId: number) => Promise<void>;
  setCurrentDeletedForm: (response: any) => void;
  isSelected: boolean;
  toggleSelect: (formId: number) => void;
}

const DeletedFormItem: React.FC<DeletedFormItemProps> = ({
  form,
  handleRestoreForm,
  setCurrentDeletedForm,
  isSelected,
  toggleSelect,
}) => {
  if (!form) return null;

  const [hasResponses, setHasResponses] = useState<boolean>(false);

  const renderDynamicIcon = (name: string) => {
    const IconComponent = MuiIcons[name as keyof typeof MuiIcons];
    return IconComponent ? <IconComponent color="primary" /> : name;
  };

  const getIcon = (iconName: string | null) => {
    const iconSrc = getFormIconByName(iconName ?? undefined);

    if (typeof iconSrc === "string") {
      return (
        <FormIconWrapper>
          <img src={iconSrc} alt={iconName ?? "form icon"} />
        </FormIconWrapper>
      );
    }

    if (iconSrc) {
      const IconComponent = iconSrc;
      return (
        <FormIconWrapper>
          <IconComponent color="primary" />
        </FormIconWrapper>
      );
    }

    return (
      <FormIconWrapper>
        {renderDynamicIcon(iconName ?? "grid_view")}
      </FormIconWrapper>
    );
  };

  useEffect(() => {
    const responsesCount = form?.responsesCount ?? form?._count?.responses ?? form?.numberOfResponses ?? 0;
    setHasResponses(responsesCount > 0);
  }, [form]);

  const deletedAt = form?.deleted_at || form?.deletedAt || form?.deleted;
  const deletedDateObj = new Date(deletedAt);
  const isValidDate = !isNaN(deletedDateObj.getTime());
  const deletedDate = isValidDate ? deletedDateObj.toLocaleDateString("he-IL") : "לא ידוע";
  const deletedTime = isValidDate ? deletedDateObj.toLocaleTimeString("he-IL") : "";
  
  const getCreatedByName = () => {
    if (typeof form?.created_by_name === "string") return form.created_by_name;
    if (typeof form?.createdBy === "string") return form.createdBy;
    if (form?.createdBy && typeof form.createdBy === "object") {
      return form.createdBy.name || form.createdBy.upn || "לא ידוע";
    }
    if (form?.created_by && typeof form.created_by === "object") {
      return form.created_by.name || form.created_by.upn || "לא ידוע";
    }
    if (typeof form?.created_by === "string") return form.created_by;
    return "לא ידוע";
  };

  const getDeletedByName = () => {
    if (typeof form?.deleted_by_name === "string") return form.deleted_by_name;
    if (typeof form?.deletedBy === "string") return form.deletedBy;
    if (form?.deletedBy && typeof form.deletedBy === "object") {
      return form.deletedBy.name || form.deletedBy.upn || "";
    }
    if (form?.deleted_by && typeof form.deleted_by === "object") {
      return form.deleted_by.name || form.deleted_by.upn || "";
    }
    if (typeof form?.deleted_by === "string") return form.deleted_by;
    return "";
  };

  const createdBy = getCreatedByName();
  const deletedBy = getDeletedByName();

  return (
    <StyledListItem key={form.id}>
      <Box display="flex" alignItems="center" gap={2} flex={1}>
        <Checkbox checked={isSelected} onChange={() => toggleSelect(form.id)} />

        <FormInfo>
          <FormTitleBox>
            {getIcon(form.icon)}
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {form.name}
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
                נמחק בתאריך {deletedDate} {deletedTime ? `בשעה ${deletedTime}` : ""}{" "}
                {deletedBy ? `ע״י ${deletedBy}` : ""}
              </Typography>
            </Box>
          </MetadataBox>
        </FormInfo>
      </Box>

      <RestoreButtonWrapper>
        <Tooltip title={!hasResponses ? "אין תגובות להצגה" : "הצג תגובות"}>
          <span>
            <Button
              onClick={() => setCurrentDeletedForm(form)}
              variant="outlined"
              color="primary"
              disabled={!hasResponses}
              startIcon={<VisibilityOutlinedIcon />}
              sx={{ borderRadius: "8px" }}>
              הצג תגובות
            </Button>
          </span>
        </Tooltip>
        <Button
          onClick={() => handleRestoreForm(form.id)}
          variant="contained"
          color="primary"
          startIcon={<RestoreFromTrashIcon />}
          sx={{ borderRadius: "8px" }}>
          שחזור
        </Button>
      </RestoreButtonWrapper>
    </StyledListItem>
  );
};

export default DeletedFormItem;
