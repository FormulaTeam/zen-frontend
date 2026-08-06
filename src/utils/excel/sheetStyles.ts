import * as XLSX from "sheetjs-style";

const titleBgStyle = {
  fill: {
    fgColor: { rgb: "E1F0FF" },
    bgColor: { rgb: "E1F0FF" },
  },
  font: {
    color: { rgb: "020618" },
    bold: true,
  },
  border: {
    right: { style: "thin", color: "000000" },
    left: { style: "thin", color: "000000" },
    top: { style: "thin", color: "000000" },
    bottom: { style: "thin", color: "000000" },
  },
  alignment: {
    wrapText: "1",
    vertical: "top",
    horizontal: "right",
    readingOrder: 2,
  },
};

const cellBorderStyle = {
  border: {
    right: { style: "thin", color: "000000" },
    left: { style: "thin", color: "000000" },
    top: { style: "thin", color: "000000" },
    bottom: { style: "thin", color: "000000" },
  },
  alignment: {
    wrapText: "1",
    vertical: "top",
    horizontal: "right",
    readingOrder: 2,
  },
};

const cellLinkStyle = {
  font: { color: { rgb: "004175c1" } },
  border: {
    right: { style: "thin", color: "000000" },
    left: { style: "thin", color: "000000" },
    top: { style: "thin", color: "000000" },
    bottom: { style: "thin", color: "000000" },
  },
  alignment: {
    wrapText: "1",
    vertical: "top",
    horizontal: "right",
    readingOrder: 2,
  },
};

export const applySheetStyles = (ws: XLSX.WorkSheet) => {
  const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1");

  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ c: col, r: row });
      const cell = ws[cellRef];

      if (cell) {
        if (row === 0) {
          cell.s = titleBgStyle;
        } else if (cell.f?.includes("=HYPERLINK(")) {
          cell.s = cellLinkStyle;
        } else {
          cell.s = cellBorderStyle;
        }
      }

      if (cell && !cell.v && !cell.f) {
        cell.s = cellBorderStyle;
      }
    }
  }
};
