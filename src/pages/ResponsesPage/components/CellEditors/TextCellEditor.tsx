import React, { useEffect, useState } from "react";
import { TextField, styled } from "@mui/material";
import { preventEnterKeyNavigation } from "../../../../utils/utils";

const StyledTextField = styled(TextField)(({ theme }) => ({
    width: "100%",
    height: "100%",
    "& .MuiInputBase-root": {
        height: "100%",
        overflowY: 'scroll',
        fontSize: "1.2rem",
        padding: "8px 12px",
        alignItems: "flex-start",
        "&.MuiInput-multiline": {
            "&::-webkit-scrollbar": {
                width: '5px',
            },
            "&::-webkit-scrollbar-track": {
                backgroundColor: theme.palette.background.default,

            },
            "&::-webkit-scrollbar-thumb": {
                backgroundColor: theme.scrollBar.color,
                borderRadius: theme.scrollBar.borderRadius,
            },
        },
    },
}));

interface TextCellEditorProps {
    value: string;
    onChange: (value: string, isValid: boolean) => void;
    multiline?: boolean;
    validationRegex?: string;
    isRequired?: boolean;
    errorMessage?: string;
}

export const TextCellEditor: React.FC<TextCellEditorProps> = ({
    value,
    onChange,
    multiline = false,
    validationRegex,
    isRequired = false,
    errorMessage,
}) => {
    const [localValue, setLocalValue] = useState(value || "");

    useEffect(() => {
        setLocalValue(value || "");
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setLocalValue(newValue);

        let isValid = true;
        if (isRequired && !newValue) {
            isValid = false;
        } else if (newValue && validationRegex) {
            const reg = new RegExp(validationRegex);
            isValid = reg.test(newValue);
        }

        onChange(newValue, isValid);
    };

    return (
        <StyledTextField
            fullWidth
            multiline={multiline}
            value={localValue}
            onChange={handleChange}
            onKeyDown={(e) => preventEnterKeyNavigation(e, multiline)}
            error={!!errorMessage}
            variant="standard"
            autoFocus
            slotProps={{
                input: {
                    disableUnderline: true,
                },
            }}
        />
    );
};
