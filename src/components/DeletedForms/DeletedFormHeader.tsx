import React from "react";
import { Typography, useTheme, Button } from "@mui/material";
import { StyledListHeader, FormInfo, FormTitleBox, Img, StrongText, HeaderWrapper } from "./styled";
import formX from "../../images/form_x.png";
import { Form } from "../../utils/interfaces";

interface DeletedFormHeaderProps {
  form: Form;
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

  return (
    <StyledListHeader>
      <HeaderWrapper>
        <FormInfo>
          <FormTitleBox>
            <Img src={formX} alt="form icon" />
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
          שחזור טופס
        </Button>
      </HeaderWrapper>
    </StyledListHeader>
  );
};

export default DeletedFormHeader;
