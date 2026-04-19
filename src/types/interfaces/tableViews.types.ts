export interface ViewColumn {
  columnId: string;
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
  config: ViewConfig;
  createdAt: Date;
  updatedAt: Date;
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
