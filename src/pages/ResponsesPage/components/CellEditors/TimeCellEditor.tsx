import React, { useEffect, useState } from "react";
import { TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/he";

interface TimeCellEditorProps {
    value: string | null;
    onChange: (value: string) => void;
    showSeconds?: boolean;
    isRequired?: boolean;
}

export const TimeCellEditor: React.FC<TimeCellEditorProps> = ({
    value,
    onChange,
    showSeconds = false,
    isRequired = false,
}) => {
    const [localValue, setLocalValue] = useState<Dayjs | null>(
        value ? dayjs(value) : null
    );

    useEffect(() => {
        setLocalValue(value && dayjs(value).isValid() ? dayjs(value) : null);
    }, [value]);

    const handleChange = (newValue: Dayjs | null) => {
        setLocalValue(newValue);
        if (newValue && newValue.isValid()) {
            onChange(newValue.format("YYYY-MM-DD[T]HH:mm:ss.000"));
        } else {
            onChange("");
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
            <TimePicker
                value={localValue}
                onChange={handleChange}
                ampm={false}
                format={showSeconds ? "HH:mm:ss" : "HH:mm"}
                slotProps={{
                    textField: {
                        variant: "standard",
                        fullWidth: true,
                        autoFocus: true,
                        InputProps: {
                            disableUnderline: true,
                            sx: {
                                fontSize: "1rem",
                                padding: "8px 12px",
                                minHeight: "40px",
                            },
                        },
                        onKeyDown: (event) => {
                            // Stop propagation to prevent grid navigation
                            event.stopPropagation();
                        },
                    },
                    popper: {
                        placement: "bottom-start",
                    },
                }}
                sx={{
                    width: "100%",
                }}
            />
        </LocalizationProvider>
    );
};
