import React, { useEffect, useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Box, styled } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/he";
import { TimePickerComponent } from "./TimePickerComponent";

dayjs.extend(utc);

const DateTimeContainer = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    width: "100%",
});

const StyledDatePicker = styled(DatePicker<Dayjs>)({
    width: "100%",
    "& .MuiInputBase-root": {
        fontSize: "1.2rem",
        padding: "8px 12px",
        minHeight: "40px",
    },
});

const CompactDatePicker = styled(DatePicker<Dayjs>)({
    "& .MuiInputBase-root": {
        fontSize: "1.2rem",
        padding: "4px 8px",
        minHeight: "32px",
    },
});

const commonSlotProps = {
    textField: {
        variant: "standard" as const,
        fullWidth: true,
        autoFocus: true,
        InputProps: {
            disableUnderline: true,
        },
    },
    popper: {
        placement: "bottom-start" as const,
    },
};

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

    const handleTimeChange = (newValue: Dayjs | null) => {
        if (newValue && newValue.isValid() && localValue) {
            const updatedValue = localValue
                .hour(newValue.hour())
                .minute(newValue.minute())
                .second(newValue.second());
            setLocalValue(updatedValue);
            onChange(updatedValue.format("YYYY-MM-DD[T]HH:mm:ss.000"));
        }
    };

    if (dateAndTime) {
        return (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
                <DateTimeContainer>
                    <CompactDatePicker
                        value={localValue}
                        onChange={handleChange}
                        format="DD/MM/YYYY"
                        slotProps={commonSlotProps}
                    />
                    <TimePickerComponent
                        value={localValue}
                        onChange={handleTimeChange}
                        compact={true}
                    />
                </DateTimeContainer>
            </LocalizationProvider>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
            <StyledDatePicker
                value={localValue}
                onChange={handleChange}
                format="DD/MM/YYYY"
                slotProps={commonSlotProps}
            />
        </LocalizationProvider>
    );
};
