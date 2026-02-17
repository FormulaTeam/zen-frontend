import React, { useMemo } from "react";
import { Box } from "@mui/material";
import { Form, Row, FieldTypeIds, FormField } from "@utils/interfaces";
import { ChildResponsesPanel } from "./ChildResponsesPanel";
import { DetailsContainer } from "../../styled";

interface ChildFormData {
    form: Form;
    rows: Row[];
}

interface ExpandedRowContentProps {
    parentRowId: number;
    parentFormId: number;
    parentFormFields: FormField[];
    childrenFormsData: ChildFormData[];
    isInEditMode?: boolean;
}

export const ExpandedRowContent: React.FC<ExpandedRowContentProps> = ({
    parentRowId,
    parentFormId,
    parentFormFields,
    childrenFormsData,
    isInEditMode = false,
}) => {

    const formInFormFields: FormField[] = useMemo(() => {
        return parentFormFields.filter(
            (field: FormField) => field.typeId === FieldTypeIds.form && field.connectedFormId
        );
    }, [parentFormFields]);

    const childResponsesByForm = useMemo(() => {
        return formInFormFields.map((field) => {
            const childFormData = childrenFormsData.find(
                (data) => data.form.id === field.connectedFormId
            );

            if (!childFormData) {
                return {
                    field,
                    form: null,
                    responses: [],
                };
            }

            const responses: Row[] = childFormData.rows
                .filter((row) => {
                    const [, parentResId] = row.parentResponse?.split(";") || [];
                    return parentResId === String(parentRowId);
                });

            return {
                field,
                form: childFormData.form,
                responses,
            };
        });
    }, [formInFormFields, childrenFormsData, parentRowId]);

    const hasChildResponses = childResponsesByForm.some((item) => item.responses.length > 0);

    if (!hasChildResponses) {
        return <Box />;
    }

    return (
        <DetailsContainer>
            {childResponsesByForm.map((item, index) => {
                if (!item.form || item.responses.length === 0) {
                    return null;
                }

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
