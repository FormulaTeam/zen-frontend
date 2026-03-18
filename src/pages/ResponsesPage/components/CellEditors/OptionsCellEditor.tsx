import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, Chip, styled } from "@mui/material";

const StyledTextField = styled(TextField)({
    "& .MuiInputBase-root": {
        fontSize: "1rem",
        padding: "4px 8px",
        minHeight: "40px",
    },
});

const StyledAutocomplete = styled(Autocomplete)({
    "& .MuiAutocomplete-inputRoot": {
        padding: "2px 8px",
        paddingRight: "65px !important",
    },
}) as typeof Autocomplete;

const StyledChip = styled(Chip)({
    margin: "2px",
    fontSize: "1rem",
});

interface OptionsCellEditorProps {
    value: string | string[];
    onChange: (value: string | string[], isValid: boolean) => void;
    options: string[];
    multiSelect?: boolean;
    isRequired?: boolean;
    errorMessage?: string;
}

const normalizeValue = (value: string | string[], multiSelect: boolean): string | string[] => {
    if (multiSelect) {
        if (Array.isArray(value)) {
            return value;
        } else if (value) {
            return [value];
        } else {
            return [];
        }
    } else {
        if (Array.isArray(value)) {
            return value[0] || "";
        } else {
            return value || "";
        }
    }
};

export const OptionsCellEditor: React.FC<OptionsCellEditorProps> = ({
    value,
    onChange,
    options,
    multiSelect = false,
    isRequired = false,
    errorMessage,
}) => {
    const [localValue, setLocalValue] = useState<string | string[]>(() =>
        normalizeValue(value, multiSelect)
    );

    useEffect(() => {
        const normalized = normalizeValue(value, multiSelect);
        setLocalValue(normalized);
    }, [value, multiSelect]);

    const handleChange = (_event: React.SyntheticEvent, newValue: string | string[] | null) => {
        let normalized: string | string[];

        if (newValue == null) {
            normalized = multiSelect ? [] : "";
        } else {
            normalized = newValue;
        }

        setLocalValue(normalized);
        const isEmpty = (multiSelect ? (Array.isArray(normalized) && normalized.length === 0) : (!normalized || normalized === ""));
        const isValid = !(isRequired && isEmpty);
        onChange(normalized, isValid);
    };

    return (
        <StyledAutocomplete
            fullWidth
            multiple={multiSelect}
            value={localValue}
            onChange={handleChange}
            options={options}
            disableCloseOnSelect={multiSelect}
            autoHighlight
            openOnFocus
            slotProps={{
                clearIndicator: {
                    title: "",
                },
                popupIndicator: {
                    title: "",
                },
            }}
            renderInput={(params) => (
                <StyledTextField
                    {...params}
                    variant="standard"
                    autoFocus
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            disableUnderline: true,
                        },
                    }}
                    error={!!errorMessage}
                    helperText={undefined}
                />
            )}
            renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => {
                    const { key, ...chipProps } = getTagProps({ index });

                    return (
                        <StyledChip
                            key={key}
                            {...chipProps}
                            label={option}
                            size="small"
                        />
                    );
                })
            }
        />
    );
};
