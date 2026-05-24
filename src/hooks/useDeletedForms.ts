import { useCallback, useEffect, useState } from "react";
import { showErrorNotification, showSuccessNotification } from "../utils/utils";
import { Filter, User } from "../utils/interfaces";
import { getForms, restoreForm } from "../api";
import { useSuperAdmin } from "../contexts/SuperAdminContext";
import { DELETED_TABS } from "../utils/recycleBin";
import { getSortedFilter } from "../utils/filters";
import { permission } from "formula-gear";

export interface DeletedFormsFilters {
  deletedBy: string;
  createdBy: string;
  sortValue?: number;
}

export const useDeletedForms = (
  user: User,
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void,
  filters: DeletedFormsFilters,
) => {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSuperAdmin } = useSuperAdmin();

  const fetchDeletedForms = useCallback(async () => {
    setLoading(true);

    const filter: Filter = getSortedFilter(filters.sortValue ?? 7, {
      query: {
        deletedByText: filters.deletedBy?.trim() || undefined,
        createdByText: filters.createdBy?.trim() || undefined,
      },
    });

    filter.onlyDeleted = true;

    try {
      const newForms = await getForms(filter);
      setForms(newForms || []);
    } catch (error: any) {
      if (error?.message !== "canceled") {
        showErrorNotification("שליפת הטפסים נכשלה");
      }
    } finally {
      setLoading(false);
    }
  }, [user.upn, filters, isSuperAdmin]);

  const handleRestoreForm = useCallback(
    async (formId: number) => {
      setLoading(true);
      try {
        const response = await restoreForm(formId);
        if (response) {
          setForms((prev) => prev.filter((form) => form.id !== formId));
          showSuccessNotification("שחזור הטופס בוצע בהצלחה");
          handleTabChange({} as React.SyntheticEvent, DELETED_TABS.FORMS);
        } else {
          showErrorNotification("שחזור הטופס נכשל");
        }
      } catch {
        showErrorNotification("שחזור הטופס נכשל");
      } finally {
        setLoading(false);
      }
    },
    [handleTabChange],
  );

  useEffect(() => {
    fetchDeletedForms();
  }, [fetchDeletedForms]);

  return {
    forms,
    loading,
    handleRestoreForm,
  };
};
