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

export const formatOptionLabel = (option: string): string => {
  if (typeof option !== "string" || option.trim() === "") {
    return option;
  }

  const isIsoDate = moment(option, [moment.ISO_8601, "YYYY-MM-DD"], true).isValid();

  if (isIsoDate) {
    const parsed = moment(option);
    const isMidnightLocal = parsed.hour() === 0 && parsed.minute() === 0;
    const isDateTime = option.includes("T") && !isMidnightLocal;

    return parsed.format(isDateTime ? DEFAULT_DATE_TIME_FORMAT : DEFAULT_DATE_FORMAT);
  }

  return option;
};
