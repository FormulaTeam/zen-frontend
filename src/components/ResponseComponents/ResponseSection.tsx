import React from "react";
import { Collapse, IconButton, Typography, useTheme, Box, CircularProgress } from "@mui/material";
import FormFieldRenderer from "../Responses/FormFieldRenderer";
import { FieldsWrapper } from "../../pages/Response/styled";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  FormField,
  ResponseFieldValue,
  IResponseSection,
  FieldTypeIds,
} from "../../utils/interfaces";
import { NOT_A_SECTION_ID } from "../../utils/sections/consts";
import { texts } from "../../utils/texts";
import styled from "styled-components";
import { LoadingContainer } from "../FormInFormField/styled";

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

interface ResponseSectionProps {
  section: IResponseSection;
  sectionId: string;
  sectionIdx: number;
  collapsedSections: Record<string, boolean>;
  toggleSectionCollapse: (sectionId: string) => void;
  formFieldsByIdMap: Map<string, FormField & ResponseFieldValue>;
  formFieldsValuesMap: Map<string, any>;
  formFieldsValidMap: Map<string, any>;
  onChangeHandler: (value: any, uniqueId: any, inputValueValid: any) => void;
  viewMode?: boolean;
  fieldOptions?: Record<string, ResponseFieldValue[]>;
  formFields?: FormField[];
  getFormInFormProperty?: (formField: FormField) => React.ReactNode;
  isLoading?: boolean;
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
  viewMode = false,
  fieldOptions = {},
  formFields = [],
  getFormInFormProperty,
  isLoading,
}) => {
  const theme = useTheme();

  if (!section.id) {
    section.id = NOT_A_SECTION_ID;
  }

  return (
    <FieldsWrapper key={sectionId || sectionIdx}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box>
          <Typography variant="h6">
            {section.id !== NOT_A_SECTION_ID && !section.name
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

      {/* Content */}
      <Collapse in={!collapsedSections[sectionId]} timeout="auto" unmountOnExit>
        <GridContainer>
          {section.fields
            .sort((a, b) => a.index - b.index)
            .map((formField, index) => {
              // getFormInFormProperty – full width
              if (formField.typeId === FieldTypeIds.form && getFormInFormProperty) {
                return (
                  <GridItemFull
                    key={formField.uniqueId || formField.uniqId || `${sectionId}-${index}`}>
                    {getFormInFormProperty(formField)}
                  </GridItemFull>
                );
              }
              if (isLoading) {
                return null;
              }
              // Regular field
              return (
                <div key={formField.uniqueId || formField.uniqId || `${sectionId}-${index}`}>
                  <FormFieldRenderer
                    formField={formField}
                    formFieldsByIdMap={formFieldsByIdMap}
                    formFieldsValuesMap={formFieldsValuesMap}
                    formFieldsValidMap={formFieldsValidMap}
                    onChangeHandler={onChangeHandler}
                    viewMode={viewMode}
                    fieldOptions={fieldOptions}
                    formFields={formFields}
                    index={index}
                  />
                </div>
              );
            })}
        </GridContainer>

        {isLoading && (
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
        )}
      </Collapse>
    </FieldsWrapper>
  );
};

export default ResponseSection;
