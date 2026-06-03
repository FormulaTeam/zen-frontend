import React, { useCallback, useMemo } from "react";
import { Box, Link as MuiLink, Tooltip, styled } from "@mui/material";
import moment from "moment";

import { OverflowTooltip } from "@components/OverflowTooltip";
import CustomCarousel from "../../../components/FilePreview/CustomCarousel";
import { FormFieldDto } from "../../../types/shared";
import { fieldType } from "formula-gear";
import { DEFAULT_DATE_FORMAT } from "../../../utils/utils";

import { highlightTextUtil } from "../utils/highlighting";
import {
  getOptionResponseDisplayValue,
  OptionResponseValue,
} from "../../../utils/optionResponseValue";

interface UseCellDisplayParams {
  formId?: number;
  onFileClick?: (file: any) => void;
  searchQuery?: string;
  isInEditMode?: boolean;
}

interface UseCellDisplayReturn {
  formatCellValue: (value: any, field: FormFieldDto) => React.ReactElement | null;
}

type EditorFieldExtra = {
  dateType?: "datetime" | "date";
  timePrecision?: "seconds" | "minutes";
  options?:
    | string[]
    | {
        items?: OptionResponseValue[];
      };
};

type StoredFile = {
  name: string;
  path: string;
};

type LocalDisplayFile = {
  name: string;
  file: File;
};

type FileFieldValue = {
  files: StoredFile[];
};

type FileDraftValue = {
  files: {
    newFiles: File[];
    attachedFiles: StoredFile[];
  };
  deletedFiles: StoredFile[];
};

type LocationValue = {
  x?: string | number;
  y?: string | number;
};

type LinkValue = {
  link?: string;
  linkTxt?: string;
};

const getFieldExtra = (field: FormFieldDto): EditorFieldExtra =>
  (field.extra as EditorFieldExtra | undefined) ?? {};

const isStoredFile = (value: unknown): value is StoredFile => {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "path" in value &&
    typeof value.name === "string" &&
    typeof value.path === "string"
  );
};

const isLocalDisplayFile = (value: unknown): value is LocalDisplayFile => {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "file" in value &&
    typeof value.name === "string" &&
    value.file instanceof File
  );
};

const isFileFieldValue = (value: unknown): value is FileFieldValue => {
  return (
    typeof value === "object" &&
    value !== null &&
    "files" in value &&
    Array.isArray(value.files) &&
    value.files.every(isStoredFile)
  );
};

const isLocalFileFieldValue = (value: unknown): value is { files: LocalDisplayFile[] } => {
  return (
    typeof value === "object" &&
    value !== null &&
    "files" in value &&
    Array.isArray(value.files) &&
    value.files.every(isLocalDisplayFile)
  );
};

const isFileDraftValue = (value: unknown): value is FileDraftValue => {
  if (typeof value !== "object" || value === null || !("files" in value)) {
    return false;
  }

  const typedValue = value as FileDraftValue;

  return (
    typeof typedValue.files === "object" &&
    typedValue.files !== null &&
    !Array.isArray(typedValue.files) &&
    Array.isArray(typedValue.files.newFiles) &&
    Array.isArray(typedValue.files.attachedFiles) &&
    typedValue.files.attachedFiles.every(isStoredFile) &&
    Array.isArray(typedValue.deletedFiles)
  );
};

const getOptionLabelMap = (field: FormFieldDto): Record<string, string> => {
  const extra = getFieldExtra(field);

  if (
    extra.options &&
    typeof extra.options === "object" &&
    !Array.isArray(extra.options) &&
    Array.isArray(extra.options.items)
  ) {
    return Object.fromEntries(
      extra.options.items
        .filter(
          (option) => option && typeof option.id === "string" && typeof option.text === "string",
        )
        .map((option) => [option.id, option.text]),
    );
  }

  return {};
};

