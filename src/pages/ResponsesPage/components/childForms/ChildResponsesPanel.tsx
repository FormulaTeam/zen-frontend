import React, { useMemo } from "react";
import { Paper, TableBody, TableContainer, TableHead, TableRow } from "@mui/material";

import { Row } from "@utils/interfaces";

import { FormDto, FormFieldDto } from "../../../../types/shared";
import { fieldType } from "formula-gear";
import { ChildResponseRow } from "./ChildResponseRow";
import { DetailsRowContainer, ResponseCell, ResponseTitle, StyledTable } from "./styled";

interface ChildResponsesPanelProps {
  responses: Row[];
  form: FormDto;
  title: string;
  parentFormId?: number;
  isInEditMode?: boolean;
  searchQuery?: string;
}

export const ChildResponsesPanel: React.FC<ChildResponsesPanelProps> = ({
  responses,
  form,
  parentFormId,
  title,
  isInEditMode = false,
  searchQuery,
}) => {
  const displayFields = useMemo(
    () =>
      (form.sections ?? [])
        .flatMap((section) => section.fields ?? [])
        .filter((field) => field.fieldType !== fieldType.Form),
    [form.sections],
  );

  const sortedResponses = useMemo(() => [...responses], [responses]);

  return (
    <DetailsRowContainer>
      <ResponseTitle>
        {title} - {responses.length} תגובות
      </ResponseTitle>

      <TableContainer component={Paper}>
        <StyledTable isInEditMode={isInEditMode}>
          <TableHead>
            <TableRow>
              <ResponseCell>צפייה</ResponseCell>
              {displayFields.map((field: FormFieldDto) => (
                <ResponseCell key={field.id}>{field.displayName}</ResponseCell>
              ))}
              <ResponseCell>תאריך יצירה</ResponseCell>
              <ResponseCell>נוצר על ידי</ResponseCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedResponses.map((response) => (
              <ChildResponseRow
                response={response}
                linkedFormId={form.id}
                key={response.id}
                formFields={displayFields}
                parentFormId={parentFormId}
                searchQuery={searchQuery}
              />
            ))}
          </TableBody>
        </StyledTable>
      </TableContainer>
    </DetailsRowContainer>
  );
};

