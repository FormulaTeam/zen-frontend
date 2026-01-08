import React, { useEffect, useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/he";

dayjs.extend(utc);

interface DateCellEditorProps {
    value: string | null;
    onChange: (value: string) => void;
    dateAndTime?: boolean;
    isRequired?: boolean;
}

export const DateCellEditor: React.FC<DateCellEditorProps> = ({
    value,
    onChange,
    dateAndTime = false,
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
            <DatePicker
                value={localValue}
                onChange={handleChange}
                format={dateAndTime ? "DD/MM/YYYY HH:mm" : "DD/MM/YYYY"}
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
