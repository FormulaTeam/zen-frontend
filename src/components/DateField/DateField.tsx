import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  useTheme,
} from "@mui/material";
import { FormField } from "../../utils/interfaces";

type Props = {
  getBaseFieldElement: () => JSX.Element;
  formField: FormField;
  onToggleDateAndTime: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (e: SelectChangeEvent) => void;
};

export default function DateField({
  getBaseFieldElement,
  formField,
  onToggleDateAndTime,
  onDateChange,
}: Props) {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {getBaseFieldElement()}
      <FormControlLabel
        label="תאריך ושעה"
        control={
          <Checkbox
            checked={formField.dateAndTime || false}
            style={{
              color: theme.palette.primary.dark,
            }}
            onChange={onToggleDateAndTime}
          />
        }
      />
      <FormControl sx={{ width: 180 }}>
        <Select
          id="initial-val-type-simple-select"
          className="initial-val-type-simple-select"
          value={formField.initialValType || ""}
          label=""
          displayEmpty
          renderValue={(value: any) => {
            if (!value) {
              return <Typography color="gray">ערך ברירת המחדל</Typography>;
            } else {
              return (
                <Typography color="black">{value === "empty" ? "ריק" : "תאריך של היום"}</Typography>
              );
            }
          }}
          onChange={onDateChange}>
          <MenuItem
            value={"currentTime"}
            className="initial-val-type-menu-item"
            key="initialValType_currentTime">
            תאריך של היום
          </MenuItem>

          <MenuItem
            value={"empty"}
            className="initial-val-type-menu-item"
            key="initialValType_empty">
            ריק
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
