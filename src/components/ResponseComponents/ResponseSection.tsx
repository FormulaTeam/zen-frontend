import React from "react";

import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Box, CircularProgress, Collapse, IconButton, Typography, useTheme } from "@mui/material";
import styled from "styled-components";

import { fieldType } from "formula-gear";
import type { FormFieldDto } from "../../types/shared";
import { FieldsWrapper } from "../../pages/Response/styled";
import { NOT_A_SECTION_ID } from "../../utils/sections/consts";
import { texts } from "../../utils/texts";
import FormFieldRenderer from "../Responses/FormFieldRenderer";
import { StyledLoadingContainer } from "../SharedStyled";

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;

  @media (min-width: 960px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const GridItemFull = styled.div`
  grid-column: 1 / -1;
`;

type SectionField = FormFieldDto & {
  sectionId?: string;
  sectionOrder?: number;
};

type ResponseSectionDto = {
  id?: string;
  name?: string;
  description?: string;
  fields: SectionField[];
  order: number;
};

type FieldOptionValue = {
  value?: unknown;
};

interface ResponseSectionProps {
  section: ResponseSectionDto;
  sectionId: string;
  sectionIdx: number;
  collapsedSections: Record<string, boolean>;
  toggleSectionCollapse: (sectionId: string) => void;
  formFieldsByIdMap: Map<string, SectionField>;
  formFieldsValuesMap: Map<string, any>;
  formFieldsValidMap: Map<string, any>;
  onChangeHandler: (value: any, fieldId: string, inputValueValid: any) => void;
  onBlurHandler: (fieldId: string) => void;
  viewMode?: boolean;
  fieldOptions?: Record<string, FieldOptionValue[]>;
  formFields?: SectionField[];
  getFormInFormProperty?: (formField: SectionField) => React.ReactNode;
  isLoading?: boolean;
  formId?: number | string;
}

const ResponseSection: React.FC<ResponseSectionProps> = ({
  section,
  sectionId,
  sectionIdx,
  collapsedSections,
  toggleSectionCollapse,
  formFieldsByIdMap,
  formFieldsValuesMap,
  formFieldsValidMap,
  onChangeHandler,
  onBlurHandler,
  viewMode = false,
  fieldOptions = {},
  formFields = [],
  getFormInFormProperty,
  isLoading,
  formId,
}) => {
  const theme = useTheme();
  const resolvedSectionId = section.id || NOT_A_SECTION_ID;

  return (
    <FieldsWrapper key={sectionId || sectionIdx}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box>
          <Typography variant="h6">
            {resolvedSectionId !== NOT_A_SECTION_ID && !section.name
              ? texts.heb.undefinedSection
              : section.name}
          </Typography>

          {section.description && (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {section.description}
            </Typography>
          )}
        </Box>

        <IconButton onClick={() => toggleSectionCollapse(sectionId)} size="small">
          {collapsedSections[sectionId] ? <ExpandMore /> : <ExpandLess />}
        </IconButton>
      </Box>

      <Collapse in={!collapsedSections[sectionId]} timeout="auto" unmountOnExit>
        <GridContainer>
          {section.fields
            .sort((firstField, secondField) => firstField.index - secondField.index)
            .map((formField, index) => {
              if (formField.fieldType === fieldType.Form && getFormInFormProperty) {
                return (
                  <GridItemFull key={formField.id || `${sectionId}-${index}`}>
                    {getFormInFormProperty(formField)}
                  </GridItemFull>
                );
              }

              if (isLoading) return null;

              return (
                <div key={formField.id || `${sectionId}-${index}`}>
                  <FormFieldRenderer
                    formField={formField}
                    formFieldsByIdMap={formFieldsByIdMap}
                    formFieldsValuesMap={formFieldsValuesMap}
                    formFieldsValidMap={formFieldsValidMap}
                    onChangeHandler={onChangeHandler}
                    onBlurHandler={onBlurHandler}
                    viewMode={viewMode}
                    fieldOptions={fieldOptions}
                    formFields={formFields}
                    index={index}
                    formId={formId}
                  />
                </div>
              );
            })}
        </GridContainer>

        {isLoading && (
          <StyledLoadingContainer>
            <CircularProgress />
          </StyledLoadingContainer>
        )}
      </Collapse>
    </FieldsWrapper>
  );
};

export default ResponseSection;
