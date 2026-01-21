import React, { useMemo } from "react";
import { TableBody, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { Form, Row, FieldTypeIds, FormField } from "@utils/interfaces";
import { DetailsRowContainer, ResponseCell, ResponseTitle, StyledTable } from "./styled";
import { ChildResponseRow } from "./ChildResponseRow";

interface ChildResponsesPanelProps {
    responses: Row[];
    form: Form;
    title: string;
    parentFormId?: number;
    isInEditMode?: boolean;
}

export const ChildResponsesPanel: React.FC<ChildResponsesPanelProps> = ({
    responses,
    form,
    parentFormId,
    title,
    isInEditMode = false,
}) => {

    const displayFields = useMemo(() => {
        return form?.fields?.filter(field => field.typeId !== FieldTypeIds.form) || [];
    }, [form?.fields]);

    const sortedResponses = useMemo(() => {
        return [...responses].sort((a, b) => a.id - b.id);
    }, [responses]);

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
                            {displayFields.map((field: FormField, index: number) => (
                                <ResponseCell key={index}>{field.displayName}</ResponseCell>
                            ))}
                            <ResponseCell>תאריך יצירה</ResponseCell>
                            <ResponseCell>נוצר על ידי</ResponseCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedResponses.map((response) => (
                            <ChildResponseRow
                                response={response}
                                connectedFormId={form.id}
                                key={response.id}
                                formFields={displayFields}
                                parentFormId={parentFormId}
                            />
                        ))}
                    </TableBody>
                </StyledTable>
            </TableContainer>
        </DetailsRowContainer>
    );
};
