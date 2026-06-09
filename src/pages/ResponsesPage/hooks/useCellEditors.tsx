import { Box, TextField, Tooltip } from "@mui/material";
import { GridRenderEditCellParams } from "@mui/x-data-grid-pro";
import { GridApiPro } from "@mui/x-data-grid-pro/models/gridApiPro";
import { useCallback, useMemo } from "react";

import { fieldType } from "formula-gear";

import { FormFieldDto } from "../../../types/shared";
import {
  CheckboxCellEditor,
  DateCellEditor,
  FileCellEditor,
  LinkCellEditor,
  ListCellEditor,
  LocationCellEditor,
  NumberCellEditor,
  OptionsCellEditor,
  TextCellEditor,
  TimeCellEditor,
} from "../components/CellEditors";
import {
  CellErrorHeader,
  CellErrorInfoIcon,
  CellErrorText,
  CellErrorWrapper,
  CellValueFlex,
} from "../styled";
import { getOptionResponseRawValue, OptionResponseValue } from "../../../utils/optionResponseValue";

type QuickEditValidationError = {
  message: string;
  detail?: string;
};

type EditorFieldExtra = {
  options?:
    | string[]
    | {
        items?: OptionResponseValue[];
      };
  selectionMode?: "multiple" | "single";
  validationRegex?: string;
  locationFormat?: "utm" | "wkt";
  minValue?: number;
  maxValue?: number;
  numberType?: "integer" | "decimal";
  dateType?: "datetime" | "date";
  timePrecision?: "seconds" | "minutes";
};

interface UseCellEditorsParams {
  apiRef: React.MutableRefObject<GridApiPro | null>;
  formFields: FormFieldDto[] | undefined;
  validationErrors?: Record<number | string, Record<string, QuickEditValidationError>>;
  onLiveChange?: <T>(
    rowId: number | string,
    columnName: string,
    value: T,
    isValid?: boolean,
  ) => void;
}

interface UseCellEditorsReturn {
  renderEditCell: (params: GridRenderEditCellParams) => React.ReactElement;
}

const getFieldExtra = (field: FormFieldDto): EditorFieldExtra =>
  (field.extra as EditorFieldExtra | undefined) ?? {};

const getOptionIds = (field: FormFieldDto): string[] => {
  if (Array.isArray((field as any).options)) {
    return (field as any).options.map((option: any) => String(option.id));
  }

  const extra = getFieldExtra(field);

  if (Array.isArray(extra.options)) {
    return extra.options.map((option) => String(option));
  }

  if (extra.options && Array.isArray(extra.options.items)) {
    return extra.options.items
      .filter((option) => option && typeof option.id === "string")
      .map((option) => option.id);
  }

  return [];
};

const getOptionLabelMap = (field: FormFieldDto): Record<string, string> => {
  if (Array.isArray((field as any).options)) {
    return Object.fromEntries(
      (field as any).options
        .filter(
          (option: any) => option && typeof option.id === "string" && typeof option.text === "string",
        )
        .map((option: any) => [option.id, option.text]),
    );
  }

  const extra = getFieldExtra(field);

  if (
    extra.options &&
    typeof extra.options === "object" &&
    !Array.isArray(extra.options) &&
    Array.isArray(extra.options.items)
  ) {
    return Object.fromEntries(
      extra.options.items
        .filter(
          (option) => option && typeof option.id === "string" && typeof option.text === "string",
        )
        .map((option) => [option.id, option.text]),
    );
  }

  return {};
};

