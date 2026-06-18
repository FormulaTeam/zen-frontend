import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "sheetjs-style";
import * as FileSaver from "file-saver";
import moment from "moment";
import { getResponses } from "../api";
import { FieldType, formIcon, permission, Permission } from "formula-gear";
import { fieldType } from "formula-gear";
import {
  CustomFormField,
  FieldTypeIds,
  FieldDataTypes,
  Filter,
  Form,
  FormFieldTypeId,
  FormField,
  FormUser,
  LinkValue,
  LocationValue,
  MultiInputFieldValues,
  NotificationTexts,
  ResponseForm,
  Role,
  RoleId,
  User,
  Row,
} from "./interfaces";

import formX from "../images/form_x.png";
import { FormDto, ResponseDto, ResponseFieldValueDto } from "../types/shared";

export const LIST_NAMES = {
  CONFIG: "drs_config",
  UPDATES: "updates",
  APPS: "applications",
  ORIGINAL_REPORTS: "",
  EVENT_DOCUMENTS: "",
  SUPERVISORS: "",
};

export const BASE_COLUMNS_NAMES_ARRAY = [
  "isSynchronized",
  "pushed_to_metro",
  "updated",
  "updated_by_name",
  "id",
];

export const CHECKBOX_TYPES = {
  EMPTY: 0,
  CHECKED: 1,
};

export const RESPONSE_ACCESS_PERMISSIONS: Permission[] = [
  permission.ReadAnyResponse,
  permission.ReadForm,
  permission.DeleteForm,
  permission.UpdateForm,
  permission.ShareForm,
  permission.SyncForm,
  permission.ExportForm,
];

export const encodeCursor = (index: number, id: string): string => {
  return btoa(JSON.stringify({ index, id }));
};

export type LegacyPermission = Permission;

export const allLegacyPermissions: LegacyPermission[] = Object.values(permission);

export const CREATE_RESPONSE_PERMISSIONS = [permission.CreateResponse];
// human labels for debug/admin UI
export const PERMISSION_LABELS: Record<string, string> = {
  [permission.ReadForm]: "Create form",
  [permission.DeleteForm]: "Delete form",
  [permission.UpdateForm]: "Edit form",
  [permission.ShareForm]: "Share form",
  [permission.SyncForm]: "Sync form",
  [permission.ExportForm]: "Export form",
  [permission.CreateResponse]: "Create response",
  [permission.DeleteAnyResponse]: "Delete response",
  [permission.UpdateAnyResponse]: "Edit response",
  [permission.ReadAnyResponse]: "View any response",
};

export type DecodedCursor = {
  index: number;
  id: string;
};

export const decodeCursor = (cursor: string): DecodedCursor | null => {
  try {
    const decoded = JSON.parse(atob(cursor));

    if (typeof decoded.index !== "number" || typeof decoded.id !== "string") {
      return null;
    }

    return {
      index: decoded.index,
      id: decoded.id,
    };
  } catch {
    return null;
  }
};

export function makePermSet(perms?: number[] | null) {
  return new Set<number>(perms ?? []);
}

export function hasPerm(permsSet: Set<number>, p: Permission) {
  return permsSet.has(p);
}

export const formsTabs = {
  currentUserCreated: 0,
  sharedWithUser: 1,
  allForms: 2,
} as const;

export interface SortOption {
  label: string;
  value: number;
}

export interface UserPickerOption {
  upn: string;
  id: string;
  role_id: number;
}

export const sortByOptions: any[] = [
  { value: 5, label: "מועד יצירה (חדש-ישן)" },
  { value: 6, label: "מועד יצירה (ישן-חדש)" },
  { value: 1, label: "שם הטופס (א-ת)" },
  { value: 2, label: "שם הטופס (ת-א)" },
];

export const permissionsOptions = [
  { value: 1, label: "פומבי (כולם יכולים ליצור תגובות)" },
  { value: 2, label: "כל מי ששותף איתו הטופס" },
  { value: 3, label: "רק למי שאני שיתפתי את הטופס" },
];

import * as MuiIcons from "@mui/icons-material";

export const DEFAULT_ICON_NAME = "grid_view";

