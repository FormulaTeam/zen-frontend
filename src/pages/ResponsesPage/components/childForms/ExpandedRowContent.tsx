import React, { useMemo } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

import { Row } from "@utils/interfaces";

import { FormDto, FormFieldDto } from "../../../../types/shared";
import { fieldType } from "formula-gear";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { ChildResponsesPanel } from "./ChildResponsesPanel";
import { DetailsContainer } from "../../styled";

type EditorFieldExtra = {
    linkedFormId?: number | string;
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
    getChildRowsForParent: (parentRowId: string | number, linkedFormId: number | string) => Row[];
    isInEditMode?: boolean;
    searchQuery?: string;
    isLoading?: boolean;
}

const getFieldExtra = (field: FormFieldDto): EditorFieldExtra =>
    (field.extra as EditorFieldExtra | undefined) ?? {};

export const ExpandedRowContent: React.FC<ExpandedRowContentProps> = ({
    parentRowId,
    parentFormId,
    parentFormFields,
    childrenFormsData,
    getChildRowsForParent,
    isInEditMode = false,
    searchQuery,
    isLoading = false,
}) => {
    const formInFormFields: FormFieldDto[] = useMemo(
        () =>
            parentFormFields.filter((field) => {
                const fieldExtra = getFieldExtra(field);

                const isFormType = field.fieldType === fieldType.Form ||
                    (field as any).typeId === FieldTypeIds.linkedForm ||
                    (field as any).fieldType === FieldTypeIds.linkedForm;

                return isFormType && !!fieldExtra.linkedFormId;
            }),
        [parentFormFields],
    );

    const childResponsesByForm = useMemo(
        () =>
            formInFormFields.map((field) => {
                const fieldExtra = getFieldExtra(field);
                const linkedFormId = fieldExtra.linkedFormId;

                const childFormData = childrenFormsData.find((data) => String(data.form.id) === String(linkedFormId));

                if (!childFormData || !linkedFormId)
                    return {
                        field,
                        form: null,
                        responses: [],
                    };

                const responses: Row[] = getChildRowsForParent(parentRowId, linkedFormId);

                return {
                    field,
                    form: childFormData.form,
                    responses,
                };
            }),
        [formInFormFields, childrenFormsData, parentRowId, getChildRowsForParent],
    );

    const hasChildResponses = childResponsesByForm.some((item) => item.responses.length > 0);

    if (isLoading) {
        return (
            <DetailsContainer sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress size={30} />
            </DetailsContainer>
        );
    }

    if (!hasChildResponses) {
        return (
            <DetailsContainer sx={{ py: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                    אין תגובות מקושרות להצגה
                </Typography>
            </DetailsContainer>
        );
    }

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
                        searchQuery={searchQuery}
                    />
                );
            })}
        </DetailsContainer>
    );
};
