import React, { useEffect, useState } from "react";
import { Typography, Button, Tooltip, Checkbox, Box } from "@mui/material";
import { StyledListItem, FormInfo, FormTitleBox, RestoreButtonWrapper, Img } from "./styled";
import { getFormIconByName } from "../../utils/utils";
import { FormIconWrapper } from "../FormCard/styled";
import * as MuiIcons from "@mui/icons-material";

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
    const responsesCount = form._count?.responses ?? form.numberOfResponses ?? 0;
    setHasResponses(responsesCount > 0);
  }, [form.numberOfResponses, form._count?.responses]);

  return (
    <StyledListItem key={form.id}>
      <Box display="flex" alignItems="flex-start" gap={2} flex={1}>
        <Checkbox checked={isSelected} onChange={() => toggleSelect(form.id)} sx={{ mt: 1 }} />

        <FormInfo>
          <FormTitleBox>
            {getIcon(form.icon)}
            <Typography variant="h6">{form.name}</Typography>
          </FormTitleBox>
          <Typography variant="subtitle2">
            נוצר על ידי {form.created_by_name || form.created_by}
          </Typography>
          <Typography variant="subtitle2">
            {`נמחק בתאריך ${new Date(form?.deleted).toLocaleDateString("he-IL")} בשעה ${new Date(
              form?.deleted,
            ).toLocaleTimeString("he-IL")}`}
            {form?.deleted_by_name ? ` על ידי ${form?.deleted_by_name}` : ""}
          </Typography>
        </FormInfo>
      </Box>

      <RestoreButtonWrapper>
        <Button onClick={() => handleRestoreForm(form.id)} variant="contained" color="primary">
          שחזור טופס
        </Button>
        <Tooltip title={!hasResponses ? "אין תגובות להצגה" : "הצג תגובות לטופס שנמחק"}>
          <span>
            <Button
              onClick={() => setCurrentDeletedForm(form)}
              variant="outlined"
              color="primary"
              disabled={!hasResponses}>
              הצג תגובות
            </Button>
          </span>
        </Tooltip>
      </RestoreButtonWrapper>
    </StyledListItem>
  );
};

export default DeletedFormItem;
