/**
 * Session storage utilities for managing temporary state across page refreshes
 */

const VIEWS_STORAGE_PREFIX = "formula-responses-view-";

export const getSelectedViewIdKey = (formId: string | number): string => {
  return `${VIEWS_STORAGE_PREFIX}${formId}`;
};

export const getSelectedViewIdFromSession = (formId: string | number): string | null => {
  try {
    const key = getSelectedViewIdKey(formId);
    return sessionStorage.getItem(key);
  } catch (error) {
    console.error("Failed to get view ID from session storage:", error);
    return null;
  }
};

export const saveSelectedViewIdToSession = (formId: string | number, viewId: string): void => {
  try {
    const key = getSelectedViewIdKey(formId);
    if (viewId) {
      sessionStorage.setItem(key, viewId);
    } else {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.error("Failed to save view ID to session storage:", error);
  }
};
