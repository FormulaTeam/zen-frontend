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
    dependentFieldId?: string;
    dependentValues?: string[];
};

export const usePaginatedFieldValueOptions = ({
    formId,
    fieldId,
    search = "",
    dependentFieldId,
    dependentValues,
}: UsePaginatedFieldValueOptionsParams) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useGetInfiniteFieldValues(formId, fieldId, search, dependentFieldId, dependentValues);

    const options = useMemo<PaginatedFieldValueOption[]>(() => {
        if (!data) return [];

        return data.pages.flatMap((page) =>
            page.data.map((item: any) => {
                const value = item.value;
                const stringValue = typeof value === "object" && value !== null ? JSON.stringify(value) : String(value);

                return {
                    id: stringValue,
                    text: formatOptionLabel(typeof value === "string" ? value : stringValue),
                };
            }),
        );
    }, [data]);

    const loadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return {
        options,
        isLoading,
        isFetchingNextPage,
        loadMore,
        hasNextPage,
    };
};
