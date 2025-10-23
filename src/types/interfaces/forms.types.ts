import { RESERVED_FIELD_NAMES } from "../../consts/form";

export interface UserData {
  upn: string;
  userName: string;
}

export interface ErrorMessageType {
  key: string;
  message: string;
  fieldId: string;
}

export type ReservedFieldName = (typeof RESERVED_FIELD_NAMES)[number];

/**
 * Enum for Excel import processing status
 */
export enum ExcelImportStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  PARTIALLY_COMPLETED = "partially_completed",
}

/**
 * Interface for Excel import validation error
 */
export interface ExcelImportValidationError {
  /** Excel row number where error occurred (1-indexed) */
  row_number: number;
  /** Field name that caused the error */
  field_name: string;
  /** Error message in Hebrew */
  error_message: string;
  /** The actual value that caused the error */
  invalid_value?: string;
  /** Type of validation error */
  error_type: string;
}

/**
 * Interface for Excel import progress/status
 */
export interface ExcelImportProgress {
  /** Unique identifier for this import operation */
  import_id: string;
  /** Current status of the import operation */
  status: ExcelImportStatus;
  /** Number of Excel rows processed so far */
  processed_rows: number;
  /** Total number of rows to process */
  total_rows: number;
  /** Number of responses successfully created */
  successful_imports: number;
  /** Number of rows that failed validation/import */
  error_count: number;
  /** List of validation errors (limited to first 1000) */
  validation_errors?: ExcelImportValidationError[];
  /** General error message if import failed completely */
  general_error?: string;
  /** Timestamp when import started */
  started_at: string;
  /** Timestamp when import completed (if finished) */
  completed_at?: string;
  /** Form ID that responses are being imported into */
  form_id: number;
  /** UPN of user who initiated the import */
  imported_by: string;
  /** Original filename of the imported Excel file */
  filename: string;
  /** Calculate completion percentage */
  completion_percentage: number;
}

/**
 * Interface for Excel import final results
 */
export interface ExcelImportResult extends ExcelImportProgress {
  /** Array of response IDs that were successfully created */
  created_response_ids: number[];
  /** Download link for detailed error report (if errors exist) */
  error_report_url?: string;
  /** Download link for success report */
  success_report_url?: string;
  /** Total processing time in milliseconds */
  processing_time_ms: number;
  /** Get processing time in seconds */
  processing_time_seconds: number;
  /** Get success rate percentage */
  success_rate_percentage: number;
}
