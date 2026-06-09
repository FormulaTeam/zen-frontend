import { FieldTypeIds } from "./interfaces";
import { getKeyByValue } from "./utils";
import { getOptionResponseRawValue } from "./optionResponseValue";
import { selectionMode } from "formula-gear";

export const normalizeFieldValue = (field: any, value: any): any => {
  let newValue = value;
  const key = getKeyByValue(FieldTypeIds, field.typeId);

  if (key) {
    if (!["date", "hour", "checkbox", "number"].includes(key) && newValue === undefined) {
      newValue = "";
    }
  }

  if (field.typeId === FieldTypeIds.options) {
    const isMultiple = field.extra?.selectionMode === selectionMode.Multiple;

    newValue = getOptionResponseRawValue(newValue);

    if (isMultiple) {
      return Array.isArray(newValue) ? newValue : newValue ? [newValue] : [];
    }

    return Array.isArray(newValue) ? (newValue[0] ?? "") : (newValue ?? "");
  }

  return newValue;
};

export const getCreatorName = (form: any) => {
  if (form?.createdBy?.name) {
    return form.createdBy.name;
  }

  const user = form?.users?.find((formUser: any) => form.created_by === formUser.upn);

  return user ? `${user.firstName || ""} ${user.lastName || ""}` : form?.created_by_name || "";
};
