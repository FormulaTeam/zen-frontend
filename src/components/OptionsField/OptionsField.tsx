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
  LinearProgress,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Close, Info } from "@mui/icons-material";
import {
  connectionTypes,
  DRAGGED_ITEM_ID,
  fieldConnectionTooltipTexts,
} from "../../utils/interfaces";
import React, { useEffect, useRef } from "react";
import { ArrowDropDownIcon } from "@mui/x-date-pickers/icons";
import { getForms, getResponses } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "react-loading";
import BaseFormInput from "../BaseFormInput/BaseFormInput";
import DefaultValueAutocomplete from "./DefaultValueAutocomplete";
import ErrorMessage from "../CreateForm/ErrorMessage";
import { FormDto, FormFieldDto } from "../../types/shared";
import { fieldType } from "formula-gear";

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

type ParentDependency = {
  parentOptionIndex: number;
  childOptionIndices: number[];
};

type OptionsFieldExtra = {
  options?: string[];
  multiSelect?: boolean;
  linkedFormId?: number;
  connectedFieldId?: string;
  parentFieldId?: string;
  parentDependencies?: ParentDependency[];
  connectionType?: string | number;
};

type Props = {
  formField: FormFieldDto;
  allFormFields: FormFieldDto[];
  getBaseFieldElement: () => JSX.Element;
  isOptionValid: (option: string) => boolean | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, optionIndex: number) => void;
  onBlur?: () => void;
  onClose: (e: React.MouseEvent<SVGSVGElement>, optionIndex: number) => void;
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

const getFieldExtra = (field?: FormFieldDto | null): OptionsFieldExtra =>
  (field?.extra as OptionsFieldExtra | undefined) ?? {};

const getFormFields = (form?: FormDto | null): FormFieldDto[] =>
  [...(form?.sections ?? [])]
    .sort((a, b) => a.index - b.index)
    .flatMap((section) => [...section.fields].sort((a, b) => a.index - b.index));

