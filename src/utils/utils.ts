import { Slide, toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "sheetjs-style";
import * as FileSaver from "file-saver";
import moment from "moment";
import { getResponses, searchResponses } from "../api";
import { FieldType, formIcon } from "formula-gear";
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
  ResponseFieldValue,
  ResponseForm,
  Role,
  RoleId,
  User,
} from "./interfaces";

import examDefault from "../images/examDefault.png";
import binoculars from "../images/binoculars.png";
import car from "../images/car.png";
import check from "../images/check.png";
import contract from "../images/contract.png";
import file from "../images/file.png";
import group from "../images/group.png";
import hourGlass from "../images/hour-glass.png";
import idea from "../images/idea.png";
import magnifyingGlass from "../images/magnifying-glass.png";
import militaryHat from "../images/military-hat.png";
import pen from "../images/pen.png";
import programmer from "../images/programmer.png";
import searching from "../images/searching.png";
import smile from "../images/smile.png";
import soccerBall from "../images/soccer-ball-variant.png";
import soldier from "../images/soldier.png";
import tank from "../images/tank.png";
import target from "../images/target.png";
import user from "../images/user.png";
import doc from "../images/doc.png";
import jpg from "../images/jpg.png";
import pdf from "../images/pdf.png";
import png from "../images/png.png";
import ppt from "../images/ppt.png";
import txt from "../images/txt.png";
import xls from "../images/xls.png";
import formX from "../images/form_x.png";
import { FormDto, ResponseDto, ResponseFieldValueDto } from "../types/shared";
import { fieldType } from "formula-gear";

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

export const PERMISSION_TYPES = {
  CREATE_FORM: 1,
  DELETE_FORM: 2,
  EDIT_FORM: 3,
  SHARE_FORM: 4,
  SYNC_FORM: 5,
  EXPORT_FORM: 6,

  CREATE_RESPONSE: 7,
  DELETE_RESPONSE: 8,
  EDIT_RESPONSE: 9,
  VIEW_RESPONSE: 10,
  VIEW_YOUR_RESPONSES: 11,
};

export const RESPONSE_ACCESS_PERMISSIONS = [
  PERMISSION_TYPES.VIEW_RESPONSE,
  PERMISSION_TYPES.CREATE_FORM,
  PERMISSION_TYPES.DELETE_FORM,
  PERMISSION_TYPES.EDIT_FORM,
  PERMISSION_TYPES.SHARE_FORM,
  PERMISSION_TYPES.SYNC_FORM,
  PERMISSION_TYPES.EXPORT_FORM,
];

export type LegacyPermission = (typeof PERMISSION_TYPES)[keyof typeof PERMISSION_TYPES];

export const allLegacyPermissions: LegacyPermission[] = Object.values(PERMISSION_TYPES);

export const CREATE_RESPONSE_PERMISSIONS = [PERMISSION_TYPES.CREATE_RESPONSE];
// human labels for debug/admin UI
export const PERMISSION_LABELS: Record<LegacyPermission, string> = {
  [PERMISSION_TYPES.CREATE_FORM]: "Create form",
  [PERMISSION_TYPES.DELETE_FORM]: "Delete form",
  [PERMISSION_TYPES.EDIT_FORM]: "Edit form",
  [PERMISSION_TYPES.SHARE_FORM]: "Share form",
  [PERMISSION_TYPES.SYNC_FORM]: "Sync form",
  [PERMISSION_TYPES.EXPORT_FORM]: "Export form",
  [PERMISSION_TYPES.CREATE_RESPONSE]: "Create response",
  [PERMISSION_TYPES.DELETE_RESPONSE]: "Delete response",
  [PERMISSION_TYPES.EDIT_RESPONSE]: "Edit response",
  [PERMISSION_TYPES.VIEW_RESPONSE]: "View any response",
  [PERMISSION_TYPES.VIEW_YOUR_RESPONSES]: "View your own responses",
};

