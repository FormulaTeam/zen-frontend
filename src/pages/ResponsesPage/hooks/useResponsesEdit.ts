import { useState } from "react";
import { GridRowModel } from "@mui/x-data-grid-pro";
import { showSuccessNotification, showErrorNotification } from "../../../utils/utils";
import { useBatchUpdateResponses, useGetResponses } from "../../../api/responsesApi";
import { useFormStore } from "../stores/form.store";
import { useAuth } from "../../../contexts/AuthContext";
import { ResponseFieldValue, Row } from "../../../utils/interfaces";
import {
  CustomError,
  NoUnsavedChangesError,
  NoResponsesFoundError,
  FormNotLoadedError,
  NoValidChangesError,
  SaveFailedError,
} from "../../../errors";

export const useResponsesEdit = () => {
  const { form, rows, setRows, filter } = useFormStore();
  const { user } = useAuth();

  const [isInEditMode, setIsInEditMode] = useState(false);

  const [editedRows, setEditedRows] = useState<Map<number, Row>>(new Map());
  const [localRows, setLocalRows] = useState<Row[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);


  const { data: fullResponses } = useGetResponses({
    filter: { ...filter, form_id: form?.id },
  });

  const { mutateAsync: batchUpdateResponses, isPending: isUpdating } = useBatchUpdateResponses({
    formId: form?.id || 0,
  });

  const responseRows: Row[] = rows?.filter((row) => row != null) || [];
  const hasUnsavedChanges: boolean = editedRows.size > 0;

  const toggleEditMode = (): void => {
    if (isInEditMode && hasUnsavedChanges) {
      setShowCancelDialog(true);

    } else {
      const nextEditMode: boolean = !isInEditMode;

      setIsInEditMode(nextEditMode);
      setEditedRows(new Map());
      setLocalRows(nextEditMode ? [...responseRows] : responseRows);
    }
  };

  const confirmCancel = (): void => {
    setEditedRows(new Map());
    setLocalRows(responseRows);
    setIsInEditMode(false);
    setShowCancelDialog(false);
  };

  const closeCancelDialog = (): void => {
    setShowCancelDialog(false);
  };

  const startCellEdit = (): void => {
    if (!isInEditMode) {
      setIsInEditMode(true);
      setLocalRows([...responseRows]);
    }
  };

  const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel): GridRowModel => {
    const newRowId: number = newRow.id

    if (Number.isNaN(newRowId)) {
      return newRow;
    }

    setLocalRows((prevRows: Row[]) =>
      prevRows.map((row: Row) => row?.id === newRowId ? ({ ...row, ...newRow }) : row)
    );

    setEditedRows((prevEditedRows: Map<number, Row>) => new Map(prevEditedRows).set(newRowId, newRow as Row));

    return newRow;
  };


  const buildResponseUpdatePayload = (rowId: number, editedRow: Partial<Row>) => {
    const original = fullResponses?.find((r) => Number(r?.id) === rowId);
    if (!original) {
      return null;
    }

    const columnToUniqueId = new Map<string, string>();
    form?.columns?.forEach((col: any) => {
      const matchingField = form.fields?.find(
        (field) => field.displayName === col.field || field.name === col.field
      );
      if (matchingField?.uniqueId) {
        columnToUniqueId.set(col.field, matchingField.uniqueId);
      }
    });

    const updatedData: ResponseFieldValue[] = original.data.map((field) => {
      const columnField = Array.from(columnToUniqueId.entries())?.find(
        ([_, uid]) => uid === field.uniqueId
      )?.[0];

      if (columnField && editedRow.hasOwnProperty(columnField)) {
        return { ...field, value: editedRow[columnField] };
      }
      return field;
    });

    return {
      id: rowId,
      responseData: {
        ...original,
        data: updatedData,
        edited_by: user?.upn?.toLowerCase() || original.edited_by,
        edited_by_name: user?.displayName || original.edited_by_name,
      },
    };
  };


  const saveChanges = async (): Promise<void> => {
    try {
      if (!hasUnsavedChanges) {
        throw new NoUnsavedChangesError();
      }
      if (!fullResponses?.length) {
        throw new NoResponsesFoundError();
      }
      if (!form) {
        throw new FormNotLoadedError();
      }

      const updatesToSend = Array.from(editedRows.entries())
        .map(([rowId, editedRow]) => buildResponseUpdatePayload(rowId, editedRow))
        .filter((updatedRow) => updatedRow !== null);

      if (updatesToSend.length === 0) {
        throw new NoValidChangesError();
      }

      await batchUpdateResponses(updatesToSend as any);

      setRows(localRows);
      setEditedRows(new Map());
      setIsInEditMode(false);

      showSuccessNotification(`נשמרו ${editedRows.size} שינויים בהצלחה!`);
    } catch (error) {
      if (error instanceof CustomError) {
        if (error instanceof NoUnsavedChangesError) {
          showSuccessNotification(error.message);
        } else {
          showErrorNotification(error.message);
        }
      } else {
        console.error("Error saving changes:", error);
        showErrorNotification(new SaveFailedError().message);
      }
    }
  };

  return {
    isInEditMode,
    editedRowsCount: editedRows.size,
    localRows,
    isUpdating,
    showCancelDialog,
    handleToggleEditMode: toggleEditMode,
    handleCellEditStart: startCellEdit,
    handleProcessRowUpdate: processRowUpdate,
    handleSaveChanges: saveChanges,
    handleConfirmCancel: confirmCancel,
    handleCancelDialogClose: closeCancelDialog,
  };
};
