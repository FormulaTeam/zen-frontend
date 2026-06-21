import moment from "moment";
import { DEFAULT_DATE_FORMAT, DEFAULT_DATE_TIME_FORMAT } from "./utils";

export type OptionResponseValue = {
  id: string;
  text: string;
  isActive?: boolean;
};

export const isOptionResponseValue = (value: unknown): value is OptionResponseValue => {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "text" in value &&
    typeof value.id === "string" &&
    typeof value.text === "string"
  );
};

export const getOptionResponseRawValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.every(isOptionResponseValue) ? value.map((option) => option.id) : value;
  }

  return isOptionResponseValue(value) ? value.id : value;
};

export const getOptionResponseDisplayValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.every(isOptionResponseValue)
      ? value.map((option) => formatOptionLabel(option.text))
      : value;
  }

  return isOptionResponseValue(value) ? formatOptionLabel(value.text) : value;
};

export const getOptionResponseSubmitValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => (isOptionResponseValue(item) ? item.id : item));
  }

  return isOptionResponseValue(value) ? value.id : value;
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const ISO_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:?\d{2})?$/;

export const formatOptionLabel = (option: string): string => {
  if (typeof option !== "string" || option.trim() === "") {
    return option;
  }

  const trimmedOption = option.trim();
  const isDateOnly = DATE_ONLY_PATTERN.test(trimmedOption);
  const isDateTime = ISO_DATE_TIME_PATTERN.test(trimmedOption);

  if (!isDateOnly && !isDateTime) {
    return option;
  }

  const parsed = moment(trimmedOption, isDateOnly ? "YYYY-MM-DD" : moment.ISO_8601, true);

  if (!parsed.isValid()) {
    return option;
  }

  return parsed.format(isDateTime ? DEFAULT_DATE_TIME_FORMAT : DEFAULT_DATE_FORMAT);
};
