import React from "react";
import { GridFilterOperator } from "@mui/x-data-grid-pro";
import { fieldType, ResponseFilterOperator, type FieldType, selectionMode } from "formula-gear";
import { FormFieldDto, ResponseMetaField } from "../../../../types/shared";
import {
  DateFilterInput,
  DateRangeFilterInput,
  MultiOptionFilterInput,
  NoValueFilterInput,
  NumberFilterInput,
  NumberRangeFilterInput,
  SingleOptionFilterInput,
  TextFilterInput,
  TimeFilterInput,
  TimeRangeFilterInput,
} from "./responseFilterInputs";
import {
  ConnectedMultiOptionFilterInput,
  ConnectedSingleOptionFilterInput,
} from "./connectedOptionFilterInputs";
import { getFieldOptions } from "./responseFilters.utils";

const noClientFilter = () => null;

const makeOperator = (
  operator: ResponseFilterOperator,
  label: string,
  InputComponent: React.JSXElementConstructor<any> = NoValueFilterInput,
  requiresFilterValue = true,
  inputComponentProps?: Record<string, unknown>,
): GridFilterOperator => ({
  label,
  value: operator,
  InputComponent,
  InputComponentProps: inputComponentProps,
  requiresFilterValue,
  getApplyFilterFn: noClientFilter,
});

const isExternallyConnectedField = (field: FormFieldDto, formFields: FormFieldDto[]): boolean => {
  const linkedOptionsFieldId = (field.extra as any)?.linkedOptionsFieldId;

  if (!linkedOptionsFieldId) return false;

  return !formFields.some((f) => String(f.id) === String(linkedOptionsFieldId));
};

const emptyOperators: GridFilterOperator[] = [
  makeOperator(ResponseFilterOperator.IsEmpty, "ריק", NoValueFilterInput),
  makeOperator(ResponseFilterOperator.IsNotEmpty, "לא ריק", NoValueFilterInput),
];

const textOperators = (): GridFilterOperator[] => [
  makeOperator(ResponseFilterOperator.Contains, "מכיל", TextFilterInput),
  makeOperator(ResponseFilterOperator.NotContains, "לא מכיל", TextFilterInput),
  makeOperator(ResponseFilterOperator.Equals, "שווה ל", TextFilterInput),
  makeOperator(ResponseFilterOperator.NotEquals, "שונה מ", TextFilterInput),
  ...emptyOperators,
];

const numberOperators = (): GridFilterOperator[] => [
  makeOperator(ResponseFilterOperator.Equals, "שווה ל", NumberFilterInput),
  makeOperator(ResponseFilterOperator.NotEquals, "שונה מ", NumberFilterInput),
  makeOperator(ResponseFilterOperator.GreaterThan, "גדול מ", NumberFilterInput),
  makeOperator(ResponseFilterOperator.GreaterThanOrEqual, "גדול או שווה ל", NumberFilterInput),
  makeOperator(ResponseFilterOperator.LessThan, "קטן מ", NumberFilterInput),
  makeOperator(ResponseFilterOperator.LessThanOrEqual, "קטן או שווה ל", NumberFilterInput),
  makeOperator(ResponseFilterOperator.Between, "בין", NumberRangeFilterInput),
  makeOperator(ResponseFilterOperator.NotBetween, "לא בין", NumberRangeFilterInput),
  ...emptyOperators,
];

const singleOptionOperators = (
  field: FormFieldDto,
  formFields: FormFieldDto[],
): GridFilterOperator[] => {
  const linkedOptionsFieldId = (field.extra as any)?.linkedOptionsFieldId;

  if (!linkedOptionsFieldId) {
    const inputComponentProps = { options: getFieldOptions(field) };

    return [
      makeOperator(
        ResponseFilterOperator.ContainsAny,
        "מכיל",
        MultiOptionFilterInput,
        true,
        inputComponentProps,
      ),
      makeOperator(
        ResponseFilterOperator.NotContainsAny,
        "לא מכיל",
        MultiOptionFilterInput,
        true,
        inputComponentProps,
      ),
      ...emptyOperators,
    ];
  }

  const isExternallyConnected = isExternallyConnectedField(field, formFields);
  const InputComponent = isExternallyConnected
    ? ConnectedSingleOptionFilterInput
    : SingleOptionFilterInput;
  const inputComponentProps = isExternallyConnected
    ? { linkedOptionsFieldId }
    : { options: getFieldOptions(field) };

  return [
    makeOperator(ResponseFilterOperator.Equals, "שווה ל", InputComponent, true, inputComponentProps),
    makeOperator(
      ResponseFilterOperator.NotEquals,
      "שונה מ",
      InputComponent,
      true,
      inputComponentProps,
    ),
    ...emptyOperators,
  ];
};

