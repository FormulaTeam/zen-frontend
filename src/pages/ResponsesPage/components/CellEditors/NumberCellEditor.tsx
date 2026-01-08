import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";

interface NumberCellEditorProps {
    value: number | string;
    onChange: (value: number | string) => void;
    numberType?: string;
    minValue?: number;
    maxValue?: number;
    isRequired?: boolean;
}

export const NumberCellEditor: React.FC<NumberCellEditorProps> = ({
    value,
    onChange,
    numberType = "integer",
    minValue,
    maxValue,
    isRequired = false,
}) => {
    const [localValue, setLocalValue] = useState<string>(String(value ?? ""));
    const [error, setError] = useState(false);

    useEffect(() => {
        setLocalValue(String(value ?? ""));
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setLocalValue(newValue);

        // Validate
        let isValid = true;
        if (isRequired && !newValue) {
            isValid = false;
        } else if (newValue) {
            const numValue = numberType === "integer" ? parseInt(newValue, 10) : parseFloat(newValue);

            if (isNaN(numValue)) {
                isValid = false;
            } else {
                if (minValue !== undefined && numValue < minValue) isValid = false;
                if (maxValue !== undefined && numValue > maxValue) isValid = false;
            }
        }

        setError(!isValid);
        onChange(newValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // Stop event propagation to prevent grid navigation
        event.stopPropagation();
    };

    return (
        <TextField
            fullWidth
            type="number"
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
                    minHeight: "40px",
                },
            }}
            inputProps={{
                step: numberType === "integer" ? 1 : "any",
                min: minValue,
                max: maxValue,
            }}
            sx={{
                width: "100%",
                "& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button": {
                    opacity: 1,
                },
            }}
        />
    );
};
