import { OptionsSource } from "../../../../../../../schemas/fields/optionsSchema";
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
  Typography,
} from "@mui/material";
import { ExtraElementProps } from "../../../index";
import { OptionsFieldTypeId, SpecificOptions, SpecificOptionsErrors } from "../index";
import { Close, DatasetLinked, DatasetLinkedOutlined, PlayArrow } from "@mui/icons-material";
import { generateOptionItemId } from "../../../../../../../utils";
import { useEffect, useMemo, useState } from "react";
import { ArrayElement } from "../../../../../../../../../types/utils";
import { FieldTypeIds } from "../../../../../../../../../utils/interfaces";
import { useFormStructureContext } from "../../../../../../../context/FormStructureContext";
import { FormFieldExtra } from "../../../../../../../schemas/fields";
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

  const otherManualOptionsFieldsIds = useMemo(() => Object.keys(formStructure.fields)?.filter((fieldId) => {
    const fieldData = formStructure.fields[fieldId].data;

    return (
      fieldId !== id &&
      fieldData.typeId === FieldTypeIds.options &&
      fieldData.extra?.source === OptionsSource.MANUAL &&
      fieldData.displayName
    );
  }), [formStructure.fields, id]);

  const definedItems = useMemo(() => items?.filter((item) => !!item.text), [items]);

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

  const itemFields = useMemo(() => (
    items.map((item, index) => {
      const isDefined = !!item.text?.length;

      //TODO Export to a child component
      return (
        <div key={item.id} className={styles.itemContainer}>
          <TextField variant={"standard"}
                     className={styles.itemTextField}
                     fullWidth
                     value={item.text}
                     placeholder={`הזנת אפשרות ${index + 1}`}
                     error={!!validationErrors?.properties?.items?.items?.[index]?.properties?.text}
                     helperText={validationErrors?.properties?.items?.items?.[index]?.properties?.text?.errors[0]}
                     onFocus={(_) => {
                       setSelectedControlledItemIndex(index);
                     }}
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
                    <DatasetLinked color={isDefined ? "primary" : "action"} sx={{ fontSize: 20 }} /> :
                    <DatasetLinkedOutlined color={isDefined ? "primary" : "action"} sx={{ fontSize: 20 }} />
                }
              </Button>

              <PlayArrow style={{ color: selectedControlledItemIndex === index ? "#e1e7ec" : "transparent" }}
                         className={styles.controllingItemsArrow} />
            </>
          }
        </div>
      );
    })
  ), [items, validationErrors?.properties?.items?.items, onChange, options, selectedControlledItemIndex]);

  const controllingFieldItems = useMemo(() => {
    if (!controllingOptionsFieldId) return null;

    return (
      ((formStructure.fields[controllingOptionsFieldId].data.extra as FormFieldExtra<OptionsFieldTypeId> & {
        options: ManualOptions
      })?.options?.items as ManualItems)?.filter((item) => !!item.text?.length)
    );
  }, [controllingOptionsFieldId, formStructure.fields[controllingOptionsFieldId ?? ""]?.data?.extra]);

  useEffect(() => {
    if (!controllingFieldItems?.length) {
      const updatedItems = items.toSpliced(selectedControlledItemIndex, 1, {
        ...items[selectedControlledItemIndex],
        controllingItemsIds: [],
      });

      onChange({
        options: {
          ...options,
          items: updatedItems,
        },
      });
    }
  }, [controllingFieldItems]);

  const controllingItemsList = useMemo(() => {
    if (!controllingFieldItems) return null;

    const disabled = !items[selectedControlledItemIndex].text?.length || !controllingFieldItems?.length;

    //TODO Export to a child component
    return (
      <div className={styles.controllingItemsContainer}>
        {
          controllingFieldItems.length ? (
              <>
                <FormControlLabel label="הכל"
                                  disabled={disabled}
                                  control={
                                    <Checkbox
                                      checked={items[selectedControlledItemIndex].controllingItemsIds?.length === controllingFieldItems?.length}
                                      indeterminate={
                                        !!items[selectedControlledItemIndex].controllingItemsIds?.length &&
                                        items[selectedControlledItemIndex].controllingItemsIds?.length < controllingFieldItems.length
                                      }
                                      onChange={(e) => {
                                        const updatedItems = items.toSpliced(selectedControlledItemIndex, 1, {
                                          ...items[selectedControlledItemIndex],
                                          controllingItemsIds: e.target.checked ?
                                            controllingFieldItems.map((fieldItems) => fieldItems.id) :
                                            [],
                                        });

                                        onChange({
                                          options: {
                                            ...options,
                                            items: updatedItems,
                                          },
                                        });
                                      }} />
                                  } />
                <div className={styles.controllingItemsWrapper}>
                  {
                    controllingFieldItems.map((controllingItem) => {
                      const checked = items[selectedControlledItemIndex].controllingItemsIds?.includes(controllingItem.id) ?? false;

                      return (
                        <div key={controllingItem.id} className={styles.controllingItem}>
                          <div className={styles.controllingItemBranch} />
                          <FormControlLabel label={controllingItem.text}
                                            disabled={disabled}
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
                        </div>
                      );
                    })

                  }
                </div>
              </>
            ) :
            (
              <Typography color={"textDisabled"} className={styles.noControllingItemsText}>
                אין אפשרויות מוגדרות בשדה המוביל
              </Typography>
            )
        }
      </div>
    );
  }, [
    selectedControlledItemIndex,
    onChange,
    items[selectedControlledItemIndex].controllingItemsIds,
  ]);

  return (
    <>
      <div className={styles.controllingFieldContainer}>
        <div className={styles.controllingFieldWrapper}
             style={{ borderColor: controllingOptionsFieldId ? "#e1e7ec" : "transparent" }}>
          <FormControl className={styles.controllingFieldFormControl}
                       disabled={!otherManualOptionsFieldsIds.length}
                       error={!!validationErrors?.properties?.controllingOptionsFieldId}>
            <InputLabel id="controlling-options-label">שדה אפשרויות מוביל</InputLabel>
            <Select labelId="controlling-options-label"
                    variant={"standard"}
                    fullWidth
                    aria-describedby={"controlling-options-helper-text"}
                    value={controllingOptionsFieldId ?? ""}
                    label={"שדה אפשרויות מוביל"}
                    onChange={(e) => {
                      const newItems = [...items];

                      newItems.forEach((item) => {
                        delete item.controllingItemsIds;
                      });

                      onChange({
                        options: {
                          ...options,
                          controllingOptionsFieldId: e.target.value,
                          items: newItems,
                        },
                      });
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
        {
          controllingOptionsFieldId &&
          <div className={styles.controllingFieldConnector} />
        }
      </div>
      <div className={styles.itemsContainer}>
        <div>
          <div className={styles.itemsWrapper}>
            {itemFields}
          </div>
          <div className={styles.appendItemButtonWrapper}>
            <Button size={"large"}
                    variant={"outlined"}
                    className={styles.appendItemButton}
                    onClick={(_) => {
                      onChange({ options: { ...options, items: [...items, generateEmptyItem()] } });
                    }}>
              + הוסף אפשרות
            </Button>
          </div>
        </div>
        {controllingItemsList}
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