export const useCellEditors = ({
  apiRef,
  formFields,
  validationErrors,
  onLiveChange,
}: UseCellEditorsParams): UseCellEditorsReturn => {
  const updateCellValue = useCallback(
    <T,>(params: GridRenderEditCellParams, newValue: T, isValid?: boolean): void => {
      apiRef.current?.setEditCellValue({
        id: params.id,
        field: params.field,
        value: newValue,
      });

      onLiveChange?.<T>(params.id, params.field as string, newValue, isValid);
    },
    [apiRef, onLiveChange],
  );

  const renderFallbackTextField = useCallback(
    (params: GridRenderEditCellParams): React.ReactElement => (
      <TextField
        variant="standard"
        fullWidth
        value={String(params.value ?? "")}
        onChange={(event) => updateCellValue(params, event.target.value)}
        InputProps={{ disableUnderline: true }}
        sx={{ px: 1 }}
      />
    ),
    [updateCellValue],
  );

  const findFormFieldByColumnName = useCallback(
    (columnName: string): FormFieldDto | undefined => {
      const fieldPrefix = "field:";

      if (columnName.startsWith(fieldPrefix)) {
        const fieldId = columnName.slice(fieldPrefix.length);

        return formFields?.find((field) => String(field.id) === fieldId);
      }

      return formFields?.find((field) => String(field.id) === columnName);
    },
    [formFields],
  );

  const renderEditCell = useCallback(
    (params: GridRenderEditCellParams): React.ReactElement => {
      const formField = findFormFieldByColumnName(params.field);
      const rowId = params.id;
      const error = validationErrors?.[rowId]?.[params.field as string];
      const errorMessage = error?.message;

      if (!formField) return renderFallbackTextField(params);

      const fieldExtra = getFieldExtra(formField);
      const {
        validationRegex,
        selectionMode,
        numberType,
        minValue,
        maxValue,
        dateType,
        locationFormat,
        timePrecision,
      } = fieldExtra;

      const handleChange = <T,>(newValue: T, isValid?: boolean): void => {
        updateCellValue<T>(params, newValue, isValid);
      };

      let editor: React.ReactElement;

      switch (formField.fieldType) {
        case fieldType.ShortText:
          editor = (
            <TextCellEditor
              value={params.value as string}
              onChange={handleChange}
              validationRegex={validationRegex}
              isRequired={formField.isRequired}
              errorMessage={errorMessage}
              multiline={false}
            />
          );
          break;

        case fieldType.LongText:
          editor = (
            <TextCellEditor
              value={params.value as string}
              onChange={handleChange}
              validationRegex={validationRegex}
              isRequired={formField.isRequired}
              errorMessage={errorMessage}
              multiline
            />
          );
          break;

        case fieldType.Options:
          editor = (
            <OptionsCellEditor
              value={getOptionResponseRawValue(params.value) as string | string[]}
              onChange={handleChange}
              options={getOptionIds(formField)}
              optionLabels={getOptionLabelMap(formField)}
              selectionMode={selectionMode}
              isRequired={formField.isRequired}
              errorMessage={errorMessage}
            />
          );
          break;

        case fieldType.Number:
          editor = (
            <NumberCellEditor
              value={params.value as number | string}
              onChange={handleChange}
              numberType={numberType}
              minValue={minValue}
              maxValue={maxValue}
              isRequired={formField.isRequired}
              errorMessage={errorMessage}
            />
          );
          break;

        case fieldType.Date:
          editor = (
            <DateCellEditor
              value={params.value as string | null}
              onChange={handleChange}
              dateType={dateType}
              isRequired={formField.isRequired}
              errorMessage={errorMessage}
            />
          );
          break;

        case fieldType.Time:
          editor = (
            <TimeCellEditor
              value={params.value as string | null}
              timePrecision={timePrecision}
              onChange={handleChange}
              isRequired={formField.isRequired}
              errorMessage={errorMessage}
            />
          );
          break;

        case fieldType.Boolean:
          editor = (
            <CheckboxCellEditor
              value={params.value as boolean}
              onChange={handleChange}
              label=""
              isRequired={formField.isRequired}
              errorMessage={errorMessage}
            />
          );
          break;

        case fieldType.List:
          editor = (
            <ListCellEditor
              value={params.value as string[]}
              onChange={handleChange}
              isRequired={formField.isRequired}
              errorMessage={errorMessage}
            />
          );
          break;

        case fieldType.Link:
          editor = (
            <LinkCellEditor
              value={params.value}
              onChange={handleChange}
              isRequired={formField.isRequired}
              errorMessage={errorMessage}
            />
          );
          break;

        case fieldType.Location:
          editor = (
            <LocationCellEditor
              value={params.value}
              onChange={handleChange}
              locationFormat={locationFormat}
              isRequired={formField.isRequired}
              errorMessage={errorMessage}
            />
          );
          break;

        case fieldType.File:
          editor = (
            <FileCellEditor
              value={params.value}
              onChange={handleChange}
              isRequired={formField.isRequired}
              errorMessage={errorMessage}
            />
          );
          break;

        default:
          return renderFallbackTextField(params);
      }

      if (errorMessage) {
        return (
          <Tooltip
            title={error?.detail ? `${errorMessage}\n${error.detail}` : errorMessage}
            arrow
            placement="top">
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "relative",
                display: "flex",
                alignItems: "center",
                "& .MuiInputBase-root": {
                  borderColor: "#d32f2f !important",
                },
              }}>
              {editor}

              <CellErrorInfoIcon
                aria-label="פירוט שגיאה"
                sx={{
                  position: "absolute",
                  insetInlineEnd: 4,
                  top: 4,
                  zIndex: 2,
                }}>
                ⓘ
              </CellErrorInfoIcon>
            </Box>
          </Tooltip>
        );
      }

      return editor;
    },
    [findFormFieldByColumnName, renderFallbackTextField, updateCellValue, validationErrors],
  );

  return useMemo(() => ({ renderEditCell }), [renderEditCell]);
};