export function makePermSet(perms?: number[] | null) {
  return new Set<number>(perms ?? []);
}

export function hasPerm(permsSet: Set<number>, p: LegacyPermission) {
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
  { value: 1, label: "שם הטופס א-ת" },
  { value: 2, label: "שם הטופס ת-א" },
  { value: 5, label: "טפסים שנוצרו מהחדש לישן" },
  { value: 6, label: "טפסים שנוצרו מהישן לחדש" },
];

export const permissionsOptions = [
  { value: 1, label: "פומבי (כולם יכולים ליצור תגובות)" },
  { value: 2, label: "כל מי ששותף איתו הטופס" },
  { value: 3, label: "רק למי שאני שיתפתי את הטופס" },
];

export const DEFAULT_ICON_NAME = formIcon.FormX;

export const formIconsNamesMap = new Map<string | number, any>([
  [formIcon.FormX, formX],
  [formIcon.ExamDefault, examDefault],
  [formIcon.Binoculars, binoculars],
  [formIcon.Car, car],
  [formIcon.Check, check],
  [formIcon.Contract, contract],
  [formIcon.File, file],
  [formIcon.Group, group],
  [formIcon.HourGlass, hourGlass],
  [formIcon.Idea, idea],
  [formIcon.MagnifyingGlass, magnifyingGlass],
  [formIcon.MilitaryHat, militaryHat],
  [formIcon.Pen, pen],
  [formIcon.Programmer, programmer],
  [formIcon.Searching, searching],
  [formIcon.Smile, smile],
  [formIcon.SoccerBall, soccerBall],
  [formIcon.Soldier, soldier],
  [formIcon.Tank, tank],
  [formIcon.Target, target],
  [formIcon.User, user],
  [formIcon.Document, doc],
  [formIcon.Jpeg, jpg],
  [formIcon.Pdf, pdf],
  [formIcon.Png, png],
  [formIcon.Ppt, ppt],
  [formIcon.Text, txt],
  [formIcon.Excel, xls],
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
export const notificationProps = {
  theme: "colored",
  autoClose: 2000,
  transition: Slide,
};

export function showErrorNotification(error: string, autoCloseTime?: number) {
  const customProps = {
    ...notificationProps,
    autoClose: autoCloseTime ?? notificationProps.autoClose, // use provided time or default
  };

  toast.error(error + "", customProps);
}

export function showSuccessNotification(msg: string) {
  toast.success(msg + "", notificationProps);
}

export function showWarningNotification(msg: string) {
  toast.warn(msg + "", notificationProps);
}

export function showLoadingNotification(msg: string, icon?: JSX.Element) {
  const toastId = toast.loading(msg, {
    style: {
      background: "#d5e6f6",
      color: "#000000",
    },
    closeButton: false,
    hideProgressBar: true,
    icon: icon,
  });

  return toastId;
}

export const titleBgStyle = {
  fill: {
    fgColor: { rgb: "00c7d9c9" },
    bgColor: { rgb: "00c7d9c9" },
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

export const getResponsesAndExportToExcel = async (form: FormDto) => {
  try {
    let responses: ResponseDto[] = await getResponses({ form_id: form.id });

    if (responses?.length > 0) {
      exportToExcel(responses, form);
    }

    showSuccessNotification(NotificationTexts.SuccessfulExportToExcel);
  } catch (error) {
    showErrorNotification(NotificationTexts.FailedExportToExcel);
    console.log(error);
  }
};

/** create excel file with only titles based on the form fields */
export function createExcelMold(form: FormDto) {
  const formFields = form.sections
    .flatMap((section) => section.fields)
    .sort((a, b) => a.index - b.index);

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
      [HEBREW_TITLES.isSynchronized]
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
            dateAndTime?: boolean;
          }
        >
      >((acc, item) => {
        const currentFieldMetaData = formFields.find((fieldData) => fieldData.id === item.fieldId);

        if (currentFieldMetaData) {
          const extra = ((currentFieldMetaData.extra ?? {}) as { dateAndTime?: boolean }) || {};
          const { displayName, fieldType: currentFieldType } = currentFieldMetaData;

          acc.push({
            displayName,
            value: item.value,
            fieldId: item.fieldId,
            dateAndTime: extra.dateAndTime,
            fieldType: currentFieldType,
          });
        }

        return acc;
      }, []);

      for (const {
        displayName,
        fieldType: currentFieldType,
        value,
        fieldId,
        dateAndTime,
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
                formattedValue = value.join(",");
              } else {
                formattedValue = value as string;
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
              } else if (dateAndTime) {
                formattedValue = moment(dateValue).format(DEFAULT_DATE_TIME_FORMAT);
              } else {
                formattedValue = moment(dateValue).format(DEFAULT_DATE_FORMAT);
              }
              break;
            }

            case fieldType.Time: {
              const timeValue = value as string;
              // If it's already in the correct format, use it directly
              if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(timeValue)) {
                formattedValue = timeValue;
              } else if (value instanceof Date) {
                // If it's a Date object, format it
                const timeMoment = moment(value);
                formattedValue = timeMoment.format("HH:mm:ss");
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
export function dateNumberToDateString(date: number | string, dateAndTime?: boolean): string {
  const formatString = dateAndTime ? DEFAULT_DATE_TIME_FORMAT : DEFAULT_DATE_FORMAT;
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

/**
 * Validates the format of a given date string using moment.js.
 * Supported formats:
 * - Day: 1 or 2 digits
 * - Month: 1 or 2 digits
 * - Year: 2 or 4 digits
 * - Separators: "-", ".", or "/"
 *
 * Example formats:
 * - D/M/YYYY
 * - DD/MM/YY
 * - D.M.YYYY
 * - DD-MM-YY
 *
 * @param {string} dateString - The date string to validate.
 * @returns {boolean} - Returns true if the date string matches a supported format, otherwise false.
 */
export function validateDateFormat(dateString: string, dateAndTime?: boolean): boolean {
  if (typeof dateString !== "string") {
    return false;
  }

  const formats = [
    "D/M/YY",
    "D/M/YYYY",
    "D/MM/YY",
    "D/MM/YYYY",
    "DD/M/YY",
    "DD/M/YYYY",
    "DD/MM/YY",
    "DD/MM/YYYY",

    "D.M.YY",
    "D.M.YYYY",
    "D.MM.YY",
    "D.MM.YYYY",
    "DD.M.YY",
    "DD.M.YYYY",
    "DD.MM.YY",
    "DD.MM.YYYY",

    "D-M-YY",
    "D-M-YYYY",
    "D-MM-YY",
    "D-MM-YYYY",
    "DD-M-YY",
    "DD-M-YYYY",
    "DD-MM-YY",
    "DD-MM-YYYY",
  ];
  let finalFormats = formats;
  if (dateAndTime) {
    finalFormats = formats.map((format) => format + " " + "HH:mm");
  }
  return moment(dateString, finalFormats, true).isValid();
}

/**
 * Validates whether a given value is of type string or number.
 * This function is typically used to check if a value is either a string or
 * a numeric representation of an Excel time format.
 *
 * @param {string | number} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a string or a number, otherwise false.
 */
function validateTimeType(value: string | number): boolean {
  if (typeof value === "number") {
    return true;
  }

  if (typeof value === "string") {
    return true;
  }

  return false;
}

export enum TimeFormatErrorNames {
  invalidType = "invalidType",
  invalidFormat = "invalidFormat",
}

/**
 * Validates whether a given value is a valid time.
 * The function first checks if the value is a string or a number (Excel time format).
 * Then, it validates the time format based on the specified formats:
 * - Default: hh:mm or h:mm
 * - If `showSeconds` is true: hh:mm:ss or h:mm:ss
 *
 * For Excel time (number), it converts the number to a time string before validation.
 *
 * @param {string | number} value - The value to validate (string or Excel time format).
 * @param {boolean} [showSeconds=false] - If true, includes seconds in the validation (hh:mm:ss or h:mm:ss).
 * @returns {{ valid: boolean, error?: "invalidType" | "invalidFormat" }} - An object indicating whether the time is valid.
 * - `valid: true` if the value is a valid time.
 * - `valid: false` and `error: "invalidType"` if the value is not a valid type.
 * - `valid: false` and `error: "invalidFormat"` if the value is not in a valid time format.
 */
export function validateTimeFormat(
  value: string | number,
  showSeconds: boolean = false,
): { valid: boolean; error?: TimeFormatErrorNames } {
  if (!validateTimeType(value)) {
    return { valid: false, error: TimeFormatErrorNames.invalidType };
  }

  const formats = showSeconds ? ["HH:mm:ss", "H:mm:ss"] : ["HH:mm", "H:mm"];

  // For Excel time (number), convert to a valid time string
  let timeString = value;
  if (typeof value === "number") {
    timeString = timeNumberToTimeString(value, showSeconds);
  }

  if (!moment(timeString, formats, true).isValid()) {
    return { valid: false, error: TimeFormatErrorNames.invalidFormat };
  }
  return { valid: true };
}

/**
 * Converts a time value as a number (excel time type) to a formatted time string.
 *
 * @param {number} time - The time value in days to convert.
 *                        For example, `0.5` represents 12:00 PM, and `1` represents 24:00.
 * @param {boolean} [showSeconds=false] - Optional flag to include seconds in the output format.
 *                                         If true, the output will include hours, minutes, and seconds (HH:mm:ss).
 *                                         If false or omitted, the output will include only hours and minutes (HH:mm).
 * @returns {string} - The formatted time string in 24-hour format.
 *                     Examples: "12:00", "24:00", "12:30:45" (if `showSeconds` is true).
 */
export function timeNumberToTimeString(time: number, showSeconds?: boolean): string {
  return moment.utc(moment.unix(time * 86400)).format(showSeconds ? "HH:mm:ss" : "HH:mm");
}

const locationResponseImportErrors = {
  lengthY: "ערך X של נקודת הציון חייב להכיל 6 ספרות",
  lengthX: "ערך Y של נקודת הציון חייב להכיל 6 ספרות",
  invalidFormat: "הערך בתא זה חייב להיות בפורמט 123456,123456",
};
const optionsResponseImportErrors = {
  mustBeInOptions: "הערך חייב להיות אחד או יותר מהאפשרויות הבאות מופרדות בפסיק -",
  mustBeOneOfOptions: "הערך חייב להיות אחד מהאפשרויות הבאות -",
};

const linkResponseImportErrors = {
  invalidFormat: "הערך בתא זה חייב להיות מסוג מחרוזת או קישור של Excel",
};
const dateResponseImportErrors = {
  invalidType: `הערך מסוג לא תקין. יש להזין ערך מסוג תאריך או מחרוזת`,
  invalidFormat: `הערך בפורמט לא תקין. יש להזין תאריך בפורמט -`,
};
const timeResponseImportErrors = {
  invalidType: `הערך מסוג לא תקין. יש להזין ערך מסוג שעה או מחרוזת`,
  invalidFormat: `הערך בפורמט לא תקין. יש להזין שעה בפורמט -`,
};
const numberResponseImportErrors = {
  invalidType: `הערך מסוג לא תקין. יש להזין ערך מסוג מספר שלם`,
  invalidFormat: `הערך לא בטווח ערכים המותר`,
};

export const ResponseImportValidationErrors = {
  required: "הערך בתא זה לא יכול להישאר ריק",
  typeString: "הערך בתא זה חייב להיות מסוג מחרוזת",
  location: locationResponseImportErrors,
  options: optionsResponseImportErrors,
  link: linkResponseImportErrors,
  date: dateResponseImportErrors,
  hour: timeResponseImportErrors,
  customRegex: "הערך בתא זה לא תואם את ההגדרה הייחודית של השדה.",
  number: numberResponseImportErrors,
} as const;

export function getErrorMessage(
  fieldName: string,
  row: number,
  error: string,
  additionalData?: string,
) {
  const location = `שדה ${fieldName} שורה ${row}:`;
  const errorMessageParts = [location, error];
  if (additionalData) {
    errorMessageParts.push(additionalData);
  }
  return errorMessageParts.join(" ");
}

const validUrlRegex = new RegExp(/^https?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/);

/**
 * Extracts link information from an Excel hyperlink function or link address.
 *
 * @param {string} linkText - The text associated with the hyperlink.
 * @param {Object} [linkValues] - Optional object containing hyperlink details.
 * @param {string} [linkValues.hyperlinkFunction] - A hyperlink function string that may contain a valid URL.
 * @param {string} [linkValues.linkAddress] - A direct hyperlink address.
 * @returns {{ link: string; linkTxt: string } | null} The extracted link and text, or null if no valid link is found.
 */
export function getLinkPartsFromExcelHyperLink(
  linkText: string,
  linkValues?: { hyperlinkFunction?: string; linkAddress?: string },
): { link: string; linkTxt: string } | null {
  if (linkValues) {
    const { hyperlinkFunction, linkAddress } = linkValues;
    if (hyperlinkFunction) {
      const link = getLinkFromHyperlinkFunctionString(hyperlinkFunction);
      if (link) {
        return { link, linkTxt: linkText || link };
      }
    } else if (linkAddress) {
      const isLinkAddressValid = validUrlRegex.test(linkAddress);
      if (isLinkAddressValid) {
        return { link: linkAddress, linkTxt: linkText || linkAddress };
      }
    }
  } else {
    const isLinkTextValidLink = validUrlRegex.test(linkText);
    if (isLinkTextValidLink) {
      return { link: linkText, linkTxt: linkText };
    }
  }

  return null;
}

function getLinkFromHyperlinkFunctionString(hyperlinkFunction: string) {
  const excelHyperlinkString = "HYPERLINK(";
  if (hyperlinkFunction.includes(excelHyperlinkString)) {
    const link = hyperlinkFunction.substring(
      hyperlinkFunction.indexOf(excelHyperlinkString) + excelHyperlinkString.length + 1,
      hyperlinkFunction.indexOf(",") - 1,
    );
    return link;
  }
  return null;
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
    newField.coordinateType = "UTM";
  }

  return newField;
}

export function getUserRole(
  formUsers: FormUser[],
  currentUser: User,
  isSuperAdmin: boolean | null,
  fullAccessRoleId: RoleId | null,
) {
  if (isSuperAdmin && fullAccessRoleId) return fullAccessRoleId;
  const permittedUser = formUsers.find(
    (u) => u.upn?.toLowerCase() === currentUser.upn?.toLowerCase(),
  );
  if (permittedUser) {
    return permittedUser.role_id;
  }

  throw "current user does not have access to this form";
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
      (role) => role.permission_types.length === Object.keys(PERMISSION_TYPES).length,
    );

    const userRole = getUserRole(form.users, user, !!isSuperAdmin, fullAccessRole?.role_id || null);

    const roleObj = roles.find((r) => r.role_id === userRole);
    const permissionTypes = roleObj?.permission_types || [];

    if (response?.id && !viewMode) {
      // if response exists and not in view mode, check for roles
      const hasPermissionForResponse = permissionTypes.some((type) =>
        RESPONSE_ACCESS_PERMISSIONS.includes(type),
      );
      if (!hasPermissionForResponse) {
        return false;
      }
    } else if (!response?.id && !viewMode) {
      // if its a new response and not in view mode, check for roles
      const hasPermissionToCreateResponse = permissionTypes.some((type) =>
        CREATE_RESPONSE_PERMISSIONS.includes(type),
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
    icon: "formX",
    fields: [],
    parentFieldId: undefined,
  };
};