const getOptionDisplayText = (value: unknown, field: FormFieldDto): string => {
  const displayValue = getOptionResponseDisplayValue(value);
  const labelMap = getOptionLabelMap(field);

  if (Array.isArray(displayValue)) {
    return displayValue
      .map((item) => {
        const optionId = String(item);
        return labelMap[optionId] ?? optionId;
      })
      .join(", ");
  }

  const stringValue = String(displayValue ?? "");

  return labelMap[stringValue] ?? stringValue;
};

const formatTimeDisplayValue = (value: unknown, includeSeconds?: boolean): string => {
  const timeFormat = includeSeconds ? "HH:mm:ss" : "HH:mm";

  if (value instanceof Date) {
    return moment(value).format(timeFormat);
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) return "";

    const timeOnlyMatch = trimmedValue.match(/^([0-1]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);

    if (timeOnlyMatch) {
      const hours = timeOnlyMatch[1].padStart(2, "0");
      const minutes = timeOnlyMatch[2];
      const seconds = timeOnlyMatch[3] ?? "00";

      return includeSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
    }

    const parsedMoment = moment(trimmedValue);

    if (parsedMoment.isValid()) {
      return parsedMoment.format(timeFormat);
    }
  }

  return "";
};

const CenteredBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  width: "100%",
  "& [data-mui-internal-clone-element='true']": {
    display: "flex",
  },
});

const getFileDisplayItems = (value: unknown): Array<StoredFile | LocalDisplayFile> => {
  if (isFileDraftValue(value)) {
    return [
      ...value.files.attachedFiles,
      ...value.files.newFiles.map((file) => ({
        name: file.name,
        file,
      })),
    ];
  }

  if (isLocalFileFieldValue(value)) {
    return value.files;
  }

  if (isFileFieldValue(value)) {
    return value.files;
  }

  return [];
};

