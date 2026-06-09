import { Button, FormControl, Tooltip, Autocomplete, TextField } from "@mui/material";
import { OptionsFieldTypeId } from "../index";
import { Close } from "@mui/icons-material";
import { generateOptionItemId } from "../../../../../../../utils";
import { useEffect, useMemo, useState, useCallback } from "react";
import { ArrayElement } from "../../../../../../../../../types/utils";
import { FieldTypeIds } from "../../../../../../../../../utils/interfaces";
import { useFormStructureContext } from "../../../../../../../context/FormStructureContext";
import { FormFieldExtra, SpecificFormFieldData } from "../../../../../../../schemas/fields";
import styles from "./style.module.css";
import { ManualOptionsItemField } from "./ManualOptionsItemField";
import { ManualOptionsControllingItemsList } from "./ManualOptionsControllingItemsList";

import { selectionMode } from "formula-gear";

interface Props {
  fieldId: string;
  defaultValue: string[];
  selectionMode: "single" | "multiple";
  onChange: (extra: Partial<FormFieldExtra<OptionsFieldTypeId>>) => void;
  onDataChange?: (data: Partial<SpecificFormFieldData<OptionsFieldTypeId>>) => void;
  validationErrors: any;
}

type ManualItems = NonNullable<SpecificFormFieldData<OptionsFieldTypeId>["options"]>;

function generateEmptyItem(): ArrayElement<ManualItems> {
  return {
    id: generateOptionItemId(),
    text: "",
  };
}

