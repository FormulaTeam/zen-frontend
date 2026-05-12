import { TextField, Tooltip } from "@mui/material";
import { GridRenderEditCellParams } from "@mui/x-data-grid-pro";
import { GridApiPro } from "@mui/x-data-grid-pro/models/gridApiPro";
import { useCallback } from "react";

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
  multiple?: boolean;
  validationRegex?: string;
  locationFormat?: string;
  minValue?: number;
  maxValue?: number;
  numberType?: string;
  dateAndTime?: boolean;
  includeTime?: boolean;
  includeSeconds?: boolean;
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

const getOptionIds = (extra: EditorFieldExtra): string[] => {
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

const getOptionLabelMap = (extra: EditorFieldExtra): Record<string, string> => {
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
        multiple,
        numberType,
        minValue,
        maxValue,
        dateAndTime,
        includeTime,
        locationFormat,
        includeSeconds,
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
              options={getOptionIds(fieldExtra)}
              optionLabels={getOptionLabelMap(fieldExtra)}
              multiSelect={multiple}
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
              dateAndTime={Boolean(
                (formField as any).dateAndTime ??
                dateAndTime ??
                (formField as any).includeTime ??
                includeTime,
              )}
              isRequired={formField.isRequired}
              errorMessage={errorMessage}
            />
          );
          break;

        case fieldType.Time:
          editor = (
            <TimeCellEditor
              value={params.value as string | null}
              showSeconds={Boolean(includeSeconds)}
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
          <CellErrorWrapper>
            <CellErrorHeader>
              <CellErrorText title={errorMessage}>{errorMessage}</CellErrorText>

              {error?.detail && (
                <Tooltip title={error.detail} arrow placement="top">
                  <CellErrorInfoIcon aria-label="פירוט שגיאה">ⓘ</CellErrorInfoIcon>
                </Tooltip>
              )}
            </CellErrorHeader>

            <CellValueFlex>{editor}</CellValueFlex>
          </CellErrorWrapper>
        );
      }

      return editor;
    },
    [findFormFieldByColumnName, renderFallbackTextField, updateCellValue, validationErrors],
  );

  return { renderEditCell };
};
