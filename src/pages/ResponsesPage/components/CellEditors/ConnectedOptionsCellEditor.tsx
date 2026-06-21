import React from "react";

import { OptionsCellEditor } from "./OptionsCellEditor";
import { useLinkedFieldValueOptions } from "@src/hooks/useLinkedFieldValueOptions";

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
    const {
        options: optionObjects,
        isLoading,
        loadMore,
    } = useLinkedFieldValueOptions(linkedOptionsFieldId);

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
            onScrollToBottom={loadMore}
        />
    );
};