export const formIconsNamesMap = new Map<string | number, any>([
  ["grid_view", MuiIcons.GridViewOutlined],
  ["cropsquare", MuiIcons.CropSquareOutlined],
  ["description", MuiIcons.DescriptionOutlined],
  ["table_chart", MuiIcons.TableChartOutlined],
  ["dynamic_form", MuiIcons.DynamicFormOutlined],
  ["dataset", MuiIcons.DatasetOutlined],
  ["article", MuiIcons.ArticleOutlined],
  ["folder_open", MuiIcons.FolderOpenOutlined],
  ["cloud_upload", MuiIcons.CloudUploadOutlined],
  ["language", MuiIcons.LanguageOutlined],
  ["dns", MuiIcons.DnsOutlined],
  ["storage", MuiIcons.StorageOutlined],
  ["schema", MuiIcons.SchemaOutlined],
  ["inventory_2", MuiIcons.Inventory2Outlined],
  ["receipt_long", MuiIcons.ReceiptLongOutlined],
  ["summarize", MuiIcons.SummarizeOutlined],
  ["feed", MuiIcons.FeedOutlined],
  ["view_list", MuiIcons.ViewListOutlined],
  ["fact_check", MuiIcons.FactCheckOutlined],
  ["find_in_page", MuiIcons.FindInPageOutlined],
  ["upload_file", MuiIcons.UploadFileOutlined],
  ["download", MuiIcons.DownloadOutlined],
  ["share", MuiIcons.ShareOutlined],
  ["hub", MuiIcons.HubOutlined],
  ["public", MuiIcons.PublicOutlined],
  ["api", MuiIcons.ApiOutlined],
  ["terminal", MuiIcons.TerminalOutlined],
  ["database", MuiIcons.StorageOutlined],
  ["folder_shared", MuiIcons.FolderSharedOutlined],
  ["snippet_folder", MuiIcons.SnippetFolderOutlined],
  ["web", MuiIcons.WebOutlined],
  ["table_rows", MuiIcons.TableRowsOutlined],
  ["view_column", MuiIcons.ViewColumnOutlined],
  ["list_alt", MuiIcons.ListAltOutlined],
  ["newspaper", MuiIcons.NewspaperOutlined],
  ["source", MuiIcons.SourceOutlined],
  ["library_books", MuiIcons.LibraryBooksOutlined],
  ["file_copy", MuiIcons.FileCopyOutlined],
  ["drive_folder_upload", MuiIcons.DriveFolderUploadOutlined],
  ["cloud_done", MuiIcons.CloudDoneOutlined],
  ["lan", MuiIcons.LanOutlined],
  ["router", MuiIcons.RouterOutlined],
  ["alt_route", MuiIcons.AltRouteOutlined],
  ["account_tree", MuiIcons.AccountTreeOutlined],
  ["integration_instructions", MuiIcons.IntegrationInstructionsOutlined],
  ["code", MuiIcons.CodeOutlined],
  ["data_object", MuiIcons.DataObjectOutlined],
  ["backup", MuiIcons.BackupOutlined],
  ["sync", MuiIcons.SyncOutlined],
  ["search", MuiIcons.SearchOutlined],
  ["travel_explore", MuiIcons.TravelExploreOutlined],
  ["text_snippet", MuiIcons.TextSnippetOutlined],
  ["docs", MuiIcons.ArticleOutlined],
  ["draft", MuiIcons.DraftsOutlined],
  ["note_alt", MuiIcons.NoteAltOutlined],
  ["edit_document", MuiIcons.EditNoteOutlined],
  ["insert_drive_file", MuiIcons.InsertDriveFileOutlined],
  ["request_page", MuiIcons.RequestPageOutlined],
  ["topic", MuiIcons.TopicOutlined],
  ["reorder", MuiIcons.ReorderOutlined],
  ["view_agenda", MuiIcons.ViewAgendaOutlined],
  ["view_stream", MuiIcons.ViewStreamOutlined],
  ["calendar_view_week", MuiIcons.CalendarViewWeekOutlined],
  ["calendar_view_month", MuiIcons.CalendarViewMonthOutlined],
  ["dashboard", MuiIcons.DashboardOutlined],
  ["space_dashboard", MuiIcons.SpaceDashboardOutlined],
  ["widgets", MuiIcons.WidgetsOutlined],
  ["select_all", MuiIcons.SelectAllOutlined],
  ["filter_list", MuiIcons.FilterListOutlined],
  ["sort", MuiIcons.SortOutlined],
  ["rule", MuiIcons.RuleOutlined],
  ["checklist", MuiIcons.ChecklistOutlined],
  ["assignment", MuiIcons.AssignmentOutlined],
  ["assignment_turned_in", MuiIcons.AssignmentTurnedInOutlined],
  ["task", MuiIcons.TaskAltOutlined],
  ["pending_actions", MuiIcons.PendingActionsOutlined],
  ["history", MuiIcons.HistoryOutlined],
  ["manage_search", MuiIcons.ManageSearchOutlined],
  ["saved_search", MuiIcons.SavedSearchOutlined],
  ["content_paste", MuiIcons.ContentPasteOutlined],
  ["content_copy", MuiIcons.ContentCopyOutlined],
  ["archive", MuiIcons.ArchiveOutlined],
  ["unarchive", MuiIcons.UnarchiveOutlined],
  ["folder_zip", MuiIcons.FolderZipOutlined],
  ["create_new_folder", MuiIcons.CreateNewFolderOutlined],
  ["file_download_done", MuiIcons.FileDownloadDoneOutlined],
  ["drive_file_move", MuiIcons.DriveFileMoveOutlined],
  ["cloud_sync", MuiIcons.CloudSyncOutlined],
  ["wifi", MuiIcons.WifiOutlined],
  ["rss_feed", MuiIcons.RssFeedOutlined],
  ["http", MuiIcons.HttpOutlined],
  ["cable", MuiIcons.CableOutlined],
  ["device_hub", MuiIcons.DeviceHubOutlined],
  ["developer_board", MuiIcons.DeveloperBoardOutlined],
  ["memory", MuiIcons.MemoryOutlined],
  ["monitor", MuiIcons.MonitorOutlined],
  ["desktop_windows", MuiIcons.DesktopWindowsOutlined],
  ["open_in_browser", MuiIcons.OpenInBrowserOutlined],
  ["tab", MuiIcons.TabOutlined],
  ["polyline", MuiIcons.PolylineOutlined],
  ["merge_type", MuiIcons.MergeTypeOutlined],
  ["rocket_launch", MuiIcons.RocketLaunchOutlined],
]);

