import { FieldTypeIds } from "../../../../../../../utils/interfaces";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material";
import { ExtraElementProps } from "../index";

type Props = ExtraElementProps<typeof FieldTypeIds.linkedForm>;

interface ValidForm {
  id: string;
  title: string;
}

function LinkedFormFieldExtra({ extra, onChange, validationErrors, disabled }: Props) {
  const {
    linkedFormId,
  } = extra;

  const availableForms: ValidForm[] = [
    {
      id: "16",
      title: "cshshvjhv",
    },
    {
      id: "234346657",
      title: "tyklkjklyly",
    },
  ]; //TODO populate with actual forms

  return (
    <>
      <FormControl disabled={disabled || !availableForms.length}
                   error={!!validationErrors?.properties?.linkedFormId}>
        <InputLabel id="linked-form-label">{availableForms.length ? "בחירת טופס" : "אין טפסים זמינים"}</InputLabel>
        <Select labelId="linked-form-label"
                variant={"standard"}
                aria-describedby={"linked-form-helper-text"}
                value={linkedFormId ?? ''}
                label={"בחירת טופס"}
                onChange={(e) => {
                  onChange({ linkedFormId: e.target.value });
                }}>
          {
            availableForms.map((availableForm) => (
              <MenuItem key={availableForm.id} value={availableForm.id}>{availableForm.title}</MenuItem>
            ))
          }
        </Select>
        <FormHelperText id="linked-form-helper-text">
          {validationErrors?.properties?.linkedFormId?.errors[0]}
        </FormHelperText>
      </FormControl>
      <h5 style={{ width: "100%", marginTop: 8, gridColumn: 'span 4' }}>
        שימו לב! על מנת שמשתמש יוכל ליצור תגובות בטופס שנבחר, נדרש שיהיו לו הרשאות מתאימות לטופס שנבחר
      </h5>
    </>
  );
}

export { LinkedFormFieldExtra };