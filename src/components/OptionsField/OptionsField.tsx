import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography,
  useTheme,
  LinearProgress,
} from "@mui/material";

import { Close, Info } from "@mui/icons-material";
import {
  connectionTypes,
  DRAGGED_ITEM_ID,
  fieldConnectionTooltipTexts,
  FieldTypeIds,
  Form,
  FormField,
} from "../../utils/interfaces";
import React, { useEffect, useRef } from "react";
import { ArrowDropDownIcon } from "@mui/x-date-pickers/icons";
import { getForms, getResponses } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "react-loading";
import BaseFormInput from "../BaseFormInput/BaseFormInput";
import DefaultValueAutocomplete from "./DefaultValueAutocomplete";
import ErrorMessage from "../CreateForm/ErrorMessage";
import { isOnlyBlankStrings } from "../../utils/utils";

export interface ParentField {
  parentFieldId?: string;
  parentFieldOptions?: string[];
  parentFieldName?: string;
}

export interface CheckboxData {
  parentOptionIndex: number;
  childOptionIndex: number;
  enabled: boolean;
}

type Props = {
  formField: FormField;
  allFormFields: FormField[];
  getBaseFieldElement: () => JSX.Element;
  isOptionValid: (option: string) => boolean | undefined;
  onChange: (e, optionIndex: number) => void;
  onBlur?: () => void;
  onClose: (e, optionIndex: number) => void;
  onAddOption: () => void;
  onToggleIsMultiSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFieldConnected: (selectedFieldData: ParentField) => void;
  onCheckboxChange: (selectedCheckboxData: CheckboxData) => void;
  onChangeFieldConnectionType: (event: SelectChangeEvent) => void;
  onChangeConnectedFormField: (value: string) => void;
  onChangeConnectedForm: (value: number | undefined) => void;
  defaultValue?: string;
  onChangeDefaultValue?: (value: string) => void;
  error?: string;
};

