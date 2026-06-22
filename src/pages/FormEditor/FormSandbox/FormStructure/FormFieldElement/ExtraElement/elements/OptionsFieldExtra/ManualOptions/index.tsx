import {
  Button,
  FormControl,
  Tooltip,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
} from "@mui/material";
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

const DUPLICATE_OPTION_TEXT_ERROR = "שם האפשרות חייב להיות ייחודי בשדה";

const normalizeOptionText = (text?: string): string => text?.trim().toLocaleLowerCase("he") ?? "";

const getDuplicateOptionIndexes = (items: ManualItems): Set<number> => {
  const indexesByText = new Map<string, number[]>();

  items.forEach((item, index) => {
    const normalizedText = normalizeOptionText(item.text);

    if (!normalizedText) return;

    const indexes = indexesByText.get(normalizedText) ?? [];

    indexes.push(index);
    indexesByText.set(normalizedText, indexes);
  });

  const duplicateIndexes = new Set<number>();

  indexesByText.forEach((indexes) => {
    if (indexes.length > 1) {
      indexes.forEach((index) => duplicateIndexes.add(index));
    }
  });

  return duplicateIndexes;
};

const addValidationError = (validationErrors: any, message: string) => {
  const currentErrors = validationErrors?.errors ?? [];

  if (currentErrors.includes(message)) {
    return validationErrors;
  }

  return {
    ...(validationErrors ?? {}),
    errors: [...currentErrors, message],
  };
};

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

  const rawItems = (currentField?.data?.options as ManualItems) ?? [
    generateEmptyItem(),
    generateEmptyItem(),
  ];

  const items = useMemo(() => {
    return rawItems.filter((item) => item.isActive !== false);
  }, [rawItems]);

  const inactiveItems = useMemo(() => {
    return rawItems.filter((item) => item.isActive === false);
  }, [rawItems]);

  const updateOptionsData = useCallback(
    (activeItems: ManualItems) => {
      onDataChange?.({
        options: [...activeItems, ...inactiveItems],
      });
    },
    [inactiveItems, onDataChange],
  );

  const [selectedControlledItemIndex, setSelectedControlledItemIndex] = useState<number>(0);
  const [originalItemTexts, setOriginalItemTexts] = useState<Record<string, string>>({});
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameData, setRenameRenameData] = useState<{
    index: number;
    item: ArrayElement<ManualItems>;
    newText: string;
    originalText: string;
  } | null>(null);

  const otherManualOptionsFieldsIds = useMemo(
    () =>
      Object.keys(formStructure.fields)?.filter((fieldId) => {
        const fieldData = formStructure.fields[fieldId].data;
        const fieldExtra = fieldData.extra as FormFieldExtra<OptionsFieldTypeId> | undefined;

        return (
          fieldId !== id &&
          fieldData.typeId === FieldTypeIds.options &&
          fieldExtra?.linkedOptionsFieldId === undefined &&
          fieldData.displayName
        );
      }),
    [formStructure.fields, id],
  );

  const inferredControlledFieldId = useMemo(() => {
    const controllingItemsIds = new Set(items.flatMap((item) => item.controllingItemsIds ?? []));

    if (!controllingItemsIds.size) {
      return undefined;
    }

    return otherManualOptionsFieldsIds.find((candidateFieldId) => {
      const candidateItems = formStructure.fields[candidateFieldId]?.data?.options as
        | ManualItems
        | undefined;

      return candidateItems?.some((candidateItem) => controllingItemsIds.has(candidateItem.id));
    });
  }, [items, otherManualOptionsFieldsIds, formStructure.fields]);

  const [draftControlledFieldId, setDraftControlledFieldId] = useState<string | null>();

  const controlledFieldId =
    draftControlledFieldId === undefined ? inferredControlledFieldId : draftControlledFieldId;

  const definedItems = useMemo(() => items?.filter((item) => !!item.text), [items]);

  const duplicateOptionIndexes = useMemo(() => getDuplicateOptionIndexes(items), [items]);

  useEffect(() => {
    if (!currentField?.data?.options?.length) {
      updateOptionsData([generateEmptyItem(), generateEmptyItem()]);
    }
  }, []);

  useEffect(() => {
    if (mode === selectionMode.Single && defaultValue.length > 1) {
      onChange({ defaultValue: [defaultValue[0]] });
    }
  }, [mode]);

  const controllingFieldItems = useMemo(() => {
    if (!controlledFieldId) return undefined;

    const linkedField = formStructure.fields[controlledFieldId];
    const parentRawItems = (linkedField?.data?.options as ManualItems) ?? [];
    const parentInactiveOptionIds = (linkedField?.data?.extra as any)?.inactiveOptionIds ?? [];

    return parentRawItems
      .filter((item) => !parentInactiveOptionIds.includes(item.id))
      .filter((item) => !!item.text?.length);
  }, [controlledFieldId, formStructure.fields]);

  const handleItemChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      index: number,
      item: ArrayElement<ManualItems>,
    ) => {
      const newText = e.target.value.trimStart();
      const updatedItem = { ...item, text: newText };
      const newActiveItems = items.toSpliced(index, 1, updatedItem);

      updateOptionsData(newActiveItems);
    },
    [items, updateOptionsData],
  );

  const handleItemBlur = useCallback(
    (index: number, item: ArrayElement<ManualItems>) => {
      const originalText = originalItemTexts[item.id];
      const currentText = item.text;

      const isExistingForm = Boolean(formStructure?.metadata?.id);

      if (isExistingForm && originalText && currentText && originalText !== currentText) {
        setRenameRenameData({
          index,
          item,
          newText: currentText,
          originalText,
        });
        setRenameDialogOpen(true);
      }
    },
    [originalItemTexts, formStructure?.metadata?.id],
  );

  const handleConfirmRename = (retroactive: boolean) => {
    if (!renameData) return;

    const { index, item, newText, originalText } = renameData;

    if (retroactive) {
      setRenameDialogOpen(false);
    } else {
      const newOptionId = generateOptionItemId();
      const newOption = { id: newOptionId, text: newText, isActive: true };

      const archivedOption = { id: item.id, text: originalText, isActive: false };
      const updatedActiveItems = items.toSpliced(index, 1, newOption);

      onDataChange?.({
        options: [...updatedActiveItems, ...inactiveItems, archivedOption],
      });

      if (defaultValue.includes(item.id)) {
        onChange({
          defaultValue: defaultValue.map((dVal) => (dVal === item.id ? newOptionId : dVal)),
        });
      }

      setRenameDialogOpen(false);
    }
  };

  const handleCancelRename = () => {
    if (!renameData) return;

    const { index, item, originalText } = renameData;
    const revertedItem = { ...item, text: originalText };
    const revertedItems = items.toSpliced(index, 1, revertedItem);

    updateOptionsData(revertedItems);
    setRenameDialogOpen(false);
  };

  const clearControlledField = () => {
    setDraftControlledFieldId(null);
    setSelectedControlledItemIndex(0);

    onDataChange?.({
      options: items.map((item) => ({
        ...item,
        controllingItemsIds: [],
      })),
    });
  };

  const itemFields = useMemo(
    () =>
      items.map((item, index) => {
        const textValidationErrors =
          validationErrors?.properties?.options?.items?.[index]?.properties?.text;

        const itemValidationErrors = duplicateOptionIndexes.has(index)
          ? addValidationError(textValidationErrors, DUPLICATE_OPTION_TEXT_ERROR)
          : textValidationErrors;

        return (
          <ManualOptionsItemField
            index={index}
            item={item}
            validationErrors={itemValidationErrors}
            isDeletable={items.length > 2}
            onChange={(e) => handleItemChange(e, index, item)}
            onFocus={() => {
              setSelectedControlledItemIndex(index);

              if (!originalItemTexts[item.id]) {
                setOriginalItemTexts((prev) => ({ ...prev, [item.id]: item.text ?? "" }));
              }
            }}
            onBlur={() => handleItemBlur(index, item)}
            onDelete={() => {
              if (items.length > 2) {
                const newActiveItems = items.toSpliced(index, 1);

                updateOptionsData(newActiveItems);

                if (defaultValue.includes(item.id)) {
                  onChange({ defaultValue: defaultValue.filter((id) => id !== item.id) });
                }
              }
            }}
            isSelectedControlledItem={
              !!controlledFieldId ? selectedControlledItemIndex === index : undefined
            }
            onSelectControlledItem={() => {
              setSelectedControlledItemIndex(index);
            }}
          />
        );
      }),
    [
      items,
      validationErrors,
      duplicateOptionIndexes,
      handleItemChange,
      updateOptionsData,
      onChange,
      defaultValue,
      controlledFieldId,
      selectedControlledItemIndex,
      originalItemTexts,
      handleItemBlur,
    ],
  );

  return (
    <>
      <div className={styles.controllingFieldContainer}>
        <div
          className={styles.controllingFieldWrapper}
          style={{ borderColor: controlledFieldId ? "#e1e7ec" : "transparent" }}>
          <Tooltip
            title={!otherManualOptionsFieldsIds.length ? "לא קיים שדה אפשרויות נוסף" : ""}
            placement="top">
            <span style={{ flex: 1, display: "flex" }}>
              <FormControl
                className={styles.controllingFieldFormControl}
                disabled={!otherManualOptionsFieldsIds.length}>
                <Autocomplete
                  disabled={!otherManualOptionsFieldsIds.length}
                  options={otherManualOptionsFieldsIds}
                  getOptionLabel={(option) => formStructure.fields[option]?.data?.displayName || ""}
                  noOptionsText={"לא נמצאו שדות מתאימים"}
                  value={controlledFieldId || null}
                  onChange={(_, newValue) => {
                    setDraftControlledFieldId(newValue ?? null);
                    setSelectedControlledItemIndex(0);

                    const controllingItems =
                      (newValue
                        ? (
                          formStructure.fields[newValue]?.data?.options as ManualItems | undefined
                        )?.filter((item) => item.isActive !== false)
                        : []) ?? [];

                    onDataChange?.({
                      options: items.map((item) => ({
                        ...item,
                        controllingItemsIds: controllingItems.map(
                          (controllingItem) => controllingItem.id,
                        ),
                      })),
                    });
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

          {controlledFieldId && (
            <Button className={styles.button} onClick={clearControlledField}>
              <Close sx={{ fontSize: 20, color: "#a54160" }} />
            </Button>
          )}
        </div>

        {controlledFieldId && <div className={styles.controllingFieldConnector} />}
      </div>

      <div className={styles.itemsContainer}>
        <div>
          <div className={styles.itemsWrapper}>{itemFields}</div>

          <div className={styles.appendItemButtonWrapper}>
            <Button
              size={"large"}
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

        {!!controllingFieldItems && !!items[selectedControlledItemIndex] && (
          <ManualOptionsControllingItemsList
            item={items[selectedControlledItemIndex]}
            controllingFieldItems={controllingFieldItems}
            onCheckChange={(e, controllingItem: ArrayElement<ManualItems>) => {
              const controllingItemsIds = [
                ...(items[selectedControlledItemIndex].controllingItemsIds ?? []),
              ];

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
            }}
          />
        )}
      </div>

      <div className={styles.defaultFieldContainer}>
        <Tooltip title={!definedItems.length ? "יש להזין אפשרויות" : ""} placement="top">
          <div className={styles.defaultFieldWrapper} style={{ display: "flex" }}>
            <span style={{ width: "100%", display: "flex" }}>
              <FormControl disabled={!definedItems.length} style={{ width: "100%" }}>
                <Autocomplete
                  disabled={!definedItems.length}
                  multiple={mode === selectionMode.Multiple}
                  options={definedItems.map((item) => item.id)}
                  getOptionLabel={(optionId) =>
                    definedItems.find((item) => item.id === optionId)?.text || ""
                  }
                  value={
                    mode === selectionMode.Multiple ? defaultValue || [] : defaultValue?.[0] || null
                  }
                  noOptionsText={"לא נמצאו אפשרויות"}
                  onChange={(_, newValue) => {
                    if (mode === selectionMode.Multiple) {
                      onChange({ defaultValue: (newValue as string[]) || [] });
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

        {defaultValue && defaultValue.length > 0 && (
          <Button
            className={styles.button}
            onClick={(_) => {
              onChange({ defaultValue: [] });
            }}>
            <Close sx={{ fontSize: 20, color: "#a54160" }} />
          </Button>
        )}
      </div>

      <Dialog
        open={renameDialogOpen}
        onClose={handleCancelRename}
        TransitionProps={{ onExited: () => setRenameRenameData(null) }}
        aria-labelledby="rename-dialog-title"
        aria-describedby="rename-dialog-description">
        <IconButton
          aria-label="close"
          onClick={handleCancelRename}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: (theme) => theme.palette.grey[500],
          }}>
          <Close sx={{ fontSize: 20 }} />
        </IconButton>

        <DialogTitle id="rename-dialog-title" sx={{ pr: 6 }}>
          {"עדכון שם האפשרות"}
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="rename-dialog-description" sx={{ color: "text.primary" }}>
            {`בוצע שינוי של שם האפשרות מ-"${renameData?.originalText}" ל-"${renameData?.newText}". האם ברצונך להחיל את השינוי באופן רטרואקטיבי על תגובות עבר?`}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => handleConfirmRename(true)} color="primary">
            {"שינוי רטרואקטיבי"}
          </Button>

          <Button
            onClick={() => handleConfirmRename(false)}
            color="primary"
            variant="contained"
            autoFocus>
            {"ללא שינוי רטרואקטיבי"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export { ManualOptions };
export type { ManualItems };
