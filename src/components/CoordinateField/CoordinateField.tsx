import {
  Box,
  FormControlLabel,
  Grid,
  RadioGroup,
  Radio,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";
import { Info } from "@mui/icons-material";
import { FormFieldDto } from "../../types/shared";

type CoordinateFieldExtra = {
  coordinateType?: string;
};

type Props = {
  formField: FormFieldDto;
  setFormFields: React.Dispatch<React.SetStateAction<FormFieldDto[]>>;
  index: number;
  formFields: FormFieldDto[];
};

const getFieldExtra = (field: FormFieldDto): CoordinateFieldExtra =>
  (field.extra as CoordinateFieldExtra | undefined) ?? {};

export default function CoordinateField({ formField, setFormFields, index, formFields }: Props) {
  function handleTypeChange(event: SelectChangeEvent) {
    const value = event.target.value;

    const newFormFields = formFields.map((field) =>
      field.index === index
        ? {
            ...field,
            extra: {
              ...getFieldExtra(field),
              coordinateType: value,
            },
          }
        : field,
    );

    setFormFields(newFormFields);
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, marginTop: "10px" }}>
      <Grid container direction="column" gap={1}>
        <Grid>
          <RadioGroup
            row={true}
            onChange={handleTypeChange}
            value={getFieldExtra(formField).coordinateType ?? "UTM"}>
            <FormControlLabel
              value="UTM"
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
                value="WKT"
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
