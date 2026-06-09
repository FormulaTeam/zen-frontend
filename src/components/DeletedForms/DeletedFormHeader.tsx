import React from "react";
import { Typography, useTheme, Button } from "@mui/material";
import { StyledListHeader, FormInfo, FormTitleBox, Img, StrongText, HeaderWrapper } from "./styled";
import { FormDto } from "../../types/shared";
import { getFormIconByName } from "../../utils/utils";
import * as MuiIcons from "@mui/icons-material";
import { FormIconWrapper } from "../FormCard/styled";

interface DeletedFormHeaderProps {
  form: FormDto;
  handleRestoreForm: (formId: number) => Promise<void>;
  responses?: any[];
}

const DeletedFormHeader: React.FC<DeletedFormHeaderProps> = ({
  form,
  handleRestoreForm,
  responses = [],
}) => {
  const theme = useTheme();

  // Filter responses based on the same logic as DeletedResponseItem: !response.deleted && !!currentDeletedForm
  const filteredResponses = responses.filter((response) => !response.deleted && !!form);
  const responsesCount = filteredResponses.length;

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

  return (
    <StyledListHeader>
      <HeaderWrapper>
        <FormInfo>
          <FormTitleBox>
            {getIcon(form?.icon ?? null)}
            <Typography variant="h6">
              טופס <StrongText color={theme.palette.primary.main}>{form.name}</StrongText> - מזהה
              טופס <StrongText color={theme.palette.primary.main}>{form.id}</StrongText>
            </Typography>
          </FormTitleBox>
          <Typography variant="subtitle1" color="textSecondary">
            {responsesCount === 1 ? "(תגובה אחת לשחזור)" : `(${responsesCount} תגובות לשחזור)`}
          </Typography>
        </FormInfo>

        <Button variant="contained" color="primary" onClick={() => handleRestoreForm(form.id)}>
          שחזור הטופס כולו
        </Button>
      </HeaderWrapper>
    </StyledListHeader>
  );
};

export default DeletedFormHeader;