export function getFormIconByName(iconName?: string): any {
  if (!iconName) {
    return formIconsNamesMap.get(DEFAULT_ICON_NAME);
  }

  const normalizedIconName = iconName.trim().toLowerCase();

  return formIconsNamesMap.get(normalizedIconName) ?? formIconsNamesMap.get(DEFAULT_ICON_NAME);
}

export const numberToHebrewLetterMap = new Map<number, string>([
  [1, "א"],
  [2, "ב"],
  [3, "ג"],
  [4, "ד"],
  [5, "ה"],
  [6, "ו"],
  [7, "ז"],
  [8, "ח"],
  [9, "ט"],
  [10, "י"],
  [11, "כ"],
  [12, "ל"],
  [13, "מ"],
  [14, "נ"],
  [15, "ס"],
  [16, "ע"],
  [17, "פ"],
  [18, "צ"],
  [19, "ק"],
  [20, "ר"],
  [21, "ש"],
  [22, "ת"],
]);

export const utmRegex = /^\d{6}$/;

/**
1.Must start with 34. or 31.
2.Must be a positive number
3.Must have exactly 9 digits after the decimal
*/
export const wktLatitudeRegexY = /^\d{2}\.\d+$/;

/**
1.Must start with 29-37 before the decimal
2.Must be a positive number
3.Must have exactly 9 digits after the decimal
*/
export const wktLongitudeRegexX = /^\d{2}\.\d+$/;

/**
 * 1. Must start with 00-23 to represent hours in 24-hour format
 * 2. Must have exactly two digits for minutes (00-59)
 * 3. Can optionally include seconds, which must also be exactly two digits (00-59)
 */
export const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

export function createOneObjFromArr(arr) {
  let oneObj = {};
  arr?.forEach((obj) => (oneObj[obj.Title] = obj.value));
  return oneObj;
}

export function setWebTitleAndFavicon(config) {
  var faviconHTML = document.getElementById("favicon") as HTMLLinkElement | null;
  if (faviconHTML && config && config.favicon) {
    faviconHTML.href = config.favicon;
  }
  var webTitleHTML = document.getElementById("webTabLable") as HTMLSpanElement | null;
  if (webTitleHTML && config && config.webTitle) {
    webTitleHTML.innerHTML = config.webTitle;
  }
}
export const toastSuccess = (msg: string) => toast.success(msg);
export const toastError = (msg: string) => toast.error(msg);
export const toastWarning = (msg: string) => toast.warning(msg);
export const toastInfo = (msg: string) => toast.info(msg);

export function showErrorNotification(error: string, autoCloseTime?: number) {
  toast.error(error + "", {
    duration: autoCloseTime ?? 2500,
  });
}

export function showSuccessNotification(msg: string) {
  toast.success(msg + "", {
    duration: 2500,
  });
}

export function showWarningNotification(msg: string) {
  toast.warning(msg + "", {
    duration: 2500,
  });
}

export function showLoadingNotification(msg: string, icon?: JSX.Element) {
  return toast.loading(msg, {
    icon: icon,
  });
}

export const titleBgStyle = {
  fill: {
    fgColor: { rgb: "E1F0FF" },
    bgColor: { rgb: "E1F0FF" },
  },
  font: {
    color: { rgb: "020618" },
    bold: true,
  },
  border: {
    right: {
      style: "thin",
      color: "000000",
    },
    left: {
      style: "thin",
      color: "000000",
    },
    top: {
      style: "thin",
      color: "000000",
    },
    bottom: {
      style: "thin",
      color: "000000",
    },
  },
  alignment: {
    wrapText: "1",
    vertical: "top",
    horizontal: "right",
    readingOrder: 2,
  },
};

export const cellBorderStyle = {
  border: {
    right: {
      style: "thin",
      color: "000000",
    },
    left: {
      style: "thin",
      color: "000000",
    },
    top: {
      style: "thin",
      color: "000000",
    },
    bottom: {
      style: "thin",
      color: "000000",
    },
  },
  alignment: {
    wrapText: "1",
    vertical: "top",
    horizontal: "right",
    readingOrder: 2,
  },
};
export const cellLinkStyle = {
  font: { color: { rgb: "004175c1" } },
  border: {
    right: {
      style: "thin",
      color: "000000",
    },
    left: {
      style: "thin",
      color: "000000",
    },
    top: {
      style: "thin",
      color: "000000",
    },
    bottom: {
      style: "thin",
      color: "000000",
    },
  },
  alignment: {
    wrapText: "1",
    vertical: "top",
    horizontal: "right",
    readingOrder: 2,
  },
};

