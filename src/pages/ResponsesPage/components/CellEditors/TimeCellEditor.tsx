import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { TimePickerComponent } from "./TimePickerComponent";

interface TimeCellEditorProps {
    value: string | null;
    onChange: (value: string, isValid?: boolean) => void;
    showSeconds?: boolean;
    isRequired?: boolean;
    errorMessage?: string;
}

export const TimeCellEditor: React.FC<TimeCellEditorProps> = ({
    value,
    onChange,
    showSeconds = false,
    isRequired = false,
    errorMessage,
}) => {
    const parseTimeToDayjs = (time: string | null): Dayjs | null => {
        if (!time) return null;
        const [hours, minutes, seconds] = time.split(":").map(Number);
        if (isNaN(hours) || isNaN(minutes)) return null;
        return dayjs()
            .hour(hours)
            .minute(minutes)
            .second(seconds ?? 0)
            .millisecond(0);
    };

    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(
        parseTimeToDayjs(value)
    );

    useEffect(() => {
        setSelectedTime(parseTimeToDayjs(value));
    }, [value]);

    const handleTimeChange = (newTime: Dayjs | null) => {
        setSelectedTime(newTime);
        if (newTime && newTime.isValid()) {
            const timeFormat = showSeconds ? "HH:mm:ss" : "HH:mm";
            onChange(newTime.format(timeFormat), true);
        } else {
            onChange("", !(isRequired ?? false));
        }
    };

    return (
        <TimePickerComponent
            value={selectedTime}
            onChange={handleTimeChange}
            showSeconds={showSeconds}
            autoFocus
            errorMessage={errorMessage}
        />
    );
};
