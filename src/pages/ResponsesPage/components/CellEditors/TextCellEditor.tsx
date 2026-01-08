import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";

interface TextCellEditorProps {
    value: string;
    onChange: (value: string) => void;
    multiline?: boolean;
    validationRegex?: string;
    isRequired?: boolean;
}

export const TextCellEditor: React.FC<TextCellEditorProps> = ({
    value,
    onChange,
    multiline = false,
    validationRegex,
    isRequired = false,
}) => {
    const [localValue, setLocalValue] = useState(value || "");
    const [error, setError] = useState(false);

    useEffect(() => {
        setLocalValue(value || "");
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setLocalValue(newValue);

        // Validate
        let isValid = true;
        if (isRequired && !newValue) {
            isValid = false;
        } else if (newValue && validationRegex) {
            const reg = new RegExp(validationRegex);
            isValid = reg.test(newValue);
        }

        setError(!isValid);
        onChange(newValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (multiline && event.key === 'Enter' && !event.shiftKey) {
            // For multiline, allow Enter to create new line
            // Don't stop propagation so it works naturally
            return;
        }

        // Stop event propagation for other keys to prevent grid navigation
        event.stopPropagation();
    };

    return (
        <TextField
            fullWidth
            multiline={multiline}
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            error={error}
            variant="standard"
            autoFocus
            InputProps={{
                disableUnderline: true,
                sx: {
                    fontSize: "1rem",
                    padding: "8px 12px",
                    minHeight: multiline ? "80px" : "40px",
                    alignItems: "flex-start",
                    "& textarea": {
                        resize: multiline ? "vertical" : "none",
                        minHeight: multiline ? "60px" : "unset",
                    },
                },
            }}
            sx={{
                width: "100%",
                height: "100%",
                "& .MuiInputBase-root": {
                    height: "100%",
                },
            }}
        />
    );
};