export const useCellDisplay = ({
  formId,
  onFileClick,
  searchQuery,
}: UseCellDisplayParams): UseCellDisplayReturn => {
  const highlightText = useCallback(
    (text: string | number | null | undefined): React.ReactNode => {
      return highlightTextUtil(text, searchQuery);
    },
    [searchQuery],
  );

  const formatLinkCell = useCallback(
    (value: LinkValue): React.ReactElement => {
      if (!value || !value.link) return <Box component="span" className="cell-box"></Box>;

      const href = /^https?:\/\//.test(value.link) ? value.link : `https://${value.link}`;
      const displayText = value.linkTxt || value.link;

      return (
        <Box component="span" className="cell-box">
          <OverflowTooltip title={value.link} arrow>
            <MuiLink
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "primary.main",
                textDecoration: "underline",
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}>
              {highlightText(displayText)}
            </MuiLink>
          </OverflowTooltip>
        </Box>
      );
    },
    [highlightText],
  );

  const formatFileCell = useCallback(
    (value: unknown): React.ReactElement => {
      const displayFiles = getFileDisplayItems(value);

      if (displayFiles.length === 0) {
        return <Box component="span" className="cell-box"></Box>;
      }

      return (
        <CenteredBox>
          <CustomCarousel
            formId={formId}
            items={displayFiles}
            onItemClickHandler={onFileClick || (() => {})}
            shouldSpaceFiles
          />
        </CenteredBox>
      );
    },
    [formId, onFileClick],
  );

  const formatDateCell = useCallback(
    (value: any, includeTime?: boolean): React.ReactElement => {
      if (!value || !moment(value).isValid()) {
        return <Box component="span" className="cell-box-date"></Box>;
      }

      const datePart = moment(value).format(DEFAULT_DATE_FORMAT);
      const timePart = includeTime ? ` ${moment(value).format("HH:mm")}` : "";
      const fullText = `${datePart}${timePart}`;

      return (
        <Box component="span" className="cell-box-date">
          <OverflowTooltip title={fullText} arrow>
            <label>
              {highlightText(datePart)}
              {timePart}
            </label>
          </OverflowTooltip>
        </Box>
      );
    },
    [highlightText],
  );

  const formatTimeCell = useCallback(
    (value: any, includeSeconds?: boolean): React.ReactElement => {
      const displayValue = formatTimeDisplayValue(value, includeSeconds);

      if (!displayValue) {
        return <Box component="span" className="cell-box-date"></Box>;
      }

      return (
        <Box component="span" className="cell-box-date">
          <OverflowTooltip title={displayValue} arrow>
            <label>{highlightText(displayValue)}</label>
          </OverflowTooltip>
        </Box>
      );
    },
    [highlightText],
  );

  const formatLocationCell = useCallback(
    (value: LocationValue): React.ReactElement | null => {
      if (!value || value.x == null || value.y == null) return null;

      const x = String(value.x);
      const y = String(value.y);

      const displayText = `${x}, ${y}`;
      const fullText = `x: ${x}, y: ${y}`;

      return (
        <Tooltip title={fullText} arrow placement="bottom">
          <Box
            component="span"
            className="cell-box"
            dir="ltr"
            sx={{
              width: "100%",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
              textAlign: "left",
              cursor: "default",
            }}>
            {highlightText(displayText)}
          </Box>
        </Tooltip>
      );
    },
    [highlightText],
  );

  const formatCheckboxCell = useCallback(
    (value: boolean): React.ReactElement => {
      return <Box component="span">{highlightText(value ? "כן" : "לא")}</Box>;
    },
    [highlightText],
  );

  const formatListCell = useCallback(
    (value: any): React.ReactElement => {
      if (!Array.isArray(value)) return <Box component="span" className="cell-box"></Box>;

      const stringValue = value.join(", ");

      return (
        <OverflowTooltip title={stringValue} arrow>
          <label>{highlightText(stringValue)}</label>
        </OverflowTooltip>
      );
    },
    [highlightText],
  );

  const formatOptionsCell = useCallback(
    (value: any, field: FormFieldDto): React.ReactElement => {
      const displayValue = getOptionDisplayText(value, field);

      if (!displayValue) {
        return <Box component="span" className="cell-box"></Box>;
      }

      return (
        <OverflowTooltip title={displayValue} arrow>
          <label>{highlightText(displayValue)}</label>
        </OverflowTooltip>
      );
    },
    [highlightText],
  );

  const formatDefaultCell = useCallback(
    (value: any): React.ReactElement => {
      if (typeof value === "string" || typeof value === "number") {
        const displayValue = String(value);
        const isNumber = typeof value === "number" || /^-?\d+(\.\d)?$/.test(displayValue);

        return (
          <OverflowTooltip title={displayValue} arrow>
            {isNumber ? (
              <span dir="ltr">{highlightText(displayValue)}</span>
            ) : (
              <label>{highlightText(displayValue)}</label>
            )}
          </OverflowTooltip>
        );
      }

      if (Array.isArray(value)) return formatListCell(value);

      return <Box component="span" className="cell-box"></Box>;
    },
    [formatListCell, highlightText],
  );

  const formatCellValue = useCallback(
    (value: any, field: FormFieldDto): React.ReactElement | null => {
      const extra = getFieldExtra(field);

      if (value === null || value === undefined || value === "") {
        if (field.fieldType === fieldType.File) {
          return formatFileCell(value);
        }

        return <Box component="span" className="cell-box"></Box>;
      }

      const dateAndTime = extra.dateType === "datetime";
      const includeSeconds = extra.timePrecision === "seconds";

      switch (field.fieldType) {
        case fieldType.Options:
          return formatOptionsCell(value, field);

        case fieldType.Link:
          return formatLinkCell(value as LinkValue);

        case fieldType.File:
          return formatFileCell(value);

        case fieldType.Date:
          return formatDateCell(value, dateAndTime);

        case fieldType.Time:
          return formatTimeCell(value, includeSeconds);

        case fieldType.Location:
          return formatLocationCell(value as LocationValue);

        case fieldType.Boolean:
          return formatCheckboxCell(value as boolean);

        default:
          return formatDefaultCell(value);
      }
    },
    [
      formatFileCell,
      formatOptionsCell,
      formatLinkCell,
      formatDateCell,
      formatTimeCell,
      formatLocationCell,
      formatCheckboxCell,
      formatDefaultCell,
    ],
  );

  return useMemo(() => ({ formatCellValue }), [formatCellValue]);
};
