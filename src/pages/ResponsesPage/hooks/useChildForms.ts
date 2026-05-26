import { useEffect, useMemo, useState, useCallback } from "react";
import { getFormById } from "../../../api/formsApi";
import { getResponsesRows } from "../../../api/responsesApi";
import type { FormDto, FormFieldDto } from "../../../types/shared";
import { fieldType } from "formula-gear";
import { Row } from "../../../utils/interfaces";
import { FieldTypeIds } from "../../../utils/interfaces";

type FieldExtra = {
    connectedFormId?: number | string;
    linkedFormId?: number | string;
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
    getChildFormData: (connectedFormId: number | string) => ChildFormData | undefined;
}

const getFieldExtra = (field: FormFieldDto): FieldExtra => {
    return ((field.extra ?? {}) as FieldExtra) || {};
};

const getFormFields = (form: FormDto | null): FormFieldDto[] => {
    if (!form) return [];

    const sectionsFields = (form.sections ?? [])
        .slice()
        .sort((a, b) => a.index - b.index)
        .flatMap((section) => (section.fields ?? []).slice().sort((a, b) => a.index - b.index));

    if (sectionsFields.length > 0) return sectionsFields;
    return (form as any).fields ?? [];
};

const fetchChildFormData = async (
    connectedFormId: number | string,
    parentFormId: number,
): Promise<ChildFormData | null> => {
    try {
        const formData = await getFormById(Number(connectedFormId));

        if (formData) {
            return { form: formData, rows: [] };
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
                const isFormType = field.fieldType === fieldType.Form ||
                    (field as any).typeId === FieldTypeIds.linkedForm ||
                    (field as any).fieldType === FieldTypeIds.linkedForm;

                return isFormType && !!(extra.connectedFormId || extra.linkedFormId);
            }),
        [formFields],
    );

    const hasFormInFormFields = formInFormFields.length > 0;

    const childFormIds = useMemo(
        () =>
            formInFormFields
                .map((field) => {
                    const id = getFieldExtra(field).connectedFormId || getFieldExtra(field).linkedFormId;
                    return id ? Number(id) : undefined;
                })
                .filter((id): id is number => typeof id === "number" && !isNaN(id)),
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

        Promise.all(childFormIds.map((id) => fetchChildFormData(id, form.id)))
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

    const getChildFormData = useCallback(
        (connectedFormId: number | string): ChildFormData | undefined => {
            return childrenFormsData.find(
                (data) => String(data.form.id) === String(connectedFormId),
            );
        },
        [childrenFormsData],
    );

    return useMemo(
        () => ({
            childrenFormsData,
            hasFormInFormFields,
            loadingChildForms,
            getChildFormData,
        }),
        [childrenFormsData, hasFormInFormFields, loadingChildForms, getChildFormData],
    );
};
