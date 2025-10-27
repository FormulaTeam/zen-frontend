import { FormField } from "../types/interfaces/tableViews.types";
import { FORM_ELEMENTS } from "../utils/interfaces";

// System columns meta (not part of form.fields)
const SYSTEM_COLUMNS_META: Record<string, { displayName: string; type: string }> = {
  id: { displayName: "מזהה", type: "מספר" },
  pushed_to_metro: { displayName: "סטטוס סנכרון", type: "מערכת" },
  edited: { displayName: "השתנה", type: "תאריך" },
  edited_by_name: { displayName: "השתנה ע\"י", type: "טקסט" },
};

interface UseViewFieldHelpersProps {
  form?: {
    fields: FormField[];
  };
}

interface UseViewFieldHelpersReturn {
  getFieldDisplayName: (columnId: string) => string;
  getFieldType: (columnId: string) => string;
}

export const useViewFieldHelpers = ({
  form,
}: UseViewFieldHelpersProps): UseViewFieldHelpersReturn => {
  const getFieldDisplayName = (columnId: string): string => {
    const field = form?.fields?.find((f: FormField) => f.uniqueId === columnId);
    if (field) return field.displayName || field.name || columnId;
    // Fallback for system columns
    return SYSTEM_COLUMNS_META[columnId]?.displayName || columnId;
  };

  const getFieldType = (columnId: string): string => {
    const field = form?.fields?.find((f: FormField) => f.uniqueId === columnId);
    if (field) {
      const defaultField = FORM_ELEMENTS[(field as any).typeId];

      return defaultField?.name || field.fieldType || "לא ידוע";
    }
    // System column type
    return SYSTEM_COLUMNS_META[columnId]?.type || "מערכת";
  };

  return {
    getFieldDisplayName,
    getFieldType,
  };
};