export default function OptionsField({
  formField,
  allFormFields,
  getBaseFieldElement,
  isOptionValid,
  onChange,
  onBlur = () => {},
  onClose,
  onAddOption,
  onChangeDefaultValue,
  defaultValue,
  onToggleIsMultiSelect,
  onFieldConnected,
  onCheckboxChange,
  error,
  onChangeFieldConnectionType,
  onChangeConnectedFormField,
  onChangeConnectedForm,
}: Props) {
  const responsesCache = useRef<Record<number, string[]>>({});
  const [defaultValues, setDefaultValues] = React.useState<string[]>([]);
  const theme = useTheme();
  const isConnected = isConnectedToAnotherField();
  const [forms, setForms] = React.useState<Form[]>([]);
  const [loadingForms, setLoadingForms] = React.useState<boolean>(false);
  const [selectedForm, setSelectedForm] = React.useState<Form | null>(null);
  const [formText, setFormText] = React.useState<string>("");
  const [fieldText, setFieldText] = React.useState<string>("");
  const [parentFieldOptions, setParentFieldOptions] = React.useState<string[] | undefined>([]);
  const [loadingOptions, setLoadingOptions] = React.useState<boolean>(false);
  const { user } = useAuth();

  // using useMemo to keep options updated and avoid unnecessary rendering :)
  const matchedField = React.useMemo(() => {
    if (!formField.parentFieldId) return undefined;
    return allFormFields.find((field) => field.uniqueId === formField.parentFieldId);
  }, [formField.parentFieldId, allFormFields]);

  // getting the selected form by id and at least view permission
  useEffect(() => {
    if (formField.connectedFormId) {
      const filter = {
        query: {
          $or: [{ name: { $regex: formText } }, { description: { $regex: formText } }],
          users: { $elemMatch: { upn: user?.upn?.toLowerCase() } },
          id: formField.connectedFormId,
        },
      };
      getForms(filter)
        .then((response) => {
          setSelectedForm(response[0] ?? null);
        })
        .catch((error) => {
          setSelectedForm(null);
        });
    } else {
      setSelectedForm(null);
    }
  }, [formField.connectedFormId]);

  // searching forms by name or description and at least view permission
  useEffect(() => {
    // Create abort controller for this request
    setLoadingForms(true);
    const abortController = new AbortController();
    if (formText.length > 2) {
      const filter = {
        query: {
          $or: [{ name: { $regex: formText } }, { description: { $regex: formText } }],
          users: { $elemMatch: { upn: user?.upn?.toLowerCase() } },
        },
        signal: abortController.signal, // Attach the signal
      };
      getForms(filter)
        .then((response) => {
          setForms(response);
          setLoadingForms(false);
        })
        .catch((error) => {
          setForms([]);
        });
    } else {
      setForms([]);
      setLoadingForms(false);
    }
    return () => abortController.abort(); // cancels the request when deps change
  }, [formText]);

  // keeps the options updated when the parent changes
  useEffect(() => {
    if (matchedField) {
      if (matchedField.connectionType === connectionTypes.form) {
        setLoadingOptions(true);
        getResponses({
          form_id: matchedField.connectedFormId,
        })
          .then((responses) => {
            if (responses.length === 0) {
              setParentFieldOptions([]);
              return;
            }
            const parentOptions = [
              ...new Set(
                responses
                  .map(
                    (response) =>
                      response.data?.find(
                        (res) => res.uniqueId === matchedField.connectedFieldId && res.value,
                      )?.value,
                  )
                  .filter(Boolean),
              ),
            ];
            if (parentOptions) setParentFieldOptions(parentOptions);
          })
          .catch((err) => console.error(err))
          .finally(() => {
            setLoadingOptions(false);
          });
      } else {
        setParentFieldOptions(matchedField?.options ?? undefined);
      }
    }
  }, [formField.parentFieldId, matchedField?.connectedFieldId, matchedField?.options]);

  function getFilteredOptionsForSelection() {
    // if the field is connected to another field, we only show options that are not already connected
    const baseFilter = (item: FormField) =>
      item.uniqueId !== formField.uniqueId && item.typeId === FieldTypeIds.options;

    // form connection type
    const formConnectionFilter = (item: FormField) =>
      item.connectionType === connectionTypes.form &&
      formField.connectedFormId === item.connectedFormId;

    // filter for available parent fields
    const availableParentFilter = (item: FormField) => item.parentFieldId === undefined;

    // filters based on connection scenario
    if (formField.connectionType === connectionTypes.form) {
      return allFormFields.filter((item) => baseFilter(item) && formConnectionFilter(item));
    }

    const eligibleOptions = allFormFields.filter(baseFilter);

    // if current field is already connected to others, only show available parent fields
    return isConnected ? eligibleOptions.filter(availableParentFilter) : eligibleOptions;
  }

  function getConnectedFieldNames() {
    return allFormFields
      .filter((field) => field.parentFieldId === formField.uniqueId)
      .map((field) => field.displayName)
      .join(", ");
  }

  function handleFieldConnected(event: SelectChangeEvent) {
    const selectedParentId = event.target.value !== "" ? event.target.value : undefined;
    const matchedField = allFormFields.find((field) => field.uniqueId === selectedParentId);
    const parentFieldName = matchedField?.name ?? undefined;

    onFieldConnected({
      parentFieldId: selectedParentId,
      parentFieldOptions: parentFieldOptions,
      parentFieldName: parentFieldName,
    });
  }

  function handleCheckboxToggle(
    event: React.ChangeEvent<HTMLInputElement>,
    parentOptionIndex: number,
    childOptionIndex: number,
  ) {
    onCheckboxChange({
      parentOptionIndex: parentOptionIndex,
      childOptionIndex: childOptionIndex,
      enabled: event.target.checked,
    });
  }

  function handleAllCheckboxesToggle(
    childOptionIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const isChecked = event.target.checked;

    // When "בחר הכל" is clicked, we need to toggle each parent option individually
    // to ensure all parent dependencies are properly created/updated
    if (parentFieldOptions) {
      parentFieldOptions.forEach((_, parentOptionIndex) => {
        onCheckboxChange({
          parentOptionIndex: parentOptionIndex,
          childOptionIndex: childOptionIndex,
          enabled: isChecked,
        });
      });
    }
  }

  function isCheckboxChecked(parentOptionIndex: number, childOptionIndex: number) {
    const dependency = formField.parentDependencies?.find(
      (dep) => dep.parentOptionIndex === parentOptionIndex,
    );
    return dependency?.childOptionIndices.includes(childOptionIndex) ?? false;
  }

  function isSelectionIndeterminate(childOptionIndex: number) {
    const allItemsLength = parentFieldOptions?.length ?? 0;
    const selectedItemsLength =
      formField.parentDependencies?.filter((dep) =>
        dep.childOptionIndices.includes(childOptionIndex),
      ).length ?? 0;
    return selectedItemsLength > 0 && selectedItemsLength < allItemsLength;
  }

  function isEverythingSelected(childOptionIndex: number) {
    const allItemsLength = parentFieldOptions?.length ?? 0;

    // If no parent options exist, nothing can be selected
    if (allItemsLength === 0) {
      return false;
    }

    // If no dependencies exist, nothing is selected
    if (!formField.parentDependencies || formField.parentDependencies.length === 0) {
      return false;
    }

    // Check if all parent options are connected to this child option
    const selectedItemsLength =
      formField.parentDependencies?.filter((dep) =>
        dep.childOptionIndices.includes(childOptionIndex),
      ).length ?? 0;

    return selectedItemsLength === allItemsLength;
  }

  function isConnectedToAnotherField() {
    const uniqueId = formField.uniqueId;
    return allFormFields.some((field) => field.parentFieldId === uniqueId);
  }

  function renderSelectBlock() {
    return (
      <FormControl sx={{ width: 250 }} variant="standard">
        <InputLabel>לחבר עם אפשרות</InputLabel>
        <Select
          label="חבר עם אפשרות"
          onChange={handleFieldConnected}
          value={formField.parentFieldId ?? ""}>
          <MenuItem value="">אין חיבור</MenuItem>
          {getFilteredOptionsForSelection().map((option, optionIndex) => (
            <MenuItem key={"option_" + optionIndex} value={option.uniqueId}>
              {option.displayName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  function handleSearchForm(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setFormText(value);
  }
  function handleSearchField(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setFieldText(value);
  }
  function handleSelectForm(event: React.SyntheticEvent, value: Form | null) {
    setSelectedForm(value);
    onChangeConnectedForm(value?.id ?? undefined);
    resetDefaultValues();
  }
  function handleSelectField(event: React.SyntheticEvent, value: FormField | null) {
    onChangeConnectedFormField(value?.uniqueId ?? "");
    resetDefaultValues();
  }

  const resetDefaultValues = () => {
    setDefaultValues([]);
    onChangeDefaultValue?.(""); // Reset default value when form changes
  };

  const handleResponsesChange = async () => {
    const formId = selectedForm?.id;
    const connectedFieldId = formField.connectedFieldId;
    setLoadingOptions(true);

    if (!formId || !connectedFieldId) {
      setLoadingOptions(false);
      return;
    }

    // ✅ Use cached if available
    if (responsesCache.current[connectedFieldId]) {
      setDefaultValues(responsesCache.current[formId]);
      setLoadingOptions(false);
      return;
    }
    try {
      const responses = await getResponses({ form_id: formId });
      const selectedField = selectedForm?.fields.find(
        (field) => field.uniqueId === connectedFieldId,
      );

      if (!selectedField) return;

      const responseValues = responses
        .map(
          (response) =>
            response?.data?.find((item) => item.uniqueId === selectedField.uniqueId)?.value,
        )
        .filter(Boolean);

      const uniqueValues = Array.from(new Set(responseValues));
      responsesCache.current[connectedFieldId] = uniqueValues;
      setDefaultValues(uniqueValues);
      selectedField.options = uniqueValues;
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (selectedForm && formField.connectedFieldId) {
      handleResponsesChange();
    }
  }, [selectedForm?.id, formField.connectedFieldId]);

  function renderFormSelectBlock() {
    return (
      <>
        <Autocomplete
          disablePortal
          onChange={handleSelectForm}
          options={forms}
          value={selectedForm}
          sx={{ width: 300 }}
          getOptionLabel={(option) => option.name}
          loading={loadingForms}
          loadingText="מחפש..."
          noOptionsText={formText.length > 3 ? "לא נמצאו תוצאות" : "יש להזין לפחות 3 תווים"}
          renderInput={(params) => (
            <BaseFormInput
              onChange={handleSearchForm}
              value={formText}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              {...params}
              label="בחירת טופס..."
            />
          )}
        />
        <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
          <Autocomplete
            disablePortal
            onChange={handleSelectField}
            options={selectedForm?.fields ?? []}
            value={
              selectedForm?.fields.find((field) => field.uniqueId === formField.connectedFieldId) ??
              null
            }
            filterOptions={(options, params) => {
              // DRAGGED_ITEM_ID - without it the filter will not work because of type (typeId: FormFieldTypeId | typeof DRAGGED_ITEM_ID;) error
              // It won't affect the functionality since it is not used as a real typeId
              const filtered = options.filter((option) => {
                return [
                  FieldTypeIds.smallText,
                  FieldTypeIds.longText,
                  FieldTypeIds.number,
                  DRAGGED_ITEM_ID,
                ].includes(option.typeId);
              });

              return filtered;
            }}
            sx={{ width: 300 }}
            getOptionLabel={(option) => option.displayName}
            noOptionsText={selectedForm ? "לא נמצאו שדות מתאימים לחיבור" : "יש לבחור בטופס"}
            renderInput={(params) => (
              <BaseFormInput
                value={fieldText}
                onChange={handleSearchField}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                {...params}
                label="בחירת שדה..."
              />
            )}
          />
          <Tooltip title={fieldConnectionTooltipTexts.AllowedFields}>
            <Info color="disabled" />
          </Tooltip>
        </Box>
      </>
    );
  }

  function renderConnectedFieldBlock() {
    return (
      <Typography variant="body1" color="textSecondary">
        שדות מקושרים: {getConnectedFieldNames()}
      </Typography>
    );
  }

  function renderOptionAccordionBlock(childOptionIndex: number) {
    return (
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Typography>אופציות</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup row={true}>
            {!loadingOptions && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isEverythingSelected(childOptionIndex)}
                    indeterminate={isSelectionIndeterminate(childOptionIndex)}
                    onChange={(event) => handleAllCheckboxesToggle(childOptionIndex, event)}
                  />
                }
                label="בחר הכל"
              />
            )}
          </FormGroup>
          <FormGroup row={true} sx={{ maxWidth: "min-content" }}>
            {loadingOptions ? (
              <Loading type={"spinningBubbles"} color={theme.palette.primary.main} />
            ) : (
              parentFieldOptions?.map((parentOptionName, parentOptionIndex) => {
                return (
                  <FormControlLabel
                    key={parentOptionIndex}
                    control={
                      <Checkbox
                        checked={isCheckboxChecked(parentOptionIndex, childOptionIndex)}
                        name={parentOptionName}
                        onChange={(event) =>
                          handleCheckboxToggle(event, parentOptionIndex, childOptionIndex)
                        }
                      />
                    }
                    label={parentOptionName}
                  />
                );
              })
            )}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
    );
  }

  const getAvailableOptions = (formField, selectedForm, defaultValues) => {
    if (formField.options?.length === 1 && formField.options[0] === "") {
      formField.options = [];
    }

    const connectedField =
      selectedForm?.fields.find((field) => field.uniqueId === formField.connectedFieldId) ?? null;

    const options = connectedField?.options?.length
      ? connectedField.options
      : defaultValues?.length
      ? defaultValues
      : formField.options;

    return Array.from(new Set(options.filter((val) => val !== null && val !== undefined)));
  };

  const availableOptions = getAvailableOptions(formField, selectedForm, defaultValues) as string[];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {getBaseFieldElement()}
      {renderSelectBlock()}
      {isConnected && renderConnectedFieldBlock()}
      <Grid container direction="column" gap={1}>
        <label className="options-title">אפשרויות</label>

        <RadioGroup
          row={true}
          onChange={onChangeFieldConnectionType}
          value={formField.connectionType ?? connectionTypes.manual}>
          <FormControlLabel value={connectionTypes.manual} control={<Radio />} label="ידני" />
          <Box>
            <FormControlLabel
              value={connectionTypes.form}
              control={<Radio />}
              label={
                <>
                  {"מטופס "}
                  <Tooltip title={fieldConnectionTooltipTexts.FormConnection}>
                    <Info fontSize="inherit" color="disabled" />
                  </Tooltip>
                </>
              }
            />
          </Box>
        </RadioGroup>

        {formField.connectionType === connectionTypes.form
          ? renderFormSelectBlock()
          : formField.options?.map((option, optionIndex) => {
              // const isValid = isOptionValid(option);
              return (
                <Grid
                  sx={{ flexWrap: "nowrap" }}
                  container
                  key={"option_" + optionIndex}
                  direction="row"
                  gap={2}
                  alignItems="center">
                  <BaseFormInput
                    className={
                      isOptionValid(option) ? "formField-textfield" : "formField-textfield-invalid"
                    }
                    value={formField.options && formField.options[optionIndex]}
                    name="title"
                    placeholder={"הזנת אפשרות " + (optionIndex + 1 || 0)}
                    onChange={(e) => onChange(e, optionIndex)}
                    onBlur={onBlur}
                    InputLabelProps={{ shrink: false }}
                  />
                  <Close style={{ cursor: "pointer" }} onClick={(e) => onClose(e, optionIndex)} />
                  {formField.parentFieldId && renderOptionAccordionBlock(optionIndex)}
                </Grid>
              );
            })}
        {error && <ErrorMessage msg={error} />}
      </Grid>
      {formField.connectionType !== connectionTypes.form && (
        <Button
          variant="text"
          onClick={onAddOption}
          sx={{
            width: "fit-content",
            fontSize: theme.typography.body1,
            color: theme.palette.primary.dark,
          }}>
          + הוסף עוד אפשרות
        </Button>
      )}

      {Array.isArray(formField.options) &&
        formField.options.length > 0 &&
        (loadingOptions ? (
          <Tooltip title={"טוען אפשרויות"}>
            <Box sx={{ width: "200px", padding: "10px 0", mt: 2 }}>
              <LinearProgress />
            </Box>
          </Tooltip>
        ) : (
          <DefaultValueAutocomplete
            options={availableOptions}
            defaultValue={defaultValue ? defaultValue : ""}
            onChange={onChangeDefaultValue ?? (() => {})}
          />
        ))}

      <FormControlLabel
        label="בחירה מרובה"
        control={
          <Checkbox
            checked={formField.multiSelect}
            style={{
              color: theme.palette.primary.dark,
            }}
            onChange={onToggleIsMultiSelect}
          />
        }
      />
    </Box>
  );
}
