import React, { useEffect, useMemo, useState } from "react";

import { useGetInfiniteFieldValues } from "@api/responsesApi";
import { useFindOwnerFormId } from "@src/hooks/useFindOwnerFormId";
import { formatOptionLabel } from "@src/utils/optionResponseValue";
import { OptionsCellEditor } from "./OptionsCellEditor";

interface ConnectedOptionsCellEditorProps {
    linkedOptionsFieldId: string;
    value: string | string[];
    onChange: (value: string | string[], isValid: boolean) => void;
    selectionMode?: "single" | "multiple";
    isRequired?: boolean;
    errorMessage?: string;
}

export const ConnectedOptionsCellEditor: React.FC<ConnectedOptionsCellEditorProps> = ({
    linkedOptionsFieldId,
    ...rest
}) => {
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

    const options = useMemo(
        () =>
            Array.from(
                new Set(
                    data?.pages.flatMap((page) => page.data.map((item: any) => String(item.value))) ?? [],
                ),
            ),
        [data],
    );

    const optionLabels = useMemo(
        () => Object.fromEntries(options.map((option) => [option, formatOptionLabel(option)])),
        [options],
    );

    const handleScrollToBottom = (): void => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return (
        <OptionsCellEditor
            {...rest}
            options={options}
            optionLabels={optionLabels}
            loading={isLoading || isFetchingNextPage}
            onScrollToBottom={handleScrollToBottom}
        />
    );
};