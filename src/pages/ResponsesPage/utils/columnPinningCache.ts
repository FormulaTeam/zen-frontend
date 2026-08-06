const STORAGE_PREFIX = "formula-responses-pinned-columns";
type FormId = string | number;
let hasWarnedAboutWriteFailure = false;

const getStorageKey = (userIdentifier: string, formId: FormId): string =>
  `${STORAGE_PREFIX}:${encodeURIComponent(userIdentifier.toLowerCase())}:${formId}`;

export const readPinnedColumns = (
  userIdentifier: string | undefined,
  formId: FormId | undefined,
): string[] => {
  if (!userIdentifier || formId === undefined) return [];

  try {
    const savedValue = localStorage.getItem(getStorageKey(userIdentifier, formId));
    if (!savedValue) return [];

    const parsedValue: unknown = JSON.parse(savedValue);
    if (!Array.isArray(parsedValue)) return [];

    return [...new Set(parsedValue.filter((field): field is string => typeof field === "string"))];
  } catch {
    return [];
  }
};

export const writePinnedColumns = (
  userIdentifier: string | undefined,
  formId: FormId | undefined,
  fields: readonly string[],
): void => {
  if (!userIdentifier || formId === undefined) return;

  try {
    localStorage.setItem(getStorageKey(userIdentifier, formId), JSON.stringify(fields));
  } catch (error) {
    if (!hasWarnedAboutWriteFailure) {
      hasWarnedAboutWriteFailure = true;
      console.warn("Failed to persist pinned response columns", error);
    }
  }
};