const multiOptionOperators = (
  field: FormFieldDto,
  formFields: FormFieldDto[],
): GridFilterOperator[] => {
  const linkedOptionsFieldId = (field.extra as any)?.linkedOptionsFieldId;

  const isExternallyConnected = isExternallyConnectedField(field, formFields);
  const InputComponent = isExternallyConnected
    ? ConnectedMultiOptionFilterInput
    : MultiOptionFilterInput;
  const inputComponentProps = isExternallyConnected
    ? { linkedOptionsFieldId }
    : { options: getFieldOptions(field) };

  return [
    makeOperator(
      ResponseFilterOperator.ContainsAny,
      "מכיל לפחות אחד מהערכים",
      InputComponent,
      true,
      inputComponentProps,
    ),
    makeOperator(
      ResponseFilterOperator.NotContainsAny,
      "לא מכיל אף אחד מהערכים",
      InputComponent,
      true,
      inputComponentProps,
    ),
    makeOperator(
      ResponseFilterOperator.ContainsAll,
      "מכיל את כל הערכים",
      InputComponent,
      true,
      inputComponentProps,
    ),
    makeOperator(
      ResponseFilterOperator.NotContainsAll,
      "לא מכיל את כל הערכים",
      InputComponent,
      true,
      inputComponentProps,
    ),
    ...emptyOperators,
  ];
};

const createDateInput = (field: FormFieldDto): GridFilterOperator["InputComponent"] => {
  const dateType = (field.extra as any)?.dateType;

  return function DateInput(props: any) {
    return React.createElement(DateFilterInput, { ...props, dateType });
  };
};

const createDateRangeInput = (field: FormFieldDto): GridFilterOperator["InputComponent"] => {
  const dateType = (field.extra as any)?.dateType;

  return function DateRangeInput(props: any) {
    return React.createElement(DateRangeFilterInput, { ...props, dateType });
  };
};

const dateOperators = (field: FormFieldDto): GridFilterOperator[] => [
  makeOperator(ResponseFilterOperator.On, "בתאריך", createDateInput(field)),
  makeOperator(ResponseFilterOperator.NotOn, "לא בתאריך", createDateInput(field)),
  makeOperator(ResponseFilterOperator.Before, "לפני", createDateInput(field)),
  makeOperator(ResponseFilterOperator.BeforeOrEqual, "לפני או בתאריך", createDateInput(field)),
  makeOperator(ResponseFilterOperator.After, "אחרי", createDateInput(field)),
  makeOperator(ResponseFilterOperator.AfterOrEqual, "אחרי או בתאריך", createDateInput(field)),
  makeOperator(ResponseFilterOperator.Between, "בין", createDateRangeInput(field)),
  makeOperator(ResponseFilterOperator.NotBetween, "לא בין", createDateRangeInput(field)),
  ...emptyOperators,
];

const createTimeInput = (field: FormFieldDto): GridFilterOperator["InputComponent"] => {
  const extra = field.extra as any;
  const timePrecision = extra?.timePrecision;

  return function TimeInput(props: any) {
    return React.createElement(TimeFilterInput, {
      ...props,
      timePrecision,
    });
  };
};

const createTimeRangeInput = (field: FormFieldDto): GridFilterOperator["InputComponent"] => {
  const extra = field.extra as any;
  const timePrecision = extra?.timePrecision;

  return function TimeRangeInput(props: any) {
    return React.createElement(TimeRangeFilterInput, {
      ...props,
      timePrecision,
    });
  };
};

const timeOperators = (field: FormFieldDto): GridFilterOperator[] => [
  makeOperator(ResponseFilterOperator.Equals, "שווה ל", createTimeInput(field)),
  makeOperator(ResponseFilterOperator.NotEquals, "שונה מ", createTimeInput(field)),
  makeOperator(ResponseFilterOperator.Before, "לפני", createTimeInput(field)),
  makeOperator(ResponseFilterOperator.BeforeOrEqual, "לפני או שווה ל", createTimeInput(field)),
  makeOperator(ResponseFilterOperator.After, "אחרי", createTimeInput(field)),
  makeOperator(ResponseFilterOperator.AfterOrEqual, "אחרי או שווה ל", createTimeInput(field)),
  makeOperator(ResponseFilterOperator.Between, "בין", createTimeRangeInput(field)),
  makeOperator(ResponseFilterOperator.NotBetween, "לא בין", createTimeRangeInput(field)),
  ...emptyOperators,
];

