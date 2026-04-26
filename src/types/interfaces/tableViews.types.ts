export interface ResponsesViewColumn {
  id?: string | number;
  viewId?: string | number;
  fieldId?: string | null; // UUID for dynamic fields
  metaColumnId?: number | null; // index, created_at, updated_at, created_by, updated_by
  displayName?: string;
  isVisible: boolean;
  index: number; // Horizontal ordering
}

/**
 * @deprecated Use ResponsesViewColumn instead where possible
 */
export interface ViewColumn {
  id?: string | number;
  columnId: string; // "field:<UUID>" or "meta:<KEY>"
  displayName?: string;
  visible: boolean;
  order: number;
  sortDirection?: "asc" | "desc";
  sortOrder?: number; // Always 1 for single-column sorting
}

export interface ViewConfig {
  columns: ViewColumn[];
}

export interface ResponsesView {
  id?: string | number; // UUID or numeric sequence ID from backend
  formId: string; // Form this view belongs to
  name: string; // Not globally unique, but must be unique per formId
  createdBy: string | { name: string; upn: string }; // User upn or object
  createdByName?: string; // User display name
  isPublic: boolean; // true = visible to all users
  isDefault: boolean; // true = auto-applied for this form
  columns: ResponsesViewColumn[];
  sortColumnId?: string | number | null; // Points to a specific ResponsesViewColumn.id
  sortDirection: "asc" | "desc";
  config?: ViewConfig; // Legacy config support
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FormField {
  uniqueId: string;
  name: string;
  displayName: string;
  required: boolean;
  index: number;
  fieldType: string;
  visible?: boolean;
  order?: number;
}

export interface FormViewFilter {
  formId?: string;
  createdBy?: string;
  isPublic?: boolean;
  isDefault?: boolean;
  query?: any;
  sortBy?: string;
  orderBy?: "ASC" | "DESC";
  pageSize?: number;
  pageNumber?: number;
}