export const HEBREW_TITLES = {
  isSynchronized: "סונכרן",
  updated: "השתנה",
  updated_by: 'השתנה ע"י',
};

function preferredOrder(obj, order) {
  var newObject = {};
  for (var i = 0; i < order.length; i++) {
    if (obj.hasOwnProperty(order[i])) {
      newObject[order[i]] = obj[order[i]];
    }
  }
  return newObject;
}

const EXPORT_PAGE_SIZE = 100;

const extractResponsesFromResult = (result: any): ResponseDto[] => {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.edges)) {
    return result.edges.map((edge: any) => edge?.node).filter(Boolean);
  }

  if (Array.isArray(result?.responses)) {
    return result.responses;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  return [];
};

const getPageInfoFromResult = (result: any) => {
  return result?.pageInfo ?? result?.page_info ?? null;
};

export const getResponsesAndExportToExcel = async (form: FormDto) => {
  try {
    const allResponses: ResponseDto[] = [];
    let after: string | undefined = undefined;

    while (true) {
      const result = await getResponses(form.id, {
        form_id: form.id,
        pageSize: EXPORT_PAGE_SIZE,
        after,
        before: undefined,
      });

      const responses = extractResponsesFromResult(result);
      allResponses.push(...responses);

      const pageInfo = getPageInfoFromResult(result);
      const hasNextPage = Boolean(pageInfo?.hasNextPage ?? pageInfo?.has_next_page);
      const endCursor = pageInfo?.endCursor ?? pageInfo?.end_cursor;

      if (!hasNextPage || !endCursor) {
        break;
      }

      after = endCursor;
    }

    if (allResponses.length === 0) {
      showWarningNotification("אין תגובות לייצוא");
      return;
    }

    exportToExcel(allResponses, form);
    showSuccessNotification(NotificationTexts.SuccessfulExportToExcel);
  } catch (error) {
    showErrorNotification(NotificationTexts.FailedExportToExcel);
    console.log(error);
  }
};

/** create excel file with only titles based on the form fields */
export function createExcelMold(form: FormDto) {
  const formFields = (form.sections ?? [])
    .slice()
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .flatMap((section) =>
      [...(section.fields ?? [])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0)),
    );

  const formFieldsIds: string[] = [];
  const data: any[] = [];

  formFields.forEach((field) => {
    formFieldsIds.push(field.id);
  });

  // add column for each field and save fields order with arr of names
  const names: string[] = [];
  formFields.forEach((field) => {
    if (field.fieldType === fieldType.Form) {
      return;
    }

    data[0] = {
      ...data[0],
      [field.displayName]: "",
    };
    names.push(field.displayName);
  });

  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = "xlsx";

  const ws = XLSX.utils.json_to_sheet(data);

  const wb = {
    Sheets: { data: ws },
    SheetNames: ["data"],
    Workbook: {
      Views: [{ RTL: true }],
    },
  };

  const sheet = wb.Sheets[wb.SheetNames[0]];
  const range = XLSX.utils.decode_range(sheet["!ref"]);

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellref = XLSX.utils.encode_cell({ c: C, r: R });

      if (ws[cellref]) {
        if (R === 0) {
          ws[cellref].s = titleBgStyle;
        } else {
          if (ws[cellref] && ws[cellref].f && ws[cellref].f?.includes("=HYPERLINK(")) {
            ws[cellref].s = cellLinkStyle;
          } else {
            ws[cellref].s = cellBorderStyle;
          }
        }
      }

      const cell = sheet[cellref];
      if (cell && !cell.v && !cell.f) {
        ws[cellref].s = cellBorderStyle;
      }
    }
  }

  const excelBuffer = XLSX.write(wb, {
    bookType: fileExtension,
    type: "array",
  });

  const finalData = new Blob([excelBuffer], { type: fileType });
  const name = `${form.name}.${fileExtension}`;
  FileSaver.saveAs(finalData, name);
}

type ExcelExportCell = {
  value: string | number | boolean;
  hyperlink?: string;
};

const RESPONSE_INDEX_COLUMN = "מזהה התגובה";

const SYNC_STATUS_COLUMN = "האם סונכרן למטרו";

const RESPONSE_META_COLUMNS = [
  "נוצר בתאריך",
  "נוצר על ידי",
  "עודכן בתאריך",
  "עודכן על ידי",
] as const;

