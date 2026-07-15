import React from "react";

import { OptionsCellEditor } from "./OptionsCellEditor";
import { useLinkedFieldValueOptions } from "@src/hooks/useLinkedFieldValueOptions";

interface ConnectedOptionsCellEditorProps {
    linkedOptionsFieldId: string;
    dependentFieldId?: string;
    dependentValue?: string;
    value: string | string[];
    onChange: (value: string | string[], isValid: boolean) => void;
    selectionMode?: "single" | "multiple";
    isRequired?: boolean;
    errorMessage?: string;
}

export const ConnectedOptionsCellEditor: React.FC<ConnectedOptionsCellEditorProps> = ({
    linkedOptionsFieldId,
    dependentFieldId,
    dependentValue,
    ...rest
}) => {
    const {
        options: optionObjects,
        isLoading,
        isFetchingNextPage,
        loadMore,
        hasNextPage,
    } = useLinkedFieldValueOptions(
        linkedOptionsFieldId,
        true,
        "",
        dependentValue ? dependentFieldId : undefined,
        dependentValue,
    );

    const options = optionObjects.map((option) => option.id);

    const optionLabels = Object.fromEntries(
        optionObjects.map((option) => [option.id, option.text]),
    );

    return (
        <OptionsCellEditor
            {...rest}
            options={options}
            optionLabels={optionLabels}
            loading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onScrollToBottom={loadMore}
        />
    );
};
