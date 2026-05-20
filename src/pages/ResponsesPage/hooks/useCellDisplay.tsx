import { useCallback } from "react";
import { Box, Chip, Link as MuiLink, Typography, styled } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
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
  dateAndTime?: boolean;
  includeTime?: boolean;
  includeSeconds?: boolean;
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

const EllipsisBox = styled(Box)({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  display: "block",
});

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

const QuickEditFileRoot = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 7,
  padding: "7px 8px",
  height: "100%",
  maxHeight: "130px",
  width: "100%",
  overflow: "hidden",
  boxSizing: "border-box",
  borderRadius: 8,
  backgroundColor: theme.palette.background.paper,
}));

const QuickEditFileDropzoneLook = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  border: "1.5px dashed",
  borderColor: theme.palette.grey[400],
  borderRadius: 8,
  padding: "4px 8px",
  textAlign: "center",
  backgroundColor: theme.palette.background.paper,
  width: "100%",
  minHeight: 38,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  boxSizing: "border-box",
  color: theme.palette.text.primary,
}));

const QuickEditFilesContainer = styled(Box)({
  flex: 1,
  minHeight: 0,
  display: "flex",
  alignContent: "flex-start",
  alignItems: "flex-start",
  flexWrap: "wrap",
  gap: 5,
  overflowY: "auto",
  overflowX: "hidden",
  paddingInlineEnd: 2,
  paddingBottom: 2,
});

const QuickEditFileChip = styled(Chip)({
  maxWidth: 152,
  fontSize: "0.76rem",
  height: 23,
  "& .MuiChip-label": {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    paddingInline: 8,
  },
});

const getQuickEditFileParts = (
  value: unknown,
): {
  newFiles: File[];
  attachedFiles: StoredFile[];
} => {
  if (isFileDraftValue(value)) {
    return {
      newFiles: value.files.newFiles,
      attachedFiles: value.files.attachedFiles,
    };
  }

  if (isLocalFileFieldValue(value)) {
    return {
      newFiles: value.files.map((file) => file.file),
      attachedFiles: [],
    };
  }

  if (isFileFieldValue(value)) {
    return {
      newFiles: [],
      attachedFiles: value.files,
    };
  }

  return {
    newFiles: [],
    attachedFiles: [],
  };
};

export const useCellDisplay = ({
  formId,
  onFileClick,
  searchQuery,
  isInEditMode = false,
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

  const formatQuickEditFileCell = useCallback((value: unknown): React.ReactElement => {
    const { newFiles, attachedFiles } = getQuickEditFileParts(value);
    const files = [
      ...attachedFiles.map((file) => ({
        key: `attached-${file.path}`,
        name: file.name,
        color: "default" as const,
        variant: "outlined" as const,
      })),
      ...newFiles.map((file, index) => ({
        key: `new-${file.name}-${index}`,
        name: file.name,
        color: "primary" as const,
        variant: "filled" as const,
      })),
    ];

    return (
      <QuickEditFileRoot>
        <QuickEditFileDropzoneLook>
          <AttachFileIcon fontSize="small" color="primary" />

          <Typography variant="caption" sx={{ fontWeight: 500, fontSize: "0.78rem" }}>
            לחץ או גרור קבצים
          </Typography>
        </QuickEditFileDropzoneLook>

        {files.length > 0 && (
          <QuickEditFilesContainer>
            {files.map((file) => (
              <OverflowTooltip key={file.key} title={file.name} arrow>
                <QuickEditFileChip
                  label={file.name}
                  size="small"
                  color={file.color}
                  variant={file.variant}
                />
              </OverflowTooltip>
            ))}
          </QuickEditFilesContainer>
        )}
      </QuickEditFileRoot>
    );
  }, []);

  const formatFileCell = useCallback(
    (value: unknown): React.ReactElement => {
      if (!value) {
        return isInEditMode ? (
          formatQuickEditFileCell(value)
        ) : (
          <Box component="span" className="cell-box"></Box>
        );
      }

      if (isInEditMode) {
        return formatQuickEditFileCell(value);
      }

      if (!isFileFieldValue(value) || value.files.length === 0) {
        return <Box component="span" className="cell-box"></Box>;
      }

      return (
        <CenteredBox>
          <CustomCarousel
            formId={formId}
            items={value.files}
            onItemClickHandler={onFileClick || (() => {})}
            shouldSpaceFiles
          />
        </CenteredBox>
      );
    },
    [formId, onFileClick, isInEditMode, formatQuickEditFileCell],
  );

  const formatDateCell = useCallback(
    (value: any, includeTime?: boolean): React.ReactElement => {
      if (!value || !moment(value).isValid()) {
        return <Box component="span" className="cell-box-date"></Box>;
      }

      const datePart = moment(value).format(DEFAULT_DATE_FORMAT);
      const timePart = includeTime ? ` ${moment(value).format("HH:mm")}` : "";

      return (
        <Box component="span" className="cell-box-date">
          <label>
            {highlightText(datePart)}
            {timePart}
          </label>
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
          <label>{highlightText(displayValue)}</label>
        </Box>
      );
    },
    [highlightText],
  );

  const formatLocationCell = useCallback(
    (value: LocationValue): React.ReactElement | null => {
      if (!value || !value.x || !value.y) return null;

      return (
        <Box className="cell-box" sx={{ lineHeight: 1.2 }}>
          <Box>
            <label>x: {highlightText(String(value.x))}</label>
          </Box>
          <Box>
            <label>y: {highlightText(String(value.y))}</label>
          </Box>
        </Box>
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
          <EllipsisBox>
            <label>{highlightText(stringValue)}</label>
          </EllipsisBox>
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
          <EllipsisBox>
            <label>{highlightText(displayValue)}</label>
          </EllipsisBox>
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
            <EllipsisBox>
              {isNumber ? (
                <span dir="ltr">{highlightText(displayValue)}</span>
              ) : (
                <label>{highlightText(displayValue)}</label>
              )}
            </EllipsisBox>
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
      if (value === null || value === undefined || value === "") {
        if (isInEditMode && field.fieldType === fieldType.File) {
          return formatFileCell(value);
        }

        return <Box component="span" className="cell-box"></Box>;
      }

      const extra = getFieldExtra(field);

      const dateAndTime = Boolean(
        (field as any).dateAndTime ??
        extra.dateAndTime ??
        (field as any).includeTime ??
        extra.includeTime,
      );

      const includeSeconds = Boolean(extra.includeSeconds);

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
      isInEditMode,
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

  return { formatCellValue };
};
