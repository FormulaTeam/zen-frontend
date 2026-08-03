import * as XLSX from "sheetjs-style";
import * as FileSaver from "file-saver";
import { getResponses } from "../api";
import { NotificationTexts } from "./interfaces";
import { FormDto, ResponseDto } from "../types/shared";
import {
  showErrorNotification,
  showSuccessNotification,
  showWarningNotification,
} from "./notifications";
import {
  EXCEL_DATE_FORMAT,
  EXCEL_FILE_EXTENSION,
  EXCEL_FILE_TYPE,
  EXPORT_PAGE_SIZE,
} from "./excel/constants";
import { ExcelDateCell, toExcelSerialDate } from "./excel/dateSerial";
import { buildMoldData, buildResponseExportData } from "./excel/responseData";
import { applySheetStyles } from "./excel/sheetStyles";

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

const applyDateCells = (ws: XLSX.WorkSheet, excelDateCells: ExcelDateCell[]) => {
  const headerToColumnIndex = new Map<string, number>();
  const sheetRange = XLSX.utils.decode_range(ws["!ref"] ?? "A1");

  for (let columnIndex = sheetRange.s.c; columnIndex <= sheetRange.e.c; columnIndex++) {
    const headerCellRef = XLSX.utils.encode_cell({ r: 0, c: columnIndex });
    const headerValue = ws[headerCellRef]?.v;

    if (typeof headerValue === "string" && !headerToColumnIndex.has(headerValue)) {
      headerToColumnIndex.set(headerValue, columnIndex);
    }
  }

  excelDateCells.forEach(({ rowIndex, header, date, numberFormat }) => {
    const columnIndex = headerToColumnIndex.get(header);
    if (columnIndex === undefined) return;

    const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: columnIndex });
    ws[cellRef] = {
      ...(ws[cellRef] ?? { t: "n" }),
      t: "n",
      v: toExcelSerialDate(
        date,
        undefined,
        numberFormat === EXCEL_DATE_FORMAT ? "date" : "minute",
      ),
      z: numberFormat,
    };
  });
};

const downloadSheet = (ws: XLSX.WorkSheet, fileName: string) => {
  const wb = {
    Sheets: { data: ws },
    SheetNames: ["data"],
    Workbook: {
      Views: [{ RTL: true }],
    },
  };

  const excelBuffer = XLSX.write(wb, {
    bookType: EXCEL_FILE_EXTENSION,
    type: "array",
  });

  const finalData = new Blob([excelBuffer], { type: EXCEL_FILE_TYPE });
  FileSaver.saveAs(finalData, `${fileName}.${EXCEL_FILE_EXTENSION}`);
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

    exportResponsesToExcel(allResponses, form);
    showSuccessNotification(NotificationTexts.SuccessfulExportToExcel);
  } catch (error) {
    showErrorNotification(NotificationTexts.FailedExportToExcel);
    console.log(error);
  }
};

/** create excel file with only titles based on the form fields */
export function createExcelMold(form: FormDto) {
  const data = buildMoldData(form);
  const ws = XLSX.utils.json_to_sheet(data);
  applySheetStyles(ws);
  downloadSheet(ws, form.name);
}

function exportResponsesToExcel(responsesArr: ResponseDto[], form: FormDto) {
  const { data, excelDateCells } = buildResponseExportData(responsesArr, form);
  const ws = XLSX.utils.json_to_sheet(data);
  applyDateCells(ws, excelDateCells);
  applySheetStyles(ws);
  downloadSheet(ws, form.name);
}