function ManualOptions(props: Props) {
  const {
    defaultValue,
    selectionMode: mode,
    onChange,
    onDataChange,
    fieldId: id,
    validationErrors,
  } = props;

  const { formStructure } = useFormStructureContext();
  
  const currentField = formStructure.fields[id];
  const items = (currentField?.data?.options as ManualItems) ?? [generateEmptyItem(), generateEmptyItem()];

  const [selectedControlledItemIndex, setSelectedControlledItemIndex] = useState<number>(0);

  const extra = (currentField?.data?.extra as FormFieldExtra<OptionsFieldTypeId>) ?? {};

  const otherManualOptionsFieldsIds = useMemo(() => Object.keys(formStructure.fields)?.filter((fieldId) => {
    const fieldData = formStructure.fields[fieldId].data;
    const fieldExtra = fieldData.extra as FormFieldExtra<OptionsFieldTypeId> | undefined;

    return (
      fieldId !== id &&
      fieldData.typeId === FieldTypeIds.options &&
      fieldExtra?.linkedOptionsFieldId === undefined &&
      fieldData.displayName
    );
  }), [formStructure.fields, id]);

  const definedItems = useMemo(() => items?.filter((item) => !!item.text), [items]);

  useEffect(() => {
    if (!currentField?.data?.options) {
      onDataChange?.({ options: items });
    }
  }, []);

  useEffect(() => {
    // Selection mode check for default value
    if (mode === selectionMode.Single && defaultValue.length > 1) {
      onChange({ defaultValue: [defaultValue[0]] });
    }
  }, [mode]);

  const controllingFieldItems = useMemo(() => {
    const linkedOptionsFieldId = extra.linkedOptionsFieldId;
    if (!linkedOptionsFieldId) return undefined;

    const linkedField = formStructure.fields[linkedOptionsFieldId];
    return (linkedField?.data?.options as ManualItems)?.filter((item) => !!item.text?.length);
  }, [extra.linkedOptionsFieldId, formStructure.fields]);

  const handleItemChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number, item: ArrayElement<ManualItems>) => {
    const newText = e.target.value.trimStart();
    const updatedItem = { ...item, text: newText };
    const newItems = items.toSpliced(index, 1, updatedItem);

    onDataChange?.({
      options: newItems,
    });
  }, [items, onDataChange]);

  const itemFields = useMemo(() => (
    items.map((item, index) => (
      <ManualOptionsItemField index={index}
        item={item}
        validationErrors={validationErrors?.properties?.options?.items?.[index]?.properties?.text}
        isDeletable={items.length > 2}
        onChange={(e) => handleItemChange(e, index, item)}
        onFocus={() => {
          setSelectedControlledItemIndex(index);
        }}
        onDelete={() => {
          if (items.length > 2) {
            const newItems = items.toSpliced(index, 1);
            onDataChange?.({
              options: newItems,
            });

            if (defaultValue.includes(item.id)) {
              onChange({ defaultValue: defaultValue.filter(id => id !== item.id) });
            }
          }
        }}
        isSelectedControlledItem={
          !!extra.linkedOptionsFieldId ?
            selectedControlledItemIndex === index :
            undefined
        }
        onSelectControlledItem={() => {
          setSelectedControlledItemIndex(index);
        }} />
    ))
  ), [items, validationErrors, handleItemChange, onDataChange, onChange, defaultValue, extra.linkedOptionsFieldId, selectedControlledItemIndex]);

  return (
    <>
      <div className={styles.controllingFieldContainer}>
        <div className={styles.controllingFieldWrapper}
          style={{ borderColor: extra.linkedOptionsFieldId ? "#e1e7ec" : "transparent" }}>
          <Tooltip title={!otherManualOptionsFieldsIds.length ? "לא קיים שדה אפשרויות נוסף" : ""} placement="top">
            <span style={{ flex: 1, display: 'flex' }}>
              <FormControl className={styles.controllingFieldFormControl}
                disabled={!otherManualOptionsFieldsIds.length}>
                <Autocomplete
                  disabled={!otherManualOptionsFieldsIds.length}
                  options={otherManualOptionsFieldsIds}
                  getOptionLabel={(option) => formStructure.fields[option]?.data?.displayName || ""}
                  value={extra.linkedOptionsFieldId || null}
                  noOptionsText={"לא נמצאו שדות מתאימים"}
                  onChange={(_, newValue) => {
                    onChange({ linkedOptionsFieldId: newValue || undefined });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      disabled={!otherManualOptionsFieldsIds.length}
                      label={
                        <Tooltip title={"שדה אפשרויות מוביל"}>
                          <span>שדה אפשרויות מוביל</span>
                        </Tooltip>
                      }
                      variant="standard"
                    />
                  )}
                />
              </FormControl>
            </span>
          </Tooltip>
          {
            extra.linkedOptionsFieldId &&
            <Button className={styles.button}
              onClick={(_) => {
                onChange({ linkedOptionsFieldId: undefined });
              }}>
              <Close sx={{ fontSize: 20, color: "#a54160" }} />
            </Button>
          }
        </div>
        {
          extra.linkedOptionsFieldId &&
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
                const newItems = [...items, generateEmptyItem()];
                onDataChange?.({ options: newItems });
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
              const controllingItemsIds = [...(items[selectedControlledItemIndex].controllingItemsIds ?? [])];

              if (e.target.checked) {
                controllingItemsIds.push(controllingItem.id);
              } else {
                const indexToRemove = controllingItemsIds.indexOf(controllingItem.id);
                if (indexToRemove !== -1) {
                  controllingItemsIds.splice(indexToRemove, 1);
                }
              }

              const updatedItems = [...items];
              updatedItems[selectedControlledItemIndex] = {
                ...updatedItems[selectedControlledItemIndex],
                controllingItemsIds,
              };

              onDataChange?.({ options: updatedItems });
            }}
            onCheckAllChange={(e) => {
              const updatedItems = items.toSpliced(selectedControlledItemIndex, 1, {
                ...items[selectedControlledItemIndex],
                controllingItemsIds: e.target.checked
                  ? controllingFieldItems?.map((fieldItems) => fieldItems.id)
                  : [],
              });

              onDataChange?.({ options: updatedItems });
            }} />
        }
      </div>

      <div className={styles.defaultFieldContainer}>
        <Tooltip title={!definedItems.length ? "יש להזין אפשרויות" : ""} placement="top">
          <div className={styles.defaultFieldWrapper} style={{ display: 'flex' }}>
            <span style={{ width: '100%', display: 'flex' }}>
              <FormControl disabled={!definedItems.length}
                style={{ width: '100%' }}>
                <Autocomplete
                  disabled={!definedItems.length}
                  multiple={mode === selectionMode.Multiple}
                  options={definedItems.map((item) => item.id)}
                  getOptionLabel={(optionId) => definedItems.find((item) => item.id === optionId)?.text || ""}
                  value={mode === selectionMode.Multiple ? (defaultValue || []) : (defaultValue?.[0] || null)}
                  noOptionsText={"לא נמצאו אפשרויות"}
                  onChange={(_, newValue) => {
                    if (mode === selectionMode.Multiple) {
                      onChange({ defaultValue: newValue as string[] || [] });
                    } else {
                      onChange({ defaultValue: newValue ? [newValue as string] : [] });
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      disabled={!definedItems.length}
                      label="ברירת מחדל"
                      variant="standard"
                    />
                  )}
                />
              </FormControl>
            </span>
          </div>
        </Tooltip>
        {
          defaultValue && defaultValue.length > 0 &&
          <Button className={styles.button}
            onClick={(_) => {
              onChange({ defaultValue: [] });
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
