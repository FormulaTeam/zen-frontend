import React from "react";
import { GridFilterOperator } from "@mui/x-data-grid-pro";
import { fieldType, ResponseFilterOperator, type FieldType } from "formula-gear";

import { FormFieldDto } from "../../../../types/shared";
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
import { getFieldOptions } from "./responseFilters.utils";

const noClientFilter = () => null;

const makeOperator = (
  operator: ResponseFilterOperator,
  label: string,
  InputComponent: GridFilterOperator["InputComponent"] = NoValueFilterInput,
  requiresFilterValue = true,
): GridFilterOperator => ({
  label,
  value: operator,
  InputComponent,
  requiresFilterValue,
  getApplyFilterFn: noClientFilter,
});

const createSingleOptionInput = (field: FormFieldDto): GridFilterOperator["InputComponent"] => {
  const options = getFieldOptions(field);

  return function SingleOptionInput(props: any) {
    return React.createElement(SingleOptionFilterInput, {
      ...props,
      options,
    });
  };
};

const createMultiOptionInput = (field: FormFieldDto): GridFilterOperator["InputComponent"] => {
  const options = getFieldOptions(field);

  return function MultiOptionInput(props: any) {
    return React.createElement(MultiOptionFilterInput, {
      ...props,
      options,
    });
  };
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

const singleOptionOperators = (field: FormFieldDto): GridFilterOperator[] => [
  makeOperator(ResponseFilterOperator.Equals, "שווה ל", createSingleOptionInput(field)),
  makeOperator(ResponseFilterOperator.NotEquals, "שונה מ", createSingleOptionInput(field)),
  ...emptyOperators,
];

const multiOptionOperators = (field: FormFieldDto): GridFilterOperator[] => [
  makeOperator(ResponseFilterOperator.ContainsAny, "מכיל אחד מתוך", createMultiOptionInput(field)),
  makeOperator(
    ResponseFilterOperator.NotContainsAny,
    "לא מכיל אף אחד מתוך",
    createMultiOptionInput(field),
  ),
  makeOperator(ResponseFilterOperator.ContainsAll, "מכיל את כולם", createMultiOptionInput(field)),
  makeOperator(
    ResponseFilterOperator.NotContainsAll,
    "לא מכיל את כולם",
    createMultiOptionInput(field),
  ),
  ...emptyOperators,
];

const dateOperators = (): GridFilterOperator[] => [
  makeOperator(ResponseFilterOperator.On, "בתאריך", DateFilterInput),
  makeOperator(ResponseFilterOperator.NotOn, "לא בתאריך", DateFilterInput),
  makeOperator(ResponseFilterOperator.Before, "לפני", DateFilterInput),
  makeOperator(ResponseFilterOperator.BeforeOrEqual, "לפני או בתאריך", DateFilterInput),
  makeOperator(ResponseFilterOperator.After, "אחרי", DateFilterInput),
  makeOperator(ResponseFilterOperator.AfterOrEqual, "אחרי או בתאריך", DateFilterInput),
  makeOperator(ResponseFilterOperator.Between, "בין", DateRangeFilterInput),
  makeOperator(ResponseFilterOperator.NotBetween, "לא בין", DateRangeFilterInput),
  ...emptyOperators,
];

const timeOperators = (): GridFilterOperator[] => [
  makeOperator(ResponseFilterOperator.Equals, "שווה ל", TimeFilterInput),
  makeOperator(ResponseFilterOperator.NotEquals, "שונה מ", TimeFilterInput),
  makeOperator(ResponseFilterOperator.Before, "לפני", TimeFilterInput),
  makeOperator(ResponseFilterOperator.BeforeOrEqual, "לפני או שווה ל", TimeFilterInput),
  makeOperator(ResponseFilterOperator.After, "אחרי", TimeFilterInput),
  makeOperator(ResponseFilterOperator.AfterOrEqual, "אחרי או שווה ל", TimeFilterInput),
  makeOperator(ResponseFilterOperator.Between, "בין", TimeRangeFilterInput),
  makeOperator(ResponseFilterOperator.NotBetween, "לא בין", TimeRangeFilterInput),
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

  return Boolean(extra?.multiSelect ?? extra?.multiple);
};

export const getFilterOperatorsForField = (field: FormFieldDto): GridFilterOperator[] => {
  switch (field.fieldType as FieldType) {
    case fieldType.LongText:
    case fieldType.ShortText:
    case fieldType.Link:
    case fieldType.List:
      return textOperators();

    case fieldType.Number:
      return numberOperators();

    case fieldType.Options:
      return isMultiOptionField(field) ? multiOptionOperators(field) : singleOptionOperators(field);

    case fieldType.Date:
      return dateOperators();

    case fieldType.Time:
      return timeOperators();

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
