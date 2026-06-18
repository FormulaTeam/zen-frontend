import React, { useEffect, useMemo, useState } from "react";

import { useGetInfiniteFieldValues } from "@api/responsesApi";
import { useFindOwnerFormId } from "@src/hooks/useFindOwnerFormId";
import { formatOptionLabel } from "@src/utils/optionResponseValue";
import { FilterInputProps, MultiOptionFilterInput, SingleOptionFilterInput } from "./responseFilterInputs";

const useConnectedFilterOptions = (linkedOptionsFieldId: string) => {
    const { findOwnerFormIdByFieldId } = useFindOwnerFormId();
    const [ownerFormId, setOwnerFormId] = useState<number | undefined>(undefined);

    useEffect(() => {
        let isCancelled = false;

        findOwnerFormIdByFieldId(linkedOptionsFieldId).then((resolvedFormId) => {
            if (!isCancelled) setOwnerFormId(resolvedFormId);
        });

        return () => {
            isCancelled = true;
        };
    }, [linkedOptionsFieldId, findOwnerFormIdByFieldId]);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useGetInfiniteFieldValues(ownerFormId, linkedOptionsFieldId, "");

    const options = useMemo(() => {
        const rawValues = Array.from(
            new Set(
                data?.pages.flatMap((page) => page.data.map((item: any) => String(item.value))) ?? [],
            ),
        );

        return rawValues.map((value) => ({ id: value, text: formatOptionLabel(value) }));
    }, [data]);

    const onLoadMore = (): void => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return {
        options,
        loading: isLoading || isFetchingNextPage,
        onLoadMore,
    };
};

type ConnectedOptionFilterInputProps =
    FilterInputProps & {
        linkedOptionsFieldId: string;
    };

export const ConnectedSingleOptionFilterInput: React.FC<ConnectedOptionFilterInputProps> = ({
    linkedOptionsFieldId,
    ...props
}) => {
    const { options, loading, onLoadMore } =
        useConnectedFilterOptions(linkedOptionsFieldId);

    return (
        <SingleOptionFilterInput
            {...props}
            options={options}
            loading={loading}
            onLoadMore={onLoadMore}
        />
    );
};

export const ConnectedMultiOptionFilterInput: React.FC<ConnectedOptionFilterInputProps> = ({
    linkedOptionsFieldId,
    ...props
}) => {
    const { options, loading, onLoadMore } =
        useConnectedFilterOptions(linkedOptionsFieldId);

    return (
        <MultiOptionFilterInput
            {...props}
            options={options}
            loading={loading}
            onLoadMore={onLoadMore}
        />
    );
};