const toStringArray = (values: unknown[]): string[] =>
  values.filter((value): value is string => typeof value === "string");

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
  const responsesCache = useRef<Record<string, string[]>>({});
  const [defaultValues, setDefaultValues] = React.useState<string[]>([]);
  const theme = useTheme();
  const isConnected = isConnectedToAnotherField();
  const [forms, setForms] = React.useState<FormDto[]>([]);
  const [loadingForms, setLoadingForms] = React.useState<boolean>(false);
  const [selectedForm, setSelectedForm] = React.useState<FormDto | null>(null);
  const [formText, setFormText] = React.useState<string>("");
  const [fieldText, setFieldText] = React.useState<string>("");
  const [parentFieldOptions, setParentFieldOptions] = React.useState<string[] | undefined>([]);
  const [loadingOptions, setLoadingOptions] = React.useState<boolean>(false);
  const { user } = useAuth();

  const formFieldExtra = getFieldExtra(formField);
  const selectedFormFields = React.useMemo(() => getFormFields(selectedForm), [selectedForm]);

  const matchedField = React.useMemo(() => {
    if (!formFieldExtra.parentFieldId) return undefined;
    return allFormFields.find((field) => field.id === formFieldExtra.parentFieldId);
  }, [formFieldExtra.parentFieldId, allFormFields]);

  useEffect(() => {
    if (formFieldExtra.linkedFormId) {
      const filter = {
        query: {
          $or: [{ name: { $regex: formText } }, { description: { $regex: formText } }],
          users: { $elemMatch: { upn: user?.upn?.toLowerCase() } },
          id: formFieldExtra.linkedFormId,
        },
      };

      getForms(filter)
        .then((response: FormDto[]) => {
          setSelectedForm(response[0] ?? null);
        })
        .catch(() => {
          setSelectedForm(null);
        });
    } else {
      setSelectedForm(null);
    }
  }, [formFieldExtra.linkedFormId, formText, user?.upn]);

  useEffect(() => {
    setLoadingForms(true);
    const abortController = new AbortController();

    if (formText.length > 2) {
      const filter = {
        query: {
          $or: [{ name: { $regex: formText } }, { description: { $regex: formText } }],
          users: { $elemMatch: { upn: user?.upn?.toLowerCase() } },
        },
        signal: abortController.signal,
      };

      getForms(filter)
        .then((response: FormDto[]) => {
          setForms(response);
          setLoadingForms(false);
        })
        .catch(() => {
          setForms([]);
          setLoadingForms(false);
        });
    } else {
      setForms([]);
      setLoadingForms(false);
    }

    return () => abortController.abort();
  }, [formText, user?.upn]);

  useEffect(() => {
    const matchedFieldExtra = getFieldExtra(matchedField);

    if (matchedField) {
      if (matchedFieldExtra.connectionType === connectionTypes.form) {
        setLoadingOptions(true);

        getResponses({
          form_id: matchedFieldExtra.linkedFormId,
        })
          .then((responses) => {
            if (responses.length === 0) {
              setParentFieldOptions([]);
              return;
            }

            const parentOptions = toStringArray([
              ...new Set(
                responses
                  .map(
                    (response) =>
                      response.fieldValues?.find(
                        (res) =>
                          res.fieldId === matchedFieldExtra.connectedFieldId &&
                          typeof res.value === "string" &&
                          res.value,
                      )?.value,
                  )
                  .filter(Boolean),
              ),
            ] as unknown[]);

            setParentFieldOptions(parentOptions);
          })
          .catch((err) => console.error(err))
          .finally(() => {
            setLoadingOptions(false);
          });
      } else {
        setParentFieldOptions(matchedFieldExtra.options ?? undefined);
      }
    }
  }, [
    formFieldExtra.parentFieldId,
    matchedField,
    getFieldExtra(matchedField).connectedFieldId,
    getFieldExtra(matchedField).options,
  ]);

  function getFilteredOptionsForSelection() {
    const baseFilter = (item: FormFieldDto) =>
      item.id !== formField.id && item.fieldType === fieldType.Options;

    const formConnectionFilter = (item: FormFieldDto) => {
      const itemExtra = getFieldExtra(item);
      return (
        itemExtra.connectionType === connectionTypes.form &&
        formFieldExtra.linkedFormId === itemExtra.linkedFormId
      );
    };

    const availableParentFilter = (item: FormFieldDto) =>
      getFieldExtra(item).parentFieldId === undefined;

    if (formFieldExtra.connectionType === connectionTypes.form) {
      return allFormFields.filter((item) => baseFilter(item) && formConnectionFilter(item));
    }

    const eligibleOptions = allFormFields.filter(baseFilter);
    return isConnected ? eligibleOptions.filter(availableParentFilter) : eligibleOptions;
  }

  function getConnectedFieldNames() {
    return allFormFields
      .filter((field) => getFieldExtra(field).parentFieldId === formField.id)
      .map((field) => field.displayName)
      .join(", ");
  }

  function handleFieldConnected(event: SelectChangeEvent) {
    const selectedParentId = event.target.value !== "" ? event.target.value : undefined;
    const selectedParentField = allFormFields.find((field) => field.id === selectedParentId);
    const parentFieldName = selectedParentField?.name ?? undefined;

    onFieldConnected({
      parentFieldId: selectedParentId,
      parentFieldOptions,
      parentFieldName,
    });
  }

  function handleCheckboxToggle(
    event: React.ChangeEvent<HTMLInputElement>,
    parentOptionIndex: number,
    childOptionIndex: number,
  ) {
    onCheckboxChange({
      parentOptionIndex,
      childOptionIndex,
      enabled: event.target.checked,
    });
  }

  function handleAllCheckboxesToggle(
    childOptionIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const isChecked = event.target.checked;

    if (parentFieldOptions) {
      parentFieldOptions.forEach((_, parentOptionIndex) => {
        onCheckboxChange({
          parentOptionIndex,
          childOptionIndex,
          enabled: isChecked,
        });
      });
    }
  }

  function isCheckboxChecked(parentOptionIndex: number, childOptionIndex: number) {
    const dependency = formFieldExtra.parentDependencies?.find(
      (dep) => dep.parentOptionIndex === parentOptionIndex,
    );
    return dependency?.childOptionIndices.includes(childOptionIndex) ?? false;
  }

  function isSelectionIndeterminate(childOptionIndex: number) {
    const allItemsLength = parentFieldOptions?.length ?? 0;
    const selectedItemsLength =
      formFieldExtra.parentDependencies?.filter((dep) =>
        dep.childOptionIndices.includes(childOptionIndex),
      ).length ?? 0;

    return selectedItemsLength > 0 && selectedItemsLength < allItemsLength;
  }

  function isEverythingSelected(childOptionIndex: number) {
    const allItemsLength = parentFieldOptions?.length ?? 0;

    if (allItemsLength === 0) {
      return false;
    }

    if (!formFieldExtra.parentDependencies || formFieldExtra.parentDependencies.length === 0) {
      return false;
    }

    const selectedItemsLength =
      formFieldExtra.parentDependencies.filter((dep) =>
        dep.childOptionIndices.includes(childOptionIndex),
      ).length ?? 0;

    return selectedItemsLength === allItemsLength;
  }

  function isConnectedToAnotherField() {
    return allFormFields.some((field) => getFieldExtra(field).parentFieldId === formField.id);
  }

  function renderSelectBlock() {
    return (
      <FormControl sx={{ width: 250 }} variant="standard">
        <InputLabel>לחבר עם אפשרות</InputLabel>
        <Select
          label="חבר עם אפשרות"
          onChange={handleFieldConnected}
          value={formFieldExtra.parentFieldId ?? ""}>
          <MenuItem value="">אין חיבור</MenuItem>
          {getFilteredOptionsForSelection().map((option, optionIndex) => (
            <MenuItem key={`option_${optionIndex}`} value={option.id}>
              {option.displayName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  function handleSearchForm(event: React.ChangeEvent<HTMLInputElement>) {
    setFormText(event.target.value);
  }

  function handleSearchField(event: React.ChangeEvent<HTMLInputElement>) {
    setFieldText(event.target.value);
  }

  function handleSelectForm(_event: React.SyntheticEvent, value: FormDto | null) {
    setSelectedForm(value);
    onChangeConnectedForm(value?.id ?? undefined);
    resetDefaultValues();
  }

  function handleSelectField(_event: React.SyntheticEvent, value: FormFieldDto | null) {
    onChangeConnectedFormField(value?.id ?? "");
    resetDefaultValues();
  }

  const resetDefaultValues = () => {
    setDefaultValues([]);
    onChangeDefaultValue?.("");
  };

  const handleResponsesChange = async () => {
    const formId = selectedForm?.id;
    const connectedFieldId = formFieldExtra.connectedFieldId;

    setLoadingOptions(true);

    if (!formId || !connectedFieldId) {
      setLoadingOptions(false);
      return;
    }

    if (responsesCache.current[connectedFieldId]) {
      setDefaultValues(responsesCache.current[connectedFieldId]);
      setLoadingOptions(false);
      return;
    }

    try {
      const responses = await getResponses({ form_id: formId });
      const selectedField =
        selectedFormFields.find((field) => field.id === connectedFieldId) ?? null;

      if (!selectedField) return;

      const responseValues = toStringArray(
        responses
          .map(
            (response) =>
              response?.fieldValues?.find((item) => item.fieldId === selectedField.id)?.value,
          )
          .filter(Boolean),
      );

      const uniqueValues = Array.from(new Set(responseValues));
      responsesCache.current[connectedFieldId] = uniqueValues;
      setDefaultValues(uniqueValues);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (selectedForm && formFieldExtra.connectedFieldId) {
      handleResponsesChange();
    }
  }, [selectedForm?.id, formFieldExtra.connectedFieldId]);

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
            options={selectedFormFields}
            value={
              selectedFormFields.find((field) => field.id === formFieldExtra.connectedFieldId) ??
              null
            }
            filterOptions={(options) => {
              return options.filter((option) =>
                [
                  fieldType.ShortText,
                  fieldType.LongText,
                  fieldType.Number,
                  DRAGGED_ITEM_ID,
                ].includes(option.fieldType as typeof option.fieldType | typeof DRAGGED_ITEM_ID),
              );
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

  const getAvailableOptions = (
    currentField: FormFieldDto,
    currentSelectedForm: FormDto | null,
    currentDefaultValues: string[],
  ) => {
    const currentFieldExtra = getFieldExtra(currentField);
    const currentOptions =
      currentFieldExtra.options?.length === 1 && currentFieldExtra.options[0] === ""
        ? []
        : (currentFieldExtra.options ?? []);

    const connectedField =
      getFormFields(currentSelectedForm).find(
        (field) => field.id === currentFieldExtra.connectedFieldId,
      ) ?? null;

    const connectedFieldOptions = getFieldExtra(connectedField).options ?? [];

    const options = connectedFieldOptions.length
      ? connectedFieldOptions
      : currentDefaultValues.length
        ? currentDefaultValues
        : currentOptions;

    return Array.from(new Set(options.filter((val): val is string => typeof val === "string")));
  };

  const availableOptions = getAvailableOptions(formField, selectedForm, defaultValues);

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
          value={formFieldExtra.connectionType ?? connectionTypes.manual}>
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

        {formFieldExtra.connectionType === connectionTypes.form
          ? renderFormSelectBlock()
          : (formFieldExtra.options ?? []).map((option, optionIndex) => {
              return (
                <Grid
                  sx={{ flexWrap: "nowrap" }}
                  container
                  key={`option_${optionIndex}`}
                  direction="row"
                  gap={2}
                  alignItems="center">
                  <BaseFormInput
                    className={
                      isOptionValid(option) ? "formField-textfield" : "formField-textfield-invalid"
                    }
                    value={(formFieldExtra.options ?? [])[optionIndex] ?? ""}
                    name="title"
                    placeholder={`הזנת אפשרות ${optionIndex + 1 || 0}`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e, optionIndex)}
                    onBlur={onBlur}
                    InputLabelProps={{ shrink: false }}
                  />
                  <Close style={{ cursor: "pointer" }} onClick={(e) => onClose(e, optionIndex)} />
                  {formFieldExtra.parentFieldId && renderOptionAccordionBlock(optionIndex)}
                </Grid>
              );
            })}

        {error && <ErrorMessage msg={error} />}
      </Grid>

      {formFieldExtra.connectionType !== connectionTypes.form && (
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

      {availableOptions.length > 0 &&
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
            checked={Boolean(formFieldExtra.multiSelect)}
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
