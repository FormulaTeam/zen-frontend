import { OptionsSource } from "../../../../../../../schemas/optionsSchema";
import { Button, TextField } from "@mui/material";
import { ExtraElementProps } from "../../../index";
import { OptionsFieldTypeId, SpecificOptions, SpecificOptionsErrors } from "../index";
import styles from "../../../../../FormSection/style.module.css";
import { Close } from "@mui/icons-material";
import { generateOptionItemId } from "../../../../../../../utils";
import { useEffect } from "react";
import { ArrayElement } from "../../../../../../../../../types/utils";

interface Props extends Omit<ExtraElementProps<OptionsFieldTypeId>, "extra" | "validationErrors" | "disabled"> {
  options: SpecificOptions<OptionsSource.MANUAL>;
  validationErrors: SpecificOptionsErrors<OptionsSource.MANUAL> | undefined;
}

function generateEmptyItem(): ArrayElement<SpecificOptions<OptionsSource.MANUAL>["items"]> {
  return {
    id: generateOptionItemId(),
    text: "",
  };
}

function ManualOptions(props: Props) {
  const {
    options,
    validationErrors,
    onChange,
  } = props;

  const {
    items = [generateEmptyItem(), generateEmptyItem()],
    defaultOptionId,
    controllingOptionsFieldId,
  } = options ?? {};

  useEffect(() => {
    onChange({ source: OptionsSource.MANUAL, options: { ...options, items } });
  }, []);

  return (
    <div>
      {
        items.map((item, index) =>
          <div key={item.id} style={{ display: "flex" }}>
            <TextField fullWidth
                       variant={"standard"}
                       value={item.text}
                       placeholder={`הזנת אפשרות ${index + 1}`}
                       error={!!validationErrors?.properties?.items?.items?.[index]?.properties?.text}
                       helperText={validationErrors?.properties?.items?.items?.[index]?.properties?.text?.errors[0]}
                       onChange={(e) => onChange({
                         options: {
                           ...options,
                           items: items.toSpliced(index, 1, { ...item, text: e.target.value }),
                         },
                       })} />
            <Button className={styles.button}
                    onClick={(_) => {
                      items.length > 2 &&
                      onChange({ options: { ...options, items: items.toSpliced(index, 1) } });
                    }}>
              <Close sx={{ fontSize: 20, color: "#a54160" }} />
            </Button>
          </div>,
        )
      }
      <Button style={{ width: "100%", justifyContent: "start", marginTop: 10 }}
              onClick={(_) => {
                onChange({ options: { ...options, items: [...items, generateEmptyItem()] } });
              }}>
        + הוספת אפשרות נוספת
      </Button>
    </div>
  );
}

export { ManualOptions };