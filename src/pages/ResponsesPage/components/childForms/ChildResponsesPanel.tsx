import React, { useMemo } from "react";
import { TableBody, TableContainer, TableHead, TableRow } from "@mui/material";

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
  const displayFields = useMemo(() => {
    const sortedSections = [...(form.sections ?? [])]
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .map((section) => ({
        ...section,
        fields: [...(section.fields ?? [])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0)),
      }));

    return sortedSections
      .flatMap((section) => section.fields ?? [])
      .filter((field) => field.fieldType !== fieldType.Form);
  }, [form.sections]);

  const sortedResponses = useMemo(() => [...responses], [responses]);

  return (
    <DetailsRowContainer>
      <ResponseTitle>
        {title} ({responses.length})
      </ResponseTitle>

      <TableContainer
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        }}
      >
        <StyledTable isInEditMode={isInEditMode} size="small">
          <TableHead>
            <TableRow>
              <ResponseCell align="center" sx={{ width: "60px !important" }}>
                צפייה
              </ResponseCell>
              {displayFields.map((field: FormFieldDto) => (
                <ResponseCell key={field.id}>{field.displayName}</ResponseCell>
              ))}
              <ResponseCell sx={{ minWidth: "120px" }}>תאריך יצירה</ResponseCell>
              <ResponseCell sx={{ minWidth: "150px" }}>נוצר על ידי</ResponseCell>
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