export function createExcelExport(form: FormDto, rows: Row[] = []) {
  const formFields = (form.sections ?? [])
    .slice()
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .flatMap((section) =>
      [...(section.fields ?? [])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0)),
    )
    .filter((field) => field.fieldType !== fieldType.Form);

  const fieldHeaders = formFields.map((field) => field.displayName);
  const headers = [SYNC_STATUS_COLUMN, ...fieldHeaders, ...RESPONSE_META_COLUMNS];

  const sortedRows = [...rows].sort((a, b) => getRowIndex(a) - getRowIndex(b));

  const dataRows = sortedRows.map((row) => {
    const fieldCells = formFields.map((field) =>
      formatExcelExportCell(row[`field:${field.id}`] ?? row[field.id]),
    );

    const metaCells: ExcelExportCell[] = [
      { value: formatDateValue(row.created) },
      { value: safeString(row.createdByName) },
      { value: formatDateValue(row.edited) },
      { value: safeString(row.editedByName) },
    ];

    const syncStatusCell: ExcelExportCell = { value: "לא סונכרן" };
    // row.pushed_to_metro ? "סונכרן" : "לא סונכרן";

    return [syncStatusCell, ...fieldCells, ...metaCells];
  });

  const sheetData = [headers, ...dataRows.map((row) => row.map((cell) => cell.value))];

  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = "xlsx";

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  dataRows.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (!cell.hyperlink) return;

      const cellRef = XLSX.utils.encode_cell({
        r: rowIndex + 1,
        c: columnIndex,
      });

      if (!ws[cellRef]) return;

      ws[cellRef].l = {
        Target: cell.hyperlink,
        Tooltip: cell.hyperlink,
      };

      ws[cellRef].s = cellLinkStyle;
    });
  });

  const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1");

  Array.from({ length: range.e.r - range.s.r + 1 }).forEach((_, rowOffset) => {
    const rowIndex = range.s.r + rowOffset;

    Array.from({ length: range.e.c - range.s.c + 1 }).forEach((__, columnOffset) => {
      const columnIndex = range.s.c + columnOffset;
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });

      if (!ws[cellRef]) {
        ws[cellRef] = { t: "s", v: "" };
      }

      if (rowIndex === 0) {
        ws[cellRef].s = titleBgStyle;
        return;
      }

      if (!ws[cellRef].s) {
        ws[cellRef].s = cellBorderStyle;
      }
    });
  });

  ws["!cols"] = headers.map(() => ({ wch: 24 }));

  const wb = {
    Sheets: { data: ws },
    SheetNames: ["data"],
    Workbook: {
      Views: [{ RTL: true }],
    },
  };

  const excelBuffer = XLSX.write(wb, {
    bookType: fileExtension,
    type: "array",
  });

  const finalData = new Blob([excelBuffer], { type: fileType });
  const name = `${form.name}-תגובות.${fileExtension}`;

  FileSaver.saveAs(finalData, name);
}

const getRowIndex = (row: Row): number => {
  const value = row.index;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const formatExcelExportCell = (value: unknown): ExcelExportCell => {
  if (value === undefined || value === null) {
    return { value: "" };
  }

  if (typeof value === "boolean") {
    return { value: value ? "כן" : "לא" };
  }

  if (typeof value === "string" || typeof value === "number") {
    return { value };
  }

  if (value instanceof Date) {
    return { value: formatDateValue(value) };
  }

  if (Array.isArray(value)) {
    return {
      value: value
        .map((item) => formatExcelExportCell(item).value)
        .filter((item) => item !== "")
        .join(", "),
    };
  }

  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;

    if (typeof objectValue.link === "string" && objectValue.link.trim()) {
      return {
        value:
          typeof objectValue.linkTxt === "string" && objectValue.linkTxt.trim()
            ? objectValue.linkTxt.trim()
            : objectValue.link.trim(),
        hyperlink: normalizeHyperlink(objectValue.link),
      };
    }

    if (objectValue.x !== undefined && objectValue.y !== undefined) {
      return {
        value: `${safeString(objectValue.x)}, ${safeString(objectValue.y)}`,
      };
    }

    if (Array.isArray(objectValue.files)) {
      return {
        value: objectValue.files
          .map((file) => {
            if (!file || typeof file !== "object") return "";

            const fileValue = file as Record<string, unknown>;

            return safeString(fileValue.name ?? fileValue.fileName);
          })
          .filter(Boolean)
          .join(", "),
      };
    }

    if (typeof objectValue.text === "string") {
      return { value: objectValue.text };
    }
  }

  return { value: safeString(value) };
};

const normalizeHyperlink = (value: string): string => {
  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const formatDateValue = (value: unknown): string => {
  if (!value) return "";

  const date =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("he-IL");
};

const safeString = (value: unknown): string => {
  if (value === undefined || value === null) return "";

  return String(value);
};

/** there are old forms and responses without fieldType in DB. need to have one so date will work. can know it by the typeId */
export function getFieldType(field: FormField) {
  if (field.fieldType) {
    return field.fieldType;
  } else if (field.typeId) {
    switch (field.typeId) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 6:
      case FieldTypeIds.list:
        return "string";
      case 5:
        return "Date";
      default:
        break;
    }
  }
}

