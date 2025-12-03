import { OptionsSource } from "../../../../../../../schemas/optionsSchema";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { ExtraElementProps } from "../../../index";
import { OptionsFieldTypeId, SpecificOptions, SpecificOptionsErrors } from "../index";
import { Close, DatasetLinked, DatasetLinkedOutlined, PlayArrow } from "@mui/icons-material";
import { generateOptionItemId } from "../../../../../../../utils";
import { useEffect, useMemo, useState } from "react";
import { ArrayElement } from "../../../../../../../../../types/utils";
import { FieldTypeIds } from "../../../../../../../../../utils/interfaces";
import { useFormStructureContext } from "../../../../../../../context/FormStructureContext";
import { FormFieldExtra } from "../../../../../../../schemas";
import styles from "./style.module.css";

interface Props extends Omit<ExtraElementProps<OptionsFieldTypeId>, "extra" | "validationErrors" | "disabled"> {
  fieldId: string;
  options: SpecificOptions<OptionsSource.MANUAL>;
  validationErrors: SpecificOptionsErrors<OptionsSource.MANUAL> | undefined;
}

type ManualOptions = SpecificOptions<OptionsSource.MANUAL>;
type ManualItems = ManualOptions["items"];

function generateEmptyItem(): ArrayElement<ManualItems> {
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
    fieldId: id,
  } = props;

  const {
    items = [generateEmptyItem(), generateEmptyItem()],
    defaultOptionId,
    controllingOptionsFieldId,
  } = options ?? {};

  const { formStructure } = useFormStructureContext();
  const [selectedControlledItemIndex, setSelectedControlledItemIndex] = useState<number>(0);

  const otherManualOptionsFieldsIds = useMemo(() => Object.keys(formStructure.fields).filter((fieldId) => {
    const fieldData = formStructure.fields[fieldId].data;

    return (
      fieldId !== id &&
      fieldData.typeId === FieldTypeIds.options &&
      fieldData.extra?.source === OptionsSource.MANUAL &&
      fieldData.displayName
    );
  }), [formStructure.fields]);

  const definedItems = useMemo(() => items.filter((item) => !!item.text), [items]);

  useEffect(() => {
    onChange({ source: OptionsSource.MANUAL, options: { ...options, items } });
  }, []);

  useEffect(() => {
    (controllingOptionsFieldId && !otherManualOptionsFieldsIds.includes(controllingOptionsFieldId)) &&
    onChange({ options: { ...options, controllingOptionsFieldId: undefined } });
  }, [otherManualOptionsFieldsIds.length]);

  useEffect(() => {
    controllingOptionsFieldId &&
    setSelectedControlledItemIndex(0);
  }, [controllingOptionsFieldId]);

  useEffect(() => {
    selectedControlledItemIndex >= items.length &&
    setSelectedControlledItemIndex(items.length - 1);
  }, [items.length]);

  const itemFields = useMemo(() =>
    items.map((item, index) =>
      <div key={item.id} className={styles.itemContainer}>
        <TextField variant={"standard"}
                   className={styles.itemTextField}
                   fullWidth
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
                disabled={items.length <= 2}
                onClick={(_) => {
                  items.length > 2 &&
                  onChange({
                    options: {
                      ...options,
                      items: items.toSpliced(index, 1),
                      defaultOptionId: item.id === defaultOptionId ? undefined : defaultOptionId,
                    },
                  });
                }}>
          <Close sx={{ fontSize: 20, color: "#a54160" }} />
        </Button>
        {
          controllingOptionsFieldId &&
          <>
            <Button className={styles.button}
                    disabled={selectedControlledItemIndex === index}
                    onClick={(_) => {
                      setSelectedControlledItemIndex(index);
                    }}>
              {
                selectedControlledItemIndex === index ?
                  <DatasetLinked sx={{ fontSize: 20, color: "#4178a5" }} /> :
                  <DatasetLinkedOutlined sx={{ fontSize: 20, color: "#4178a5" }} />
              }
            </Button>

            <PlayArrow style={{ color: selectedControlledItemIndex === index ? "#d7dfe3" : "transparent" }}
                       className={styles.controllingOptionsItemsArrow} />
          </>
        }
      </div>,
    ), [items]);

  return (
    <>
      <div className={styles.controllingFieldContainer}>
        <FormControl className={styles.controllingFieldFormControl}
                     disabled={!otherManualOptionsFieldsIds.length}
                     error={!!validationErrors?.properties?.controllingOptionsFieldId}>
          <InputLabel id="controlling-options-label">שדה אפשרויות כובל</InputLabel>
          <Select labelId="controlling-options-label"
                  variant={"standard"}
                  fullWidth
                  aria-describedby={"controlling-options-helper-text"}
                  value={controllingOptionsFieldId ?? ""}
                  label={"שדה אפשרויות כובל"}
                  onChange={(e) => {
                    onChange({ options: { ...options, controllingOptionsFieldId: e.target.value } });
                  }}>
            {
              otherManualOptionsFieldsIds.map((manualOptionsFieldId) => (
                <MenuItem key={manualOptionsFieldId} value={manualOptionsFieldId}>
                  {formStructure.fields[manualOptionsFieldId].data.displayName}
                </MenuItem>
              ))
            }
          </Select>
          <FormHelperText id="controlling-options-helper-text">
            {validationErrors?.properties?.controllingOptionsFieldId?.errors[0]}
          </FormHelperText>
        </FormControl>
        {
          controllingOptionsFieldId &&
          <Button className={styles.button}
                  onClick={(_) => {
                    onChange({ options: { ...options, controllingOptionsFieldId: undefined } });
                  }}>
            <Close sx={{ fontSize: 20, color: "#a54160" }} />
          </Button>
        }
      </div>
      <div className={styles.itemsContainer}>
        <div className={styles.itemsWrapper}>
          {itemFields}
          <div className={styles.appendItemButtonWrapper}>
            <Button size={"large"}
                    className={styles.appendItemButton}
                    onClick={(_) => {
                      onChange({ options: { ...options, items: [...items, generateEmptyItem()] } });
                    }}>
              + הוסף אפשרות
            </Button>
          </div>
        </div>
        {
          controllingOptionsFieldId &&
          <div className={styles.controllingOptionsItemsContainer}>
            <FormControlLabel label="הכל"
                              control={
                                <Checkbox
                                  checked={items[selectedControlledItemIndex].controllingItemsIds?.every(Boolean) ?? false}
                                  onChange={(e) => {
                                    onChange({ multiple: e.target.checked });
                                  }} />
                              } />
            {
              ((formStructure.fields[controllingOptionsFieldId].data.extra as FormFieldExtra<OptionsFieldTypeId> & {
                options: ManualOptions
              })?.options?.items as ManualItems)?.map((controllingItem) => {
                if (controllingItem.text) {
                  const checked = items[selectedControlledItemIndex].controllingItemsIds?.includes(controllingItem.id) ?? false;

                  return (
                    <FormControlLabel label={controllingItem.text}
                                      control={
                                        <Checkbox checked={checked}
                                                  onChange={(e) => {
                                                    const controllingItemsIds = [...items[selectedControlledItemIndex].controllingItemsIds ?? []];

                                                    if (e.target.checked) {
                                                      controllingItemsIds.push(controllingItem.id);
                                                    } else {
                                                      controllingItemsIds.splice(controllingItemsIds.indexOf(controllingItem.id), 1);
                                                    }

                                                    const updatedItems = [...items];
                                                    updatedItems[selectedControlledItemIndex] = {
                                                      ...updatedItems[selectedControlledItemIndex],
                                                      controllingItemsIds,
                                                    };

                                                    onChange({
                                                      options: {
                                                        ...options,
                                                        items: updatedItems,
                                                      },
                                                    });
                                                  }} />
                                      } />
                  );
                }
              })
            }
          </div>
        }
      </div>

      <div className={styles.defaultFieldContainer}>
        <FormControl disabled={!definedItems.length}
                     className={styles.defaultFieldWrapper}
                     error={!!validationErrors?.properties?.defaultOptionId}>
          <InputLabel id="default-option-label">ברירת מחדל</InputLabel>
          <Select labelId="default-option-label"
                  variant={"standard"}
                  aria-describedby={"default-option-helper-text"}
                  value={defaultOptionId ?? ""}
                  label={"ברירת מחדל"}
                  onChange={(e) => {
                    onChange({ options: { ...options, defaultOptionId: e.target.value } });
                  }}>
            {
              definedItems.map((item) => (
                <MenuItem key={item.id} value={item.id}>{item.text}</MenuItem>
              ))
            }
          </Select>
          <FormHelperText id="default-option-helper-text">
            {validationErrors?.properties?.defaultOptionId?.errors[0]}
          </FormHelperText>
        </FormControl>
        {
          defaultOptionId &&
          <Button className={styles.button}
                  onClick={(_) => {
                    onChange({ options: { ...options, defaultOptionId: undefined } });
                  }}>
            <Close sx={{ fontSize: 20, color: "#a54160" }} />
          </Button>
        }
      </div>
    </>
  );
}

export { ManualOptions };