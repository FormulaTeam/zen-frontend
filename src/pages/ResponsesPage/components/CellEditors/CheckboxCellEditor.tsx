import React, { useEffect, useState } from "react";
import { Box, TextField, FormControlLabel, Switch } from "@mui/material";

interface CheckboxCellEditorProps {
    value: boolean;
    onChange: (value: boolean) => void;
    label?: string;
}

export const CheckboxCellEditor: React.FC<CheckboxCellEditorProps> = ({
    value,
    onChange,
    label = "",
}) => {
    const [localValue, setLocalValue] = useState(!!value);

    useEffect(() => {
        setLocalValue(!!value);
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked;
        setLocalValue(newValue);
        onChange(newValue);
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                padding: "8px 12px",
            }}
        >
            <FormControlLabel
                control={
                    <Switch
                        checked={localValue}
                        onChange={handleChange}
                        autoFocus
                    />
                }
                label={label}
                sx={{
                    margin: 0,
                    "& .MuiFormControlLabel-label": {
                        fontSize: "1rem",
                    },
                }}
            />
        </Box>
    );
};
