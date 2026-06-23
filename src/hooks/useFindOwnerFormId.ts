import { useCallback, useState } from "react";
import { getFormIdByFieldId } from "../api/formsApi";

const ownerFormIdCache = new Map<string, number | null>();
const pendingLookups = new Map<string, Promise<number | undefined>>();

export const useFindOwnerFormId = () => {
    const [isLoadingForms, setIsLoadingForms] = useState(false);

    const findOwnerFormIdByFieldId = useCallback(
        async (linkedOptionsFieldId: string): Promise<number | undefined> => {
            if (ownerFormIdCache.has(linkedOptionsFieldId)) {
                return ownerFormIdCache.get(linkedOptionsFieldId) ?? undefined;
            }

            const pending = pendingLookups.get(linkedOptionsFieldId);
            if (pending) return pending;

            setIsLoadingForms(true);

            const lookup = (async () => {
                const ownerFormId = await getFormIdByFieldId(linkedOptionsFieldId);

                ownerFormIdCache.set(linkedOptionsFieldId, ownerFormId);

                return ownerFormId ?? undefined;
            })();

            pendingLookups.set(linkedOptionsFieldId, lookup);

            try {
                return await lookup;
            } finally {
                pendingLookups.delete(linkedOptionsFieldId);
                setIsLoadingForms(false);
            }
        },
        [],
    );

    return {
        findOwnerFormIdByFieldId,
        isLoadingForms,
    };
};