import { OptionsSource } from "../../../../../../../schemas/fields/optionsSchema";
import { Button, FormControl, FormHelperText, InputLabel, MenuItem, Select, Tooltip, Autocomplete, TextField } from "@mui/material";
import { ExtraElementProps } from "../../../index";
import { OptionsFieldTypeId, SpecificOptions, SpecificOptionsErrors } from "../index";
import { Close } from "@mui/icons-material";
import { generateOptionItemId } from "../../../../../../../utils";
import { useEffect, useMemo, useState, useCallback } from "react";
import { ArrayElement } from "../../../../../../../../../types/utils";
import { FieldTypeIds } from "../../../../../../../../../utils/interfaces";
import { useFormStructureContext } from "../../../../../../../context/FormStructureContext";
import { FormFieldExtra } from "../../../../../../../schemas/fields";
import styles from "./style.module.css";
import { ManualOptionsItemField } from "./ManualOptionsItemField";
import { ManualOptionsControllingItemsList } from "./ManualOptionsControllingItemsList";

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
    onChange({ source: OptionsSource.MANUAL as const, options: { ...options, items } });
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

  const controllingFieldItems = useMemo(() => {
    if (!controllingOptionsFieldId) return null;

    return (
      ((formStructure.fields[controllingOptionsFieldId].data.extra as FormFieldExtra<OptionsFieldTypeId> & {
        options: ManualOptions
      })?.options?.items as ManualItems)?.filter((item) => !!item.text?.length)
    );
  }, [controllingOptionsFieldId, formStructure.fields[controllingOptionsFieldId ?? ""]?.data?.extra]);

  useEffect(() => {
    if (controllingOptionsFieldId && !controllingFieldItems?.length && items[selectedControlledItemIndex]) {
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
  }, [controllingFieldItems, controllingOptionsFieldId]);

  const handleItemChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number, item: ArrayElement<ManualItems>) => {
    const newText = e.target.value.trimStart();
    const newlyFilled = !item.text && newText;
    const updatedItem = { ...item, text: newText };

    if (newlyFilled && controllingFieldItems?.length) {
      updatedItem.controllingItemsIds = controllingFieldItems.map((controllingItem) => controllingItem.id);
    }

    onChange({
      options: {
        ...options,
        items: items.toSpliced(index, 1, updatedItem),
      },
    });
  }, [items, options, controllingFieldItems, onChange]);

  const itemFields = useMemo(() => (
    items.map((item, index) => (
      <ManualOptionsItemField index={index}
        item={item}
        validationErrors={validationErrors?.properties?.items?.items?.[index]?.properties?.text}
        isDeletable={items.length > 2}
        onChange={(e) => handleItemChange(e, index, item)}
        onFocus={() => {
          setSelectedControlledItemIndex(index);
        }}
        onDelete={() => {
          items.length > 2 &&
            onChange({
              options: {
                ...options,
                items: items.toSpliced(index, 1),
                defaultOptionId: item.id === defaultOptionId ? undefined : defaultOptionId,
              },
            });
        }}
        isSelectedControlledItem={
          !!controllingOptionsFieldId ?
            selectedControlledItemIndex === index :
            undefined
        }
        onSelectControlledItem={() => {
          setSelectedControlledItemIndex(index);
        }} />
    ))
  ), [items, validationErrors?.properties?.items?.items, onChange, options, selectedControlledItemIndex]);

  return (
    <>
      <div className={styles.controllingFieldContainer}>
        <div className={styles.controllingFieldWrapper}
          style={{ borderColor: controllingOptionsFieldId ? "#e1e7ec" : "transparent" }}>
          <FormControl className={styles.controllingFieldFormControl}
            disabled={!otherManualOptionsFieldsIds.length}
            error={!!validationErrors?.properties?.controllingOptionsFieldId}>
            <InputLabel id="controlling-options-label">
              <Tooltip title={"שדה אפשרויות מוביל"}>
                <span>שדה אפשרויות מוביל</span>
              </Tooltip>
            </InputLabel>
            <Select labelId="controlling-options-label"
              variant={"standard"}
              fullWidth
              title={"שדה אפשרויות מוביל"}
              aria-describedby={"controlling-options-helper-text"}
              value={controllingOptionsFieldId ?? ""}
              label={"שדה אפשרויות מוביל"}
              onChange={(e) => {
                const newItems = [...items];
                const newControllingOptionsFieldId = e.target.value;
                const newControllingFieldItems = ((formStructure.fields[newControllingOptionsFieldId].data.extra as FormFieldExtra<OptionsFieldTypeId> & {
                  options: ManualOptions
                })?.options?.items as ManualItems)?.filter((item) => !!item.text?.length);

                newItems.forEach((item) => {
                  if (item.text?.length) {
                    item.controllingItemsIds = newControllingFieldItems?.map(i => i.id) || [];
                  } else {
                    delete item.controllingItemsIds;
                  }
                });

                onChange({
                  options: {
                    ...options,
                    controllingOptionsFieldId: newControllingOptionsFieldId,
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
                const newItems = [...items];
                newItems.forEach((item) => {
                  delete item.controllingItemsIds;
                });
                onChange({ options: { ...options, controllingOptionsFieldId: undefined, items: newItems } });
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
        {
          !!controllingFieldItems && !!items[selectedControlledItemIndex] &&
          <ManualOptionsControllingItemsList item={items[selectedControlledItemIndex]}
            controllingFieldItems={controllingFieldItems}
            onCheckChange={(e, controllingItem: ArrayElement<ManualItems>) => {
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
            }}
            onCheckAllChange={(e) => {
              const updatedItems = items.toSpliced(selectedControlledItemIndex, 1, {
                ...items[selectedControlledItemIndex],
                controllingItemsIds: e.target.checked ?
                  controllingFieldItems?.map((fieldItems) => fieldItems.id) :
                  [],
              });

              onChange({
                options: {
                  ...options,
                  items: updatedItems,
                },
              });
            }} />
        }
      </div>

      <div className={styles.defaultFieldContainer}>
        <Tooltip title={!definedItems.length ? "יש להזין אפשרויות" : ""} placement="top">
          <div className={styles.defaultFieldWrapper} style={{ display: 'flex' }}>
            <span style={{ width: '100%', display: 'flex' }}>
              <FormControl disabled={!definedItems.length}
                style={{ width: '100%' }}
                error={!!validationErrors?.properties?.defaultOptionId}>
                <Autocomplete
                  disabled={!definedItems.length}
                  options={definedItems.map((item) => item.id)}
                  getOptionLabel={(optionId) => definedItems.find((item) => item.id === optionId)?.text || ""}
                  value={defaultOptionId || null}
                  noOptionsText={"לא נמצאו אפשרויות"}
                  onChange={(_, newValue) => {
                    onChange({ options: { ...options, defaultOptionId: newValue || undefined } });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      disabled={!definedItems.length}
                      label="ברירת מחדל"
                      variant="standard"
                      error={!!validationErrors?.properties?.defaultOptionId}
                      helperText={validationErrors?.properties?.defaultOptionId?.errors?.[0]}
                    />
                  )}
                />
              </FormControl>
            </span>
          </div>
        </Tooltip>
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
export type { ManualItems };
