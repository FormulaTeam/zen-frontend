const STORAGE_PREFIX = "formula-responses-pinned-columns";

export const getPinnedColumnsStorageKey = (
  userIdentifier: string,
  formId: string | number,
): string =>
  `${STORAGE_PREFIX}:${encodeURIComponent(userIdentifier.toLowerCase())}:${formId}`;

export const readPinnedColumns = (
  userIdentifier: string | undefined,
  formId: string | number | undefined,
): string[] => {
  if (!userIdentifier || formId === undefined) return [];

  try {
    const storedValue = localStorage.getItem(getPinnedColumnsStorageKey(userIdentifier, formId));
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    return Array.isArray(parsedValue)
      ? parsedValue.filter((field): field is string => typeof field === "string")
      : [];
  } catch {
    return [];
  }
};

export const writePinnedColumns = (
  userIdentifier: string | undefined,
  formId: string | number | undefined,
  fields: readonly string[],
): void => {
  if (!userIdentifier || formId === undefined) return;

  try {
    localStorage.setItem(
      getPinnedColumnsStorageKey(userIdentifier, formId),
      JSON.stringify(fields),
    );
  } catch {
    // Pinning remains available for the current session when storage is unavailable.
  }
};