export function exportToExcel(responsesArr: ResponseDto[], form: FormDto) {
  // Sort responses by index in ascending order to maintain consistent order
  const sortedResponses = [...responsesArr].sort((a, b) => (a.index || 0) - (b.index || 0));

  const formFields = (form.sections ?? [])
    .slice()
    .sort((a, b) => a.index - b.index)
    .flatMap((section) => (section.fields ?? []).slice().sort((a, b) => a.index - b.index));

  const formFieldsIds: string[] = [];
  const data: any[] = [];

  sortedResponses.forEach((element, i) => {
    //add columns isSynchronized, updated_by, updated
    data[i] = {
      [RESPONSE_INDEX_COLUMN]: element.index ? `\u202B${String(element.index)}\u202C` : "",
      [HEBREW_TITLES.updated_by]: element.updatedBy?.name ?? "",
      [HEBREW_TITLES.updated]: moment(element.updatedAt).format("DD.MM.YY"),
    };

    //add column for each field and save fields order with arr of names
    const names: string[] = [];
    formFields.forEach((field) => {
      if (field.fieldType === fieldType.Form) {
        return;
      }

      data[i] = {
        ...data[i],
        [field.displayName]: "",
      };
      names.push(field.displayName);
    });

    //get column with order (first isSynchronized, then fields. then updated_by, then updated)
    data[i] = preferredOrder(
      data[i],
      [RESPONSE_INDEX_COLUMN]
        .concat([HEBREW_TITLES.isSynchronized])
        .concat(names)
        .concat([HEBREW_TITLES.updated_by, HEBREW_TITLES.updated]),
    );
  });

  formFields.forEach((field) => {
    if (field.fieldType === fieldType.Form) {
      // If the field is of type 'form', we skip it as it doesn't have a value in the response
      return;
    }

    formFieldsIds.push(field.id);
  });

  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = "xlsx";

  sortedResponses.forEach((element, i) => {
    if (element) {
      const fieldValuesWithMetaData = (element.fieldValues ?? []).reduce<
        Array<
          ResponseFieldValueDto & {
            displayName: string;
            fieldType: FieldType;
            dateType?: "date" | "datetime";
            timePrecision?: "seconds" | "minutes";
          }
        >
      >((acc, item) => {
        const currentFieldMetaData = formFields.find((fieldData) => fieldData.id === item.fieldId);

        if (currentFieldMetaData) {
          const extra = (currentFieldMetaData.extra || {}) as {
            dateType?: "date" | "datetime";
            timePrecision?: "seconds" | "minutes";
          };
          const { displayName, fieldType: currentFieldType } = currentFieldMetaData;

          acc.push({
            displayName,
            value: item.value,
            fieldId: item.fieldId,
            dateType: (currentFieldMetaData as any).dateType || extra.dateType,
            timePrecision: (currentFieldMetaData as any).timePrecision || extra.timePrecision,
            fieldType: currentFieldType as FieldType,
          });
        }

        return acc;
      }, []);

      for (const {
        displayName,
        fieldType: currentFieldType,
        value,
        fieldId,
        dateType,
        timePrecision,
      } of fieldValuesWithMetaData) {
        if (formFieldsIds.includes(fieldId || "")) {
          let formattedValue: string | { f: string } = "";

          if (currentFieldType === fieldType.Form) {
            // If the field is of type 'form', we skip it as it doesn't have a value in the response
            continue;
          }

          if (isNullish(value)) {
            data[i][displayName] = formattedValue;
            continue;
          }

          switch (currentFieldType) {
            case fieldType.LongText:
              formattedValue = value as string;
              break;

            case fieldType.ShortText:
              formattedValue = value as string;
              break;

            case fieldType.Options:
              if (Array.isArray(value)) {
                formattedValue = value.map((option) => (option as { text: string }).text).join(",");
              } else {
                formattedValue = (value as { text: string }).text;
              }
              break;

            case fieldType.Link: {
              const linkValue = value as LinkValue;
              formattedValue = {
                f: '=HYPERLINK("' + linkValue.link + `","${linkValue.linkTxt}")`,
              };
              break;
            }

            case fieldType.Date: {
              const dateValue = value as string;
              const isValidDate = moment(dateValue).isValid();

              if (!isValidDate) {
              } else if (dateType === "datetime") {
                formattedValue = moment(dateValue).format(DEFAULT_DATE_TIME_FORMAT);
              } else {
                formattedValue = moment(dateValue).format(DEFAULT_DATE_FORMAT);
              }
              break;
            }

            case fieldType.Time: {
              const timeValue = value as string;
              const format = timePrecision === "seconds" ? "HH:mm:ss" : "HH:mm";

              // If it's already in the correct format, use it directly
              if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(timeValue)) {
                if (timePrecision === "minutes" && timeValue.split(":").length === 3) {
                  formattedValue = timeValue.substring(0, 5);
                } else {
                  formattedValue = timeValue;
                }
              } else if (value instanceof Date) {
                // If it's a Date object, format it
                const timeMoment = moment(value);
                formattedValue = timeMoment.format(format);
              }
              break;
            }

            case fieldType.Location: {
              const locationValue = value as LocationValue;
              formattedValue = locationValue.x + "," + locationValue.y;
              break;
            }

            case fieldType.Number:
              formattedValue = String(value);
              break;

            case fieldType.Boolean:
              if (value === false) formattedValue = "לא";
              if (value === true) formattedValue = "כן";
              break;

            case fieldType.List: {
              const multiInputFieldValue = value as MultiInputFieldValues;
              formattedValue = multiInputFieldValue.join(";");
              break;
            }

            default:
              formattedValue = "";
          }

          data[i][displayName] = formattedValue;
        }
      }
    }
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = {
    Sheets: { data: ws },
    SheetNames: ["data"],
    Workbook: {
      Views: [{ RTL: true }],
    },
  };

  var sheet = wb.Sheets[wb.SheetNames[0]]; // get the first worksheet
  var range = XLSX.utils.decode_range(sheet["!ref"]); // get the range
  for (var R = range.s.r; R <= range.e.r; ++R) {
    for (var C = range.s.c; C <= range.e.c; ++C) {
      /* find the cell object */
      var cellref = XLSX.utils.encode_cell({ c: C, r: R }); // construct A1 reference for cell
      if (ws[cellref]) {
        if (R === 0) {
          //first row set titles style
          ws[cellref].s = titleBgStyle;
        } else {
          if (ws[cellref] && ws[cellref].f && ws[cellref].f?.includes("=HYPERLINK(")) {
            //היפר-קישור
            ws[cellref].s = cellLinkStyle;
          } else {
            //other rows set cell style
            ws[cellref].s = cellBorderStyle;
          }
        }
      }
      var cell = sheet[cellref];
      if (cell && !cell.v && !cell.f) {
        //empty cell (no value and no function) set cell style or it will be without border
        ws[cellref].s = cellBorderStyle;
      }
    }
  }

  const excelBuffer = XLSX.write(wb, {
    bookType: fileExtension,
    type: "array",
  });
  const finalData = new Blob([excelBuffer], { type: fileType });
  const name = `${form.name}.${fileExtension}`;
  FileSaver.saveAs(finalData, name);
}

/**
 * Checks if the given payload exceeds the specified maximum size in megabytes.
 *
 * This function calculates the size of the serialized payload by converting it to a JSON string,
 * wrapping it in a `Blob`, and determining its size in bytes. The size is then converted to megabytes
 * and compared against the provided maximum size.
 *
 * @param {unknown} data - The payload to check. This can be any value that can be serialized into JSON.
 * @param {number} maxSize - The maximum allowable size in megabytes.
 * @returns {boolean} `true` if the payload size exceeds the specified maximum size, `false` otherwise.
 *
 * @example
 * const payload = { name: "John", age: 30 };
 * const maxSize = 1; // 1 MB
 * const result = checkIsPayloadExceedingMaxSize(payload, maxSize);
 * console.log(result); // Output: false if payload is under 1 MB
 */
export function checkIsPayloadExceedingMaxSize(data: unknown, maxSize: number): boolean {
  const size = new Blob([JSON.stringify(data)]).size;
  const sizeInMb = size / 1024 / 1024;
  return sizeInMb > maxSize;
}

export const DEFAULT_DATE_FORMAT = "DD/MM/YYYY";
export const DEFAULT_DATE_TIME_FORMAT = `${DEFAULT_DATE_FORMAT} HH:mm`;

/**
 * Converts an Excel date number to a formatted date string.
 *
 * If the input is a number (Excel date), it calculates the corresponding date
 * based on the Unix epoch adjusted for Excel's date system (starting from 1899-12-30)
 * and formats it as a UTC string.
 * If the input is not a number, it simply returns the input value.
 *
 * @param {number} date - The input value to convert. Should be a number representing an Excel date or a string.
 * @returns {string} - The converted date string in "DD/MM/YYYY" format if the input is a number,
 * or the original value if it's not a number.
 */
export function dateNumberToDateString(
  date: number | string,
  dateType?: "date" | "datetime",
): string {
  const formatString = dateType === "datetime" ? DEFAULT_DATE_TIME_FORMAT : DEFAULT_DATE_FORMAT;
  return typeof date === "number"
    ? moment.utc(moment.unix(Math.round((date - 25569) * 86400))).format(formatString)
    : date;
}

/**
 * Validates whether a given value is a supported date type.
 * Supported types:
 * - Excel date (number)
 * - Date string
 *
 * @param {number|string} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a valid date type, otherwise false.
 */
export function validateDateType(value: any): boolean {
  // Check if the val is a number (Excel date)
  if (typeof value === "number") {
    return true;
  }

  // Check if the val is a string
  if (typeof value === "string") {
    return true;
  }

  return false;
}

export function getUserName(firstName: string, lastName: string) {
  if (firstName && lastName) {
    return firstName + " " + lastName;
  }
  return "";
}

export function isNullish(val: unknown) {
  return val === null || val === undefined;
}

export function isArrayWithMoreThanOneElement<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 1;
}

