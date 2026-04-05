import { FieldTypeIds } from "@utils/interfaces";
import { FormControl, InputLabel, MenuItem, Select, Tooltip, IconButton } from "@mui/material";
import { ExtraElementProps } from "../index";
import { Info } from "@mui/icons-material";
import { CheckboxExtraContainer } from "./styled";

type Props = ExtraElementProps<typeof FieldTypeIds.checkbox>;

function CheckboxFieldExtra({ extra, onChange, disabled }: Props) {
  const {
    defaultValue = false,
  } = extra;

  return (
    <>
      <CheckboxExtraContainer>
        <FormControl fullWidth disabled={disabled}>
          <InputLabel id="default-value-label">ערך ברירת מחדל</InputLabel>
          <Select labelId="default-value-label"
            value={+defaultValue}
            label="ערך ברירת מחדל"
            onChange={(e) => {
              onChange({ defaultValue: Boolean(e.target.value) });
            }}>
            <MenuItem value={+false}>לא</MenuItem>
            <MenuItem value={+true}>כן</MenuItem>
          </Select>
        </FormControl>
        <Tooltip title="לתשומת ליבך, שדה זה הוא כשדה חובה מכיוון שתמיד יהיה ערך בשדה - כן/לא">
          <IconButton size="small">
            <Info fontSize="small" color="disabled" />
          </IconButton>
        </Tooltip>
      </CheckboxExtraContainer>
    </>
  );
}

export { CheckboxFieldExtra };