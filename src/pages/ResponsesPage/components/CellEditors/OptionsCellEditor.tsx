import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, Chip } from "@mui/material";

interface OptionsCellEditorProps {
    value: string | string[];
    onChange: (value: string | string[]) => void;
    options: string[];
    multiSelect?: boolean;
    isRequired?: boolean;
}

export const OptionsCellEditor: React.FC<OptionsCellEditorProps> = ({
    value,
    onChange,
    options,
    multiSelect = false,
    isRequired = false,
}) => {
    const [localValue, setLocalValue] = useState<string | string[]>(
        multiSelect
            ? Array.isArray(value)
                ? value
                : value
                    ? [value]
                    : []
            : Array.isArray(value)
                ? value[0] || ""
                : value || ""
    );

    useEffect(() => {
        const normalized = multiSelect
            ? Array.isArray(value)
                ? value
                : value
                    ? [value]
                    : []
            : Array.isArray(value)
                ? value[0] || ""
                : value || "";
        setLocalValue(normalized);
    }, [value, multiSelect]);

    const handleChange = (_event: React.SyntheticEvent, newValue: string | string[] | null) => {
        const normalized = newValue == null ? (multiSelect ? [] : "") : newValue;
        setLocalValue(normalized);
        onChange(normalized);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // Stop propagation to prevent grid navigation while typing
        if (event.key !== 'Escape' && event.key !== 'Tab') {
            event.stopPropagation();
        }
    };

    return (
        <Autocomplete
            fullWidth
            multiple={multiSelect}
            value={localValue}
            onChange={handleChange}
            options={options}
            disableCloseOnSelect={multiSelect}
            autoHighlight
            openOnFocus
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="standard"
                    autoFocus
                    onKeyDown={handleKeyDown}
                    InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                        sx: {
                            fontSize: "1rem",
                            padding: "4px 8px",
                            minHeight: "40px",
                        },
                    }}
                />
            )}
            renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                    <Chip
                        {...getTagProps({ index })}
                        key={option}
                        label={option}
                        size="small"
                        sx={{ margin: "2px" }}
                    />
                ))
            }
            sx={{
                "& .MuiAutocomplete-inputRoot": {
                    padding: "2px 8px",
                },
            }}
        />
    );
};
