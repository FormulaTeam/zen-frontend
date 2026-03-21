import React, { useMemo } from "react";
import { Box } from "@mui/material";

import { Row } from "@utils/interfaces";

import { FormDto, FormFieldDto } from "../../../../types/shared";
import { fieldType } from "formula-gear";
import { ChildResponsesPanel } from "./ChildResponsesPanel";
import { DetailsContainer } from "../../styled";

type EditorFieldExtra = {
  connectedFormId?: number;
};

interface ChildFormData {
  form: FormDto;
  rows: Row[];
}

interface ExpandedRowContentProps {
  parentRowId: number | string;
  parentFormId: number;
  parentFormFields: FormFieldDto[];
  childrenFormsData: ChildFormData[];
  isInEditMode?: boolean;
}

const getFieldExtra = (field: FormFieldDto): EditorFieldExtra =>
  (field.extra as EditorFieldExtra | undefined) ?? {};

export const ExpandedRowContent: React.FC<ExpandedRowContentProps> = ({
  parentRowId,
  parentFormId,
  parentFormFields,
  childrenFormsData,
  isInEditMode = false,
}) => {
  const formInFormFields: FormFieldDto[] = useMemo(
    () =>
      parentFormFields.filter((field) => {
        const fieldExtra = getFieldExtra(field);

        return field.fieldType === fieldType.Form && !!fieldExtra.connectedFormId;
      }),
    [parentFormFields],
  );

  const childResponsesByForm = useMemo(
    () =>
      formInFormFields.map((field) => {
        const fieldExtra = getFieldExtra(field);
        const connectedFormId = fieldExtra.connectedFormId;

        const childFormData = childrenFormsData.find((data) => data.form.id === connectedFormId);

        if (!childFormData)
          return {
            field,
            form: null,
            responses: [],
          };

        const responses: Row[] = childFormData.rows.filter((row) => {
          const [, parentResponseId] = row.parentResponse?.split(";") || [];

          return parentResponseId === String(parentRowId);
        });

        return {
          field,
          form: childFormData.form,
          responses,
        };
      }),
    [formInFormFields, childrenFormsData, parentRowId],
  );

  const hasChildResponses = childResponsesByForm.some((item) => item.responses.length > 0);

  if (!hasChildResponses) return <Box />;

  return (
    <DetailsContainer>
      {childResponsesByForm.map((item, index) => {
        if (!item.form || item.responses.length === 0) return null;

        return (
          <ChildResponsesPanel
            key={`${item.form.id}-${index}`}
            responses={item.responses}
            form={item.form}
            title={item.field.displayName}
            parentFormId={parentFormId}
            isInEditMode={isInEditMode}
          />
        );
      })}
    </DetailsContainer>
  );
};
