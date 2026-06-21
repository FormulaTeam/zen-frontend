import { useMemo } from "react";
import { useGetInfiniteFieldValues } from "@api/responsesApi";
import { formatOptionLabel } from "@src/utils/optionResponseValue";

export type PaginatedFieldValueOption = {
    id: string;
    text: string;
};

type UsePaginatedFieldValueOptionsParams = {
    formId?: number;
    fieldId?: string;
    search?: string;
};

export const usePaginatedFieldValueOptions = ({
    formId,
    fieldId,
    search = "",
}: UsePaginatedFieldValueOptionsParams) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useGetInfiniteFieldValues(formId, fieldId, search);

    const options = useMemo<PaginatedFieldValueOption[]>(() => {
        const values =
            data?.pages.flatMap((page) =>
                page.data
                    .map((item: any) => item.value)
                    .filter(
                        (value: any) =>
                            value !== undefined &&
                            value !== null &&
                            String(value).trim() !== "",
                    ),
            ) ?? [];

        const uniqueValues = Array.from(new Set(values.map(String)));

        return uniqueValues.map((value) => ({
            id: value,
            text: formatOptionLabel(value),
        }));
    }, [data]);

    const loadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return {
        options,
        isLoading: isLoading || isFetchingNextPage,
        loadMore,
        hasNextPage,
    };
};