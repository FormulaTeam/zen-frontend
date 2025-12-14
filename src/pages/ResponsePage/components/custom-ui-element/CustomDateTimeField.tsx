import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getFormat } from "../../utils/dateFormating";
import CustomTextField from "./CustomTextField";
import { GenericFieldsProps } from "../../interfaces/GenericFieldsProps";

dayjs.extend(customParseFormat);

interface CustomDateTimeFieldProps extends GenericFieldsProps {
  dateAndTime?: boolean;
  type?: "date" | "time";
  showSeconds?: boolean;
}

const CustomDateTimeField: React.FC<CustomDateTimeFieldProps> = ({
  label,
  required,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  dateAndTime,
  type,
  showSeconds,
}) => {
  const isTimeOnly = type === "time";

  const inputValue = getFormat(dateAndTime, showSeconds, type, value);

  return (
    <div>
      <CustomTextField
        label={label}
        required={required}
        type={isTimeOnly ? "time" : dateAndTime ? "datetime-local" : "date"}
        value={inputValue}
        inputProps={isTimeOnly && showSeconds ? { step: 1 } : undefined}
        onChange={(e) => {
          const raw = e.target.value;
          const formatted = getFormat(dateAndTime, showSeconds, type, raw);
          onChange(formatted);
        }}
        onBlur={onBlur}
        error={error}
        helperText={helperText}
      />
    </div>
  );
};

export default CustomDateTimeField;
