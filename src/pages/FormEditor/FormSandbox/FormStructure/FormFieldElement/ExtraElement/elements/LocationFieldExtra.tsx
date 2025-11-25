import { FieldTypeIds } from "../../../../../../../utils/interfaces";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import { ExtraElementProps } from "../index";
import { LocationFormat } from "../../../../../schemas/locationSchema";

type Props = ExtraElementProps<typeof FieldTypeIds.location>;

function LocationFieldExtra({ extra, onChange, disabled }: Props) {
  const {
    format = LocationFormat.UTM,
  } = extra;

  return (
    <>
      <FormControl disabled={disabled}>
        <FormLabel>פורמט</FormLabel>
        <RadioGroup row value={format} onChange={(e) => {
          onChange({format: e.target.value as LocationFormat});
        }}>
          <FormControlLabel value={LocationFormat.UTM} control={<Radio />} label="UTM" />
          <FormControlLabel value={LocationFormat.WKT} control={<Radio />} label="WKT" />
        </RadioGroup>
      </FormControl>
    </>
  );
}

export { LocationFieldExtra };