export function generateNewFormFieldData(item: Partial<CustomFormField>) {
  const uniqueId = uuidv4();
  const newField: FormField = {
    uniqueId,
    name: "",
    displayName: "",
    typeId: item.typeId as FormFieldTypeId,
    required: false,
    fieldType: item.fieldType || FieldDataTypes.string,
    index: 0,
    // would have make more sense to use item.displayName over item.name but,
    // for default formfields, name is the only property that avaliable so we use it.
    fieldName: item.name,
    fieldIcon: item.icon,
    ...(item.validationRegex && { validationRegex: item.validationRegex }),
    ...(!isNullish(item.shouldSyncToMetro) && { shouldSyncToMetro: item.shouldSyncToMetro }),
    sectionId: item.sectionId ?? "",
    sectionName: item.sectionName ?? "",
    sectionDescription: item.sectionDescription ?? "",
    sectionOrder: item.sectionId && item.sectionOrder ? item.sectionOrder : 0,
  };

  if (item.typeId === FieldTypeIds.options) {
    newField.options = ["", ""];
  }

  if (item.typeId === FieldTypeIds.location) {
    newField.locationFormat = "utm";
  }

  return newField;
}

export function getUserRole(
  formUsers: FormUser[] | undefined,
  currentUser: User,
  isSuperAdmin: boolean | null,
  fullAccessRoleId: RoleId | null,
) {
  if (isSuperAdmin && fullAccessRoleId) return fullAccessRoleId;

  const permittedUser = (formUsers || []).find(
    (u) => u.upn?.toLowerCase() === currentUser?.upn?.toLowerCase(),
  );

  if (permittedUser) {
    return permittedUser.role_id;
  }

  throw new Error("User has no role for the form");
}

