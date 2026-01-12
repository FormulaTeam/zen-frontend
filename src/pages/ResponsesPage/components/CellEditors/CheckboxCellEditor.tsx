import React, { useEffect, useState } from "react";
import { Box, FormControlLabel, Switch, styled } from "@mui/material";

const CenteredBox = styled(Box)({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    padding: "8px 12px",
});

const StyledFormControlLabel = styled(FormControlLabel)({
    margin: 0,
    "& .MuiFormControlLabel-label": {
        fontSize: "1rem",
    },
});

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
        <CenteredBox>
            <StyledFormControlLabel
                control={
                    <Switch
                        checked={localValue}
                        onChange={handleChange}
                        autoFocus
                    />
                }
                label={label}
            />
        </CenteredBox>
    );
};
