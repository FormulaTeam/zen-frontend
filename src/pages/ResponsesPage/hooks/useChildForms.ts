import { useEffect, useMemo, useState } from "react";
import { getFormById } from "../../../api/formsApi";
import { getResponsesRows } from "../../../api/responsesApi";
import type { FormDto, FormFieldDto } from "../../../types/shared";
import { fieldType } from "formula-gear";
import { Row } from "../../../utils/interfaces";

type FieldExtra = {
    connectedFormId?: number;
};

interface UseChildFormsProps {
    form: FormDto | null;
}

interface ChildFormData {
    form: FormDto;
    rows: Row[];
}

interface UseChildFormsReturn {
    childrenFormsData: ChildFormData[];
    hasFormInFormFields: boolean;
    loadingChildForms: boolean;
    getChildFormData: (connectedFormId: number) => ChildFormData | undefined;
}

const getFieldExtra = (field: FormFieldDto): FieldExtra => {
    return ((field.extra ?? {}) as FieldExtra) || {};
};

const getFormFields = (form: FormDto | null): FormFieldDto[] => {
    if (!form) return [];

    return (form.sections ?? [])
        .slice()
        .sort((a, b) => a.index - b.index)
        .flatMap((section) => (section.fields ?? []).slice().sort((a, b) => a.index - b.index));
};

const fetchChildFormData = async (
    connectedFormId: number,
    parentFormId: number,
): Promise<ChildFormData | null> => {
    try {
        const formData = await getFormById(connectedFormId);
        const rowsData = await getResponsesRows({
            filter: {
                form_id: connectedFormId,
                query: `parentResponse: { $regex: ${parentFormId};`,
            },
            form: formData || undefined,
        });

        if (formData && rowsData) {
            return { form: formData, rows: rowsData };
        }

        return null;
    } catch {
        return null;
    }
};

export const useChildForms = ({ form }: UseChildFormsProps): UseChildFormsReturn => {
    const [childrenFormsData, setChildrenFormsData] = useState<ChildFormData[]>([]);
    const [loadingChildForms, setLoadingChildForms] = useState(false);

    const formFields = useMemo(() => getFormFields(form), [form]);

    const formInFormFields = useMemo(
        () =>
            formFields.filter((field) => {
                const extra = getFieldExtra(field);
                return field.fieldType === fieldType.Form && !!extra.connectedFormId;
            }),
        [formFields],
    );

    const hasFormInFormFields = formInFormFields.length > 0;

    const childFormIds = useMemo(
        () =>
            formInFormFields
                .map((field) => getFieldExtra(field).connectedFormId)
                .filter((id): id is number => typeof id === "number"),
        [formInFormFields],
    );

    useEffect(() => {
        let isMounted = true;

        if (!hasFormInFormFields || !form?.id || childFormIds.length === 0) {
            setChildrenFormsData([]);
            setLoadingChildForms(false);
            return;
        }

        setLoadingChildForms(true);

        Promise.all(childFormIds.map((connectedFormId) => fetchChildFormData(connectedFormId, form.id)))
            .then((results) => {
                if (isMounted) {
                    setChildrenFormsData(results.filter(Boolean) as ChildFormData[]);
                    setLoadingChildForms(false);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setChildrenFormsData([]);
                    setLoadingChildForms(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [hasFormInFormFields, form?.id, childFormIds.join(",")]);

    const getChildFormData = (connectedFormId: number): ChildFormData | undefined => {
        return childrenFormsData.find((data) => data.form.id === connectedFormId);
    };

    return {
        childrenFormsData,
        hasFormInFormFields,
        loadingChildForms,
        getChildFormData,
    };
};