export function checkUserAccessForResponse(
  roles: Role[],
  viewMode: boolean,
  response: ResponseForm | null,
  form: Form,
  user: User,
  isSuperAdmin: boolean | null = null,
) {
  try {
    const fullAccessRole = roles.find(
      (role) => role.permission_types.length === Object.keys(permission).length,
    );

    const userRole = getUserRole(form.users, user, !!isSuperAdmin, fullAccessRole?.role_id || null);

    const roleObj = roles.find((r) => r.role_id === userRole);
    const permissionTypes = roleObj?.permission_types || [];

    if (response?.id && !viewMode) {
      // if response exists and not in view mode, check for roles
      const hasPermissionForResponse = permissionTypes.some((type) =>
        RESPONSE_ACCESS_PERMISSIONS.includes(type as Permission),
      );
      if (!hasPermissionForResponse) {
        return false;
      }
    } else if (!response?.id && !viewMode) {
      // if its a new response and not in view mode, check for roles
      const hasPermissionToCreateResponse = permissionTypes.some(
        (type) => permission.CreateResponse === type,
      );
      if (!hasPermissionToCreateResponse) {
        return false;
      }
    }
    return true; // user has access to the response
  } catch (error) {
    return false; // getUserRole throws error if the user has no roles for the form
  }
}

export function validateByRegex(value: string, regex: string) {
  const regexValidator = new RegExp(regex);
  return regexValidator.test(value);
}

export const preventEnterKeyNavigation = (
  event: React.KeyboardEvent,
  allowEnter: boolean = false,
) => {
  if (event.key === "Enter") {
    event.stopPropagation();
    if (!allowEnter) {
      event.preventDefault();
    }
  }
};

// using TextDecoder to interpret the bytes as UTF‑8 to display the correct characters
export function decodeFileName(fileName: string) {
  const bytes = new Uint8Array(fileName.split("").map((char) => char.charCodeAt(0)));
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(bytes);
}

//a function to determine if an object is empty
export function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

//a function to determine if aomething is an empty object
export function isEmptyObject(value) {
  if (value == null) {
    // null or undefined
    return false;
  }

  if (typeof value !== "object") {
    // boolean, number, string, function, etc.
    return false;
  }

  const proto = Object.getPrototypeOf(value);

  if (proto !== null && proto !== Object.prototype) {
    return false;
  }

  return isEmpty(value);
}

export function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

export const isOnlyBlankStrings = (arr: string[] | undefined | null): boolean => {
  if (!arr || arr.length === 0) return true;
  return arr.every((val) => typeof val === "string" && val.trim() === "");
};

/**
 * Creates initial new form structure for form creation
 * @param currentUser - The current user object
 * @param title - Optional title for the form (empty string for new forms)
 * @param description - Optional description for the form (empty string for new forms)
 * @returns Initial form object structure
 */
export const getInitialNewForm = (
  currentUser: any,
  title: string = "",
  description: string = "",
) => {
  return {
    name: title,
    description: description,
    icon: DEFAULT_ICON_NAME,
    fields: [],
    parentFieldId: undefined,
  };
};
