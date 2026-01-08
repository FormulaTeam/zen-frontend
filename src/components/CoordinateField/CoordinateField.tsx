import {
  Box,
  FormControlLabel,
  Grid,
  RadioGroup,
  Radio,
  SelectChangeEvent,
  Tooltip,
  useTheme,
} from "@mui/material";
import { FormField } from "../../utils/interfaces";
import { Info } from "@mui/icons-material";
import { CoordinateType } from "../../validation/field-config.types";

type Props = {
  formField: FormField;
  setFormFields: (newFormFields: FormField[]) => void;
  index: number;
  formFields: FormField[];
};

export default function CoordinateField({
  formField,
  setFormFields,
  index,
  formFields,
}: Props) {
  const theme = useTheme();

  function handleTypeChange(event: SelectChangeEvent) {
    const newFormFields = [...formFields];
    const currentField = newFormFields.find((i) => i.index === index);
    if (currentField) {
      currentField.coordinateType = event.target.value as CoordinateType;
    }
    setFormFields(newFormFields);
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, marginTop: "10px" }}>
      <Grid container direction="column" gap={1}>
        <Grid>
          <RadioGroup
            row={true}
            onChange={handleTypeChange}
            value={formField.coordinateType ?? "UTM"}>
            <FormControlLabel
              value={"UTM"}
              control={<Radio />}
              label={
                <>
                  {"UTM"}
                  <Tooltip title={"למשל 123456,123456"}>
                    <Info fontSize="inherit" color="disabled" />
                  </Tooltip>
                </>
              }
            />
            <Box>
              <FormControlLabel
                value={"WKT"}
                control={<Radio />}
                label={
                  <>
                    {"WKT"}
                    <Tooltip title={"למשל 34.242342342,31.235345345"}>
                      <Info fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </>
                }
              />
            </Box>
          </RadioGroup>
        </Grid>
      </Grid>
    </Box>
  );
}
