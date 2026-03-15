import React from "react";
import { TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import "dayjs/locale/he";

interface TimePickerComponentProps {
    value: Dayjs | null;
    onChange: (value: Dayjs | null) => void;
    showSeconds?: boolean;
    autoFocus?: boolean;
    compact?: boolean;
    errorMessage?: string;
}

const compactInputStyles = {
    "& .MuiInputBase-root": {
        fontSize: "1.2rem",
        padding: "4px 8px",
        minHeight: "32px",
    },
};

const standardInputStyles = {
    "& .MuiInputBase-root": {
        fontSize: "1.2rem",
        padding: "8px 12px",
        minHeight: "40px",
    },
};

const pickerFullWidthStyle = {
    width: "100%",
};

export const TimePickerComponent: React.FC<TimePickerComponentProps> = ({
    value,
    onChange,
    showSeconds = false,
    autoFocus = false,
    compact = false,
    errorMessage,
}) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
            <TimePicker
                value={value}
                onChange={onChange}
                ampm={false}
                format={showSeconds ? "HH:mm:ss" : "HH:mm"}
                views={showSeconds ? ["hours", "minutes", "seconds"] : ["hours", "minutes"]}
                timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                slotProps={{
                    textField: {
                        variant: "standard",
                        fullWidth: true,
                        autoFocus,
                        InputProps: {
                            disableUnderline: true,
                        },
                        sx: compact ? compactInputStyles : standardInputStyles,
                        error: !!errorMessage,
                        helperText: undefined,
                    },
                    popper: {
                        placement: "bottom-start",
                        sx: {
                            '& .MuiList-root.MuiMultiSectionDigitalClockSection-root::after': {
                                display: 'none',
                            },
                        },
                    },
                    actionBar: {
                        actions: ["accept", "cancel"],
                    },
                    digitalClockSectionItem: {
                        sx: {
                            '&:last-of-type': {
                                borderBottom: 'none',
                            },
                        },
                    },
                }}
                localeText={{
                    okButtonLabel: "אישור",
                    cancelButtonLabel: "ביטול",
                }}
                sx={pickerFullWidthStyle}
                skipDisabled
            />
        </LocalizationProvider>
    );
};
