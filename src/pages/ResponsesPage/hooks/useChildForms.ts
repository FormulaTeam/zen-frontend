import { useEffect, useState } from "react";
import { getFormById } from "../../../api/formsApi";
import { getResponsesRows } from "../../../api/responsesApi";
import { FieldTypeIds, Form, Row } from "../../../utils/interfaces";

interface UseChildFormsProps {
    form: Form | null;
}

interface ChildFormData {
    form: Form;
    rows: Row[];
}

interface UseChildFormsReturn {
    childrenFormsData: ChildFormData[];
    hasFormInFormFields: boolean;
    loadingChildForms: boolean;
    getChildFormData: (connectedFormId: number) => ChildFormData | undefined;
}

const fetchChildFormData = async (connectedFormId: number, parentFormId: number): Promise<ChildFormData | null> => {
    try {
        const formData = await getFormById(connectedFormId);
        const rowsData = await getResponsesRows({
            filter: {
                form_id: connectedFormId,
                query: {
                    parentResponse: { $regex: `${parentFormId};` },
                },
            }
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

    const hasFormInFormFields = !!form?.fields?.some((field) => field.typeId === FieldTypeIds.form);

    const formInFormFields = form?.fields?.filter((field) =>
        field.typeId === FieldTypeIds.form && field.connectedFormId
    ) || [];

    const childFormIds = formInFormFields.map(f => f.connectedFormId).filter((id): id is number => typeof id === "number");

    useEffect(() => {
        let isMounted = true;
        if (!hasFormInFormFields || !form?.id || childFormIds.length === 0) {
            setChildrenFormsData([]);
            setLoadingChildForms(false);
            return;
        }
        setLoadingChildForms(true);
        Promise.all(
            childFormIds.map((connectedFormId) =>
                fetchChildFormData(connectedFormId, form.id)
            )
        ).then((results) => {
            if (isMounted) {
                setChildrenFormsData(results.filter(Boolean) as ChildFormData[]);
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
