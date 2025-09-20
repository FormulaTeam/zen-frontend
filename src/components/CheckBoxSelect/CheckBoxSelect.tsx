import {
  Box,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Info } from "@mui/icons-material";
import { FormField } from "../../utils/interfaces";
import { CheckboxInitialValType } from "../../types/enums/formFields.enums";

interface CheckBoxSelectProps {
  formField: FormField;
  setFormFields: (newFormFields: FormField[]) => void;
  index: number;
  formFields: FormField[];
}

const CheckBoxSelect: React.FC<CheckBoxSelectProps> = ({
  formField,
  setFormFields,
  index,
  formFields,
}: CheckBoxSelectProps) => {
  const handleChange = (event: SelectChangeEvent) => {
    const val = event.target?.value ?? "";
    const newFormFields = [...formFields];
    const item = newFormFields.find((i) => i.index === index);
    if (item) item.initialValType = val;
    setFormFields(newFormFields);
  };

  return (
    <FormControl sx={{ width: 180 }} margin="normal">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
        <FormLabel component="legend" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
          ערך ברירת המחדל
        </FormLabel>
        <Tooltip title="לתשומת ליבך, שדה זה הוא כשדה חובה מכיוון שתמיד יהיה ערך בשדה - כן/לא">
          <IconButton size="small" sx={{ padding: 0 }}>
            <Info fontSize="small" color="disabled" />
          </IconButton>
        </Tooltip>
      </Box>
      <Select
        size="small"
        value={formField.initialValType || CheckboxInitialValType.EMPTY}
        onChange={handleChange}>
        <MenuItem value={CheckboxInitialValType.CHECKED}>כן</MenuItem>
        <MenuItem value={CheckboxInitialValType.EMPTY}>לא</MenuItem>
      </Select>
    </FormControl>
  );
};

export default CheckBoxSelect;
