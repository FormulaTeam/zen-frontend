export type OptionResponseValue = {
  id: string;
  text: string;
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
      ? value.map((option) => option.text).join(", ")
      : value;
  }

  return isOptionResponseValue(value) ? value.text : value;
};

export const getOptionResponseSubmitValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => (isOptionResponseValue(item) ? item.id : item));
  }

  return isOptionResponseValue(value) ? value.id : value;
};
