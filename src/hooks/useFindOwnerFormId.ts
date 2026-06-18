import { useCallback, useRef } from "react";
import apiClient from "../api/config";
import { FormDto, FormSectionDto } from "../types/shared";
import { useGetFormsData } from "./useGetFormsData";
import { formsScopeOption } from "../types/enums/filtersAndSorts.enum";

const getFieldsFromForm = (form: FormDto) =>
    (form.sections ?? []).flatMap((section: FormSectionDto) => section.fields ?? []);

const ownerFormIdCache = new Map<string, number | null>();
const pendingLookups = new Map<string, Promise<number | undefined>>();

export const useFindOwnerFormId = () => {
    const { formsData: allForms, isLoading: isLoadingForms } = useGetFormsData({
        searchQuery: undefined,
        scope: formsScopeOption.LinkableForms,
        enabled: true,
    });

    const allFormsRef = useRef(allForms);
    allFormsRef.current = allForms;

    const findOwnerFormIdByFieldId = useCallback(
        async (linkedOptionsFieldId: string): Promise<number | undefined> => {
            if (ownerFormIdCache.has(linkedOptionsFieldId)) {
                return ownerFormIdCache.get(linkedOptionsFieldId) ?? undefined;
            }

            const pending = pendingLookups.get(linkedOptionsFieldId);
            if (pending) return pending;

            const lookup = (async () => {
                for (const formOverview of allFormsRef.current) {
                    const formId = Number(formOverview.id);
                    if (!formId) continue;

                    const response = await apiClient.get<FormDto>(`/forms/${formId}`, {
                        params: { includePermissions: true },
                    });

                    const fields = getFieldsFromForm(response.data);
                    if (fields.some((field) => String(field.id) === String(linkedOptionsFieldId))) {
                        ownerFormIdCache.set(linkedOptionsFieldId, formId);
                        return formId;
                    }
                }

                ownerFormIdCache.set(linkedOptionsFieldId, null);
                return undefined;
            })();

            pendingLookups.set(linkedOptionsFieldId, lookup);
            try {
                return await lookup;
            } finally {
                pendingLookups.delete(linkedOptionsFieldId);
            }
        },
        [],
    );

    return { findOwnerFormIdByFieldId, isLoadingForms, allForms };
};