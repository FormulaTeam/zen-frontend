import { GridColDef } from "@mui/x-data-grid-pro";
import { fieldType, type FieldType } from "formula-gear";

import { FormFieldDto, ResponseMetaField } from "../../../../types/shared";
import {
  getFilterOperatorsForField,
  getFilterOperatorsForMetaField,
} from "./responseFilters.operators";
import { getFieldOptions } from "./responseFilters.utils";

const getValueOptions = (field: FormFieldDto) => {
  return getFieldOptions(field).map((option) => ({
    value: option.id,
    label: option.text,
  }));
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

export const getResponseMetaFilterColumnProps = (
  metaField: ResponseMetaField,
): Partial<GridColDef> => {
  const filterOperators = getFilterOperatorsForMetaField(metaField);

  const baseProps: Partial<GridColDef> = {
    filterable: filterOperators.length > 0,
    filterOperators,
  };

  switch (metaField) {
    case "index":
      return {
        ...baseProps,
        type: "number",
      };

    case "created_at":
    case "updated_at":
      return {
        ...baseProps,
        type: "string",
      };

    case "id":
    case "created_by":
    case "updated_by":
    default:
      return {
        ...baseProps,
        type: "string",
      };
  }
};
