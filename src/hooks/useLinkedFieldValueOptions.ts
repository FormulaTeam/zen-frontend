import { useEffect, useState } from "react";
import { useFindOwnerFormId } from "./useFindOwnerFormId";
import { usePaginatedFieldValueOptions } from "./usePaginatedFieldValueOptions";

export const useLinkedFieldValueOptions = (
    linkedOptionsFieldId?: string,
    enabled = true,
    search = "",
    dependentFieldId?: string,
    dependentValues?: string[],
) => {
    const { findOwnerFormIdByFieldId } = useFindOwnerFormId();
    const [ownerFormId, setOwnerFormId] = useState<number | undefined>();
    const [resolvedFieldId, setResolvedFieldId] = useState<string | undefined>();

    useEffect(() => {
        if (!enabled || !linkedOptionsFieldId) {
            setOwnerFormId(undefined);
            setResolvedFieldId(undefined);
            return;
        }

        let cancelled = false;

        setOwnerFormId(undefined);
        setResolvedFieldId(undefined);

        findOwnerFormIdByFieldId(linkedOptionsFieldId).then((formId) => {
            if (!cancelled) {
                setOwnerFormId(formId);
                setResolvedFieldId(linkedOptionsFieldId);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [enabled, linkedOptionsFieldId, findOwnerFormIdByFieldId]);

    const { options, isLoading, isFetchingNextPage, loadMore, hasNextPage } = usePaginatedFieldValueOptions({
        formId: ownerFormId,
        fieldId: linkedOptionsFieldId,
        search,
        dependentFieldId,
        dependentValues,
    });

    const isResolvingOwner =
        enabled &&
        !!linkedOptionsFieldId &&
        resolvedFieldId !== linkedOptionsFieldId;

    return {
        options,
        isLoading: isResolvingOwner || isLoading,
        isFetchingNextPage,
        loadMore,
        hasNextPage,
    };
};
