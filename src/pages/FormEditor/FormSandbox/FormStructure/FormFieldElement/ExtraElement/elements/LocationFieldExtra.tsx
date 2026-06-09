import { FieldTypeIds } from "@utils/interfaces";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Tooltip } from "@mui/material";
import { ExtraElementProps } from "../index";
import { Info } from "@mui/icons-material";
import { LabelWithIcon, IconWrapper } from "./styled";
import { locationFormat } from "formula-gear";

type Props = ExtraElementProps<typeof FieldTypeIds.location>;

function LocationFieldExtra({ extra, onChange, disabled }: Props) {
  const { locationFormat: format = locationFormat.UTM } = extra;

  return (
    <>
      <FormControl disabled={disabled}>
        <FormLabel>פורמט</FormLabel>
        <RadioGroup row value={format} onChange={(e) => {
          onChange({ locationFormat: e.target.value as any });
        }}>
          <FormControlLabel value={locationFormat.UTM} control={<Radio />} label={
            <LabelWithIcon>
              <span>UTM</span>
              <Tooltip title={"למשל 123456,123456"}>
                <IconWrapper>
                  <Info color="disabled" sx={{ cursor: "pointer" }} />
                </IconWrapper>
              </Tooltip>
            </LabelWithIcon>
          } />
          <FormControlLabel value={locationFormat.WKT} control={<Radio />} label={
            <LabelWithIcon>
              <span>WKT</span>
              <Tooltip title={"למשל 34.242342342,31.235345345"}>
                <IconWrapper>
                  <Info color="disabled" sx={{ cursor: "pointer" }} />
                </IconWrapper>
              </Tooltip>
            </LabelWithIcon>
          } />
        </RadioGroup>
      </FormControl>
    </>
  );
}

export { LocationFieldExtra };
