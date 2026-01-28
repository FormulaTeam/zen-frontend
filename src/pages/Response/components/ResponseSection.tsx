import React from "react";
import { Collapse, IconButton, Typography, useTheme, Box, CircularProgress } from "@mui/material";
import FormFieldRenderer from "../../../components/Responses/FormFieldRenderer";
import { FieldsWrapper } from "../styled";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  FormField,
  ResponseFieldValue,
  IResponseSection,
  FieldTypeIds,
} from "../../../utils/interfaces";
import { NOT_A_SECTION_ID } from "../../../utils/sections/consts";
import { texts } from "../../../utils/texts";
import styled from "styled-components";
import { LoadingContainer } from "../styled";

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
  touchedFields: Record<string, boolean>;
  onBlurField: (uniqueId: string) => void;
  onChangeHandler: (value: any, uniqueId: any, inputValueValid: any) => void;
  viewMode?: boolean;
  fieldOptions?: Record<string, ResponseFieldValue[]>;
  formFields?: FormField[];
  getFormInFormProperty?: (formField: FormField) => React.ReactNode;
  isLoading?: boolean;
  formId: number;
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
  touchedFields,
  onBlurField,
  onChangeHandler,
  viewMode = false,
  fieldOptions = {},
  formFields = [],
  getFormInFormProperty,
  isLoading,
  formId,
}) => {
  const theme = useTheme();

  const effectiveSectionId = section.id || NOT_A_SECTION_ID;

  return (
    <FieldsWrapper key={sectionId || sectionIdx}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box>
          <Typography variant="h6">
            {effectiveSectionId !== NOT_A_SECTION_ID && !section.name
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
            .sort((a, b) => a.index - b.index)
            .map((formField, index) => {
              const key = formField.uniqueId || formField.uniqId || `${sectionId}-${index}`;

              if (formField.typeId === FieldTypeIds.form && getFormInFormProperty) {
                return <GridItemFull key={key}>{getFormInFormProperty(formField)}</GridItemFull>;
              }

              if (isLoading) return null;

              return (
                <div key={key}>
                  <FormFieldRenderer
                    formId={formId}
                    formField={formField}
                    formFieldsByIdMap={formFieldsByIdMap}
                    formFieldsValuesMap={formFieldsValuesMap}
                    formFieldsValidMap={formFieldsValidMap}
                    touchedFields={touchedFields}
                    onBlurField={onBlurField}
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
