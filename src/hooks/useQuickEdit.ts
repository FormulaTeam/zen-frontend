import { useState, useCallback, useRef } from "react";
import { updateResponse, createResponse } from "../api/responsesApi";
import { showErrorNotification, showSuccessNotification } from "../utils/utils";
import isEqual from "lodash/isEqual";

interface UseQuickEditProps {
  form: any;
  allFilteredResponses: any[];
  rowSelection: any;
  user: any;
  setShouldRefreshPage: (value: boolean) => void;
}

export const useQuickEdit = ({
  form,
  allFilteredResponses,
  rowSelection,
  user,
  setShouldRefreshPage,
}: UseQuickEditProps) => {
  const [isQuickEditMode, setIsQuickEditMode] = useState(false);
  const [originalDataMap, setOriginalDataMap] = useState<Record<string, any>>({});
  const [editedData, setEditedData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newResponseCounter, setNewResponseCounter] = useState(0);
  const [newResponses, setNewResponses] = useState<any[]>([]);
  const [rowEditMode, setRowEditMode] = useState<Record<string, boolean>>({});
  const [forceRenderCounter, setForceRenderCounter] = useState(0);
  const originalDataRef = useRef({});
  const hasChangesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getRequiredFields = useCallback(() => {
    return form?.fields?.filter((field) => field.required) || [];
  }, [form]);

  const isEditButtonDisabled = useCallback(() => {
    return !allFilteredResponses || allFilteredResponses.length === 0;
  }, [allFilteredResponses]);

  const getEditButtonDisabledReason = useCallback(() => {
    return isEditButtonDisabled() ? "אין תגובות זמינות לעריכה" : "";
  }, [isEditButtonDisabled]);

  const initializeEditData = useCallback(() => {
    const initialData = {};
    const initialRowEditMode = {};

    allFilteredResponses?.forEach((response) => {
      initialData[response.id] = {};
      initialRowEditMode[response.id] = true;
      response.data?.forEach((field) => {
        initialData[response.id][field.uniqueId] = field.value;
      });
    });

    originalDataRef.current = JSON.parse(JSON.stringify(initialData));
    setEditedData(initialData);
    setOriginalDataMap(initialData);
    setRowEditMode(initialRowEditMode);
    setValidationErrors({});
    setHasUnsavedChanges(false);
  }, [allFilteredResponses]);

  const handleLiveValueChange = useCallback((responseId, fieldId, value) => {
    console.log("Live change:", responseId, fieldId, value);
  }, []);

  const handleCellValueChange = useCallback(
    (responseId, fieldId, value) => {
      setEditedData((prev) => {
        if (isEqual(prev[responseId]?.[fieldId], value)) return prev;
        return {
          ...prev,
          [responseId]: {
            ...prev[responseId],
            [fieldId]: value,
          },
        };
      });

      // Validate the field immediately
      const requiredFields = getRequiredFields();
      const field = requiredFields.find((f) => f.uniqueId === fieldId);

      setValidationErrors((prev) => {
        const newErrors = { ...prev };

        // Clear existing error for this field
        if (newErrors[responseId]?.[fieldId]) {
          delete newErrors[responseId][fieldId];
          if (Object.keys(newErrors[responseId] || {}).length === 0) {
            delete newErrors[responseId];
          }
        }

        // Check if field is required and validate
        if (field && field.required) {
          const isEmpty =
            !value ||
            (typeof value === "string" && value.trim() === "") ||
            (Array.isArray(value) && value.length === 0);

          if (isEmpty) {
            if (!newErrors[responseId]) newErrors[responseId] = {};
            newErrors[responseId][fieldId] = `${field.displayName} הוא שדה חובה`;
          }
        }

        return newErrors;
      });

      if (hasChangesTimeoutRef.current) {
        clearTimeout(hasChangesTimeoutRef.current);
      }

      hasChangesTimeoutRef.current = setTimeout(() => {
        setEditedData((currentData) => {
          const hasChanged = Object.entries(currentData).some(
            ([id, data]: any) => !isEqual(data, originalDataRef.current?.[id]),
          );
          setHasUnsavedChanges(hasChanged);
          return currentData;
        });
      }, 0);
    },
    [getRequiredFields],
  );

  const addNewResponse = useCallback(() => {
    if (!form?.fields) return;

    const newResponseId = `new_${newResponseCounter + 1}`;
    setNewResponseCounter((prev) => prev + 1);

    const newResponse = {
      id: newResponseId,
      form_id: form.id,
      created_by: user?.upn?.toLowerCase() || "",
      created_by_name: user?.displayName || "",
      created_at: new Date().toISOString(),
      edited_by: user?.upn?.toLowerCase() || "",
      edited_by_name: user?.displayName || "",
      edited_at: new Date().toISOString(),
      data: form.fields.map((field) => ({
        uniqueId: field.uniqueId,
        value: "",
        displayName: field.displayName,
      })),
    };
    setNewResponses((prev) => [newResponse, ...prev]);

    setEditedData((prev) => {
      const newData = { ...prev, [newResponseId]: {} };
      form.fields.forEach((field) => {
        newData[newResponseId][field.uniqueId] = "";
      });
      setHasUnsavedChanges(true);
      return newData;
    });

    setRowEditMode((prev) => ({
      ...prev,
      [newResponseId]: true,
    }));
  }, [form, newResponseCounter, user]);

  const getCombinedResponses = useCallback(() => {
    if (!isQuickEditMode) return allFilteredResponses || [];
    return [...newResponses, ...(allFilteredResponses || [])];
  }, [isQuickEditMode, newResponses, allFilteredResponses]);

  const handleRowSelectionChange = useCallback(
    (newRowSelection: Record<string, boolean>) => {
      if (!isQuickEditMode) return;

      let hasChanges = false;

      setRowEditMode((prev) => {
        const newRowEditMode = { ...prev };
        Object.keys(newRowSelection).forEach((rowId) => {
          const isSelected = newRowSelection[rowId];
          const newEditMode = !isSelected;

          if (newRowEditMode[rowId] !== newEditMode) {
            newRowEditMode[rowId] = newEditMode;
            hasChanges = true;
          }
        });
        return hasChanges ? newRowEditMode : prev;
      });

      if (hasChanges) {
        setForceRenderCounter((prev) => prev + 1);
      }
    },
    [isQuickEditMode],
  );

  const isRowInEditMode = useCallback(
    (rowId: string) => {
      if (!isQuickEditMode) return false;
      return rowEditMode[rowId] !== false;
    },
    [isQuickEditMode, rowEditMode],
  );

  const validateData = useCallback(() => {
    const errors: any = {};
    const requiredFields = getRequiredFields();

    Object.entries(editedData).forEach(([responseId, responseData]: [string, any]) => {
      requiredFields.forEach((field: any) => {
        const value = responseData[field.uniqueId];
        if (
          !value ||
          (typeof value === "string" && value.trim() === "") ||
          (Array.isArray(value) && value.length === 0)
        ) {
          if (!errors[responseId]) errors[responseId] = {};
          errors[responseId][field.uniqueId] = `${field.displayName} הוא שדה חובה`;
        }
      });
    });

    // Update validation errors state immediately
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [editedData, getRequiredFields]);

  const getChangedRows = (
    editedData: Record<string, any>,
    originalDataMap: Record<string, any>,
  ): Record<string, any> => {
    const changedRows: Record<string, any> = {};

    Object.entries(editedData).forEach(([rowId, editedRow]) => {
      const originalRow = originalDataMap[rowId];

      if (!isEqual(editedRow, originalRow)) {
        changedRows[rowId] = editedRow;
      }
    });

    return changedRows;
  };

  const saveChanges = useCallback(async () => {
    // Run validation and update validation errors state for UI display
    if (!validateData()) {
      showErrorNotification("יש לתקן את השגיאות לפני השמירה");
      return false;
    }
    const errors: any = {};
    const requiredFields = getRequiredFields();

    Object.entries(editedData).forEach(([responseId, responseData]: [string, any]) => {
      requiredFields.forEach((field: any) => {
        const value = responseData[field.uniqueId];
        if (
          !value ||
          (typeof value === "string" && value.trim() === "") ||
          (Array.isArray(value) && value.length === 0)
        ) {
          if (!errors[responseId]) errors[responseId] = {};
          errors[responseId][field.uniqueId] = `${field.displayName} הוא שדה חובה`;
        }
      });
    });

    // Always update validation errors state so fields show the errors
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      const errorMessage = "לא ניתן לשמור את השינויים. יש לתקן את השדות המסומנים.";
      showErrorNotification(errorMessage);
      return false;
    }

    try {
      const updates: Promise<any>[] = [];
      const creates: Promise<any>[] = [];
      const changedRows = getChangedRows(editedData, originalDataMap);

      Object.entries(changedRows).forEach(([responseId, responseData]: [string, any]) => {
        if (responseId.startsWith("new_")) {
          const newResponsePayload = {
            form_id: form.id,
            created_by: user?.upn?.toLowerCase() || "",
            created_by_name: user?.displayName || "",
            edited_by: user?.upn?.toLowerCase() || "",
            edited_by_name: user?.displayName || "",
            data: form.fields.map((field) => ({
              uniqueId: field.uniqueId,
              value: responseData[field.uniqueId] || "",
              displayName: field.displayName,
            })),
          };

          form.fields.forEach((field) => {
            if (field.name && responseData[field.uniqueId] !== undefined) {
              const value = responseData[field.uniqueId];
              newResponsePayload[field.name] =
                typeof value === "object" ? JSON.stringify(value) : value;
            }
          });

          creates.push(createResponse(newResponsePayload));
        } else {
          const originalResponse = allFilteredResponses.find((r) => r.id.toString() === responseId);
          if (!originalResponse) return;

          const fieldMap = new Map();
          form.fields.forEach((field) => fieldMap.set(field.uniqueId, field));

          const { _id, ...responseWithoutId } = originalResponse;
          const updatedData = {
            ...responseWithoutId,
            edited_by: user?.upn?.toLowerCase() || originalResponse.edited_by,
            edited_by_name: user?.displayName || originalResponse.edited_by_name,
            data: originalResponse.data.map((field) => ({
              ...field,
              value: responseData[field.uniqueId] ?? field.value,
            })),
          };

          Object.entries(responseData).forEach(([uniqueId, newValue]) => {
            const field = fieldMap.get(uniqueId);
            if (field?.name && newValue !== undefined && newValue !== null) {
              updatedData[field.name] =
                typeof newValue === "object" ? JSON.stringify(newValue) : newValue;
            }
          });

          updates.push(updateResponse(form.id, parseInt(responseId), updatedData));
        }
      });

      await Promise.all([...updates, ...creates]);

      showSuccessNotification("השינויים נשמרו בהצלחה");
      setHasUnsavedChanges(false);

      const updatedOriginal = { ...originalDataRef.current };
      Object.keys(changedRows).forEach((responseId) => {
        updatedOriginal[responseId] = { ...editedData[responseId] };
      });
      originalDataRef.current = updatedOriginal;

      setNewResponses([]);
      setNewResponseCounter(0);
      setShouldRefreshPage(true);
      return true;
    } catch (error) {
      console.error("Error saving changes:", error);
      showErrorNotification("שגיאה בשמירת השינויים");
      return false;
    }
  }, [editedData, validateData, form, allFilteredResponses, setShouldRefreshPage, user]);

  const toggleQuickEdit = useCallback(() => {
    if (hasChangesTimeoutRef.current) {
      clearTimeout(hasChangesTimeoutRef.current);
      hasChangesTimeoutRef.current = null;
    }

    if (isQuickEditMode) {
      setIsQuickEditMode(false);
      setEditedData({});
      setValidationErrors({});
      setHasUnsavedChanges(false);
      setNewResponses([]);
      setNewResponseCounter(0);
      setRowEditMode({});
      originalDataRef.current = {};
    } else {
      initializeEditData();
      setIsQuickEditMode(true);
      setTimeout(() => validateData(), 0);
    }
  }, [isQuickEditMode, initializeEditData, validateData]);

  const saveAndExit = useCallback(async () => {
    const success = await saveChanges();
    if (success) {
      setIsQuickEditMode(false);
      setEditedData({});
      setValidationErrors({});
      setHasUnsavedChanges(false);
      setNewResponses([]);
      setNewResponseCounter(0);
      setRowEditMode({});
      originalDataRef.current = {};
    }
  }, [saveChanges]);

  const cancelAndExit = useCallback(() => {
    if (hasChangesTimeoutRef.current) {
      clearTimeout(hasChangesTimeoutRef.current);
      hasChangesTimeoutRef.current = null;
    }

    setEditedData(JSON.parse(JSON.stringify(originalDataRef.current)));
    setValidationErrors({});
    setHasUnsavedChanges(false);
    setIsQuickEditMode(false);
    setEditedData({});
    setNewResponses([]);
    setNewResponseCounter(0);
    setRowEditMode({});
    originalDataRef.current = {};
  }, []);

  return {
    isQuickEditMode,
    editedData,
    validationErrors,
    hasUnsavedChanges,
    forceRenderCounter,
    handleCellValueChange,
    handleLiveValueChange,
    toggleQuickEdit,
    saveAndExit,
    cancelAndExit,
    addNewResponse,
    getCombinedResponses,
    handleRowSelectionChange,
    isRowInEditMode,
    isEditButtonDisabled: isEditButtonDisabled(),
    editButtonDisabledReason: getEditButtonDisabledReason(),
  };
};