const booleanOperators = (): GridFilterOperator[] => [
  makeOperator(ResponseFilterOperator.IsTrue, "כן", NoValueFilterInput),
  makeOperator(ResponseFilterOperator.IsFalse, "לא", NoValueFilterInput),
  ...emptyOperators,
];

const fileOperators = (): GridFilterOperator[] => [
  makeOperator(ResponseFilterOperator.HasFiles, "יש קבצים", NoValueFilterInput),
  makeOperator(ResponseFilterOperator.HasNoFiles, "אין קבצים", NoValueFilterInput),
  makeOperator(ResponseFilterOperator.FileNameContains, "שם קובץ מכיל", TextFilterInput),
  makeOperator(ResponseFilterOperator.FileNameNotContains, "שם קובץ לא מכיל", TextFilterInput),
];

const locationOperators = (): GridFilterOperator[] => [...emptyOperators];

const isMultiOptionField = (field: FormFieldDto): boolean => {
  const extra = field.extra as any;

  return extra?.selectionMode === selectionMode.Multiple;
};

export const getFilterOperatorsForField = (
  field: FormFieldDto,
  formFields: FormFieldDto[],
): GridFilterOperator[] => {
  switch (field.fieldType as FieldType) {
    case fieldType.LongText:
    case fieldType.ShortText:
    case fieldType.Link:
    case fieldType.List:
      return textOperators();

    case fieldType.Number:
      return numberOperators();

    case fieldType.Options:
      return isMultiOptionField(field)
        ? multiOptionOperators(field, formFields)
        : singleOptionOperators(field, formFields);

    case fieldType.Date:
      return dateOperators(field);

    case fieldType.Time:
      return timeOperators(field);

    case fieldType.Boolean:
      return booleanOperators();

    case fieldType.File:
      return fileOperators();

    case fieldType.Location:
      return locationOperators();

    default:
      return [];
  }
};

const metaTextOperators = (): GridFilterOperator[] => [
  makeOperator(ResponseFilterOperator.Contains, "מכיל", TextFilterInput),
  makeOperator(ResponseFilterOperator.NotContains, "לא מכיל", TextFilterInput),
  makeOperator(ResponseFilterOperator.Equals, "שווה ל", TextFilterInput),
  makeOperator(ResponseFilterOperator.NotEquals, "שונה מ", TextFilterInput),
];

const metaNumberOperators = (): GridFilterOperator[] => [
  makeOperator(ResponseFilterOperator.Equals, "שווה ל", NumberFilterInput),
  makeOperator(ResponseFilterOperator.NotEquals, "שונה מ", NumberFilterInput),
  makeOperator(ResponseFilterOperator.GreaterThan, "גדול מ", NumberFilterInput),
  makeOperator(ResponseFilterOperator.GreaterThanOrEqual, "גדול או שווה ל", NumberFilterInput),
  makeOperator(ResponseFilterOperator.LessThan, "קטן מ", NumberFilterInput),
  makeOperator(ResponseFilterOperator.LessThanOrEqual, "קטן או שווה ל", NumberFilterInput),
  makeOperator(ResponseFilterOperator.Between, "בין", NumberRangeFilterInput),
  makeOperator(ResponseFilterOperator.NotBetween, "לא בין", NumberRangeFilterInput),
];

const metaDateOperators = (): GridFilterOperator[] => [
  makeOperator(ResponseFilterOperator.On, "בתאריך", DateFilterInput),
  makeOperator(ResponseFilterOperator.NotOn, "לא בתאריך", DateFilterInput),
  makeOperator(ResponseFilterOperator.Before, "לפני", DateFilterInput),
  makeOperator(ResponseFilterOperator.BeforeOrEqual, "לפני או בתאריך", DateFilterInput),
  makeOperator(ResponseFilterOperator.After, "אחרי", DateFilterInput),
  makeOperator(ResponseFilterOperator.AfterOrEqual, "אחרי או בתאריך", DateFilterInput),
  makeOperator(ResponseFilterOperator.Between, "בין", DateRangeFilterInput),
  makeOperator(ResponseFilterOperator.NotBetween, "לא בין", DateRangeFilterInput),
];

export const getFilterOperatorsForMetaField = (
  metaField: ResponseMetaField,
): GridFilterOperator[] => {
  switch (metaField) {
    case "index":
      return metaNumberOperators();

    case "created_at":
    case "updated_at":
      return metaDateOperators();

    case "id":
    case "created_by":
    case "updated_by":
      return metaTextOperators();

    default:
      return [];
  }
};
