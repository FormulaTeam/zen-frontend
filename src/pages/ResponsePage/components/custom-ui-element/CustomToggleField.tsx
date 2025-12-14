import { FormControlLabel, Switch } from "@mui/material";
import { GenericFieldsProps } from "../../interfaces/GenericFieldsProps";

const CustomToggleField: React.FC<GenericFieldsProps> = ({
  label,
  required,
  value,
  onChange,
  key,
}) => {
  return (
    <FormControlLabel
      key={key}
      label={label}
      required={required}
      control={<Switch checked={value} onChange={(event, checked) => onChange(checked)} />}
    />
  );
};

export default CustomToggleField;
