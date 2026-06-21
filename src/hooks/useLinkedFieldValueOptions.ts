import { useEffect, useState } from "react";
import { useFindOwnerFormId } from "./useFindOwnerFormId";
import { usePaginatedFieldValueOptions } from "./usePaginatedFieldValueOptions";

export const useLinkedFieldValueOptions = (
    linkedOptionsFieldId?: string,
    enabled = true,
    search = "",
) => {
    const { findOwnerFormIdByFieldId } = useFindOwnerFormId();
    const [ownerFormId, setOwnerFormId] = useState<number | undefined>();

    useEffect(() => {
        if (!enabled || !linkedOptionsFieldId) {
            setOwnerFormId(undefined);
            return;
        }

        let cancelled = false;

        findOwnerFormIdByFieldId(linkedOptionsFieldId).then((formId) => {
            if (!cancelled) setOwnerFormId(formId);
        });

        return () => {
            cancelled = true;
        };
    }, [enabled, linkedOptionsFieldId, findOwnerFormIdByFieldId]);

    return usePaginatedFieldValueOptions({
        formId: ownerFormId,
        fieldId: linkedOptionsFieldId,
        search,
    });
};