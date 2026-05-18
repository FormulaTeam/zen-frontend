import { GridColDef } from "@mui/x-data-grid-pro";
import { fieldType, type FieldType } from "formula-gear";

import { FormFieldDto } from "../../../../types/shared";
import { getFilterOperatorsForField } from "./responseFilters.operators";
import { getFieldOptions } from "./responseFilters.utils";

const getValueOptions = (field: FormFieldDto) => {
  return getFieldOptions(field).map((option) => ({
    value: option.value,
    label: option.label,
  }));
};

const isFilterableField = (field: FormFieldDto): boolean => {
  return getFilterOperatorsForField(field).length > 0;
};

export const getResponseFilterColumnProps = (field: FormFieldDto): Partial<GridColDef> => {
  const filterOperators = getFilterOperatorsForField(field);

  const baseProps: Partial<GridColDef> = {
    filterable: filterOperators.length > 0,
    filterOperators,
  };

  switch (field.fieldType as FieldType) {
    case fieldType.Options:
      return {
        ...baseProps,
        type: "singleSelect",
        valueOptions: getValueOptions(field),
        getOptionValue: (value: any) => value?.value ?? value,
        getOptionLabel: (value: any) => value?.label ?? String(value ?? ""),
      };

    default:
      return {
        ...baseProps,
        type: "string",
      };
  }
};
