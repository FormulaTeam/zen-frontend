import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { TimePickerComponent } from "./TimePickerComponent";

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
        <TimePickerComponent
            value={localValue}
            onChange={handleChange}
            showSeconds={showSeconds}
            autoFocus={true}
        />
    );
};
