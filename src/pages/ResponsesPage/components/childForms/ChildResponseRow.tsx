import React, { memo, useCallback } from "react";
import { OpenInNew } from "@mui/icons-material";
import { Box, IconButton, styled } from "@mui/material";
import TableRow from "@mui/material/TableRow";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import CustomCarousel from "@components/FilePreview/CustomCarousel";
import { downloadFileFromResponse, type StoredFile } from "@api/filesApi";
import { FormFieldDto } from "../../../../types/shared";
import { fieldType } from "formula-gear";
import { DEFAULT_DATE_FORMAT } from "@utils/utils";
import { Row } from "@utils/interfaces";
import { ResponseCell } from "./styled";
import { getOptionResponseDisplayValue } from "../../../../utils/optionResponseValue";

import { highlightTextUtil } from "../../utils/highlighting";

interface ChildResponseRowProps {
  response: Row;
  linkedFormId: number;
  formFields: FormFieldDto[];
  parentFormId?: number;
  searchQuery?: string;
}

type EditorFieldExtra = {
  dateAndTime?: boolean;
  includeTime?: boolean;
  includeSeconds?: boolean;
};

type FileFieldValue = {
  files: StoredFile[];
};

type LocalDisplayFile = {
  name: string;
  file: File;
};

type CarouselFile = StoredFile | LocalDisplayFile;

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

const isFileFieldValue = (value: unknown): value is FileFieldValue => {
  return (
    typeof value === "object" &&
    value !== null &&
    "files" in value &&
    Array.isArray(value.files) &&
    value.files.every(isStoredFile)
  );
};

const formatTimeValue = (value: unknown, includeSeconds: boolean): string => {
  const format = includeSeconds ? "HH:mm:ss" : "HH:mm";

  if (value instanceof Date) {
    return moment(value).format(format);
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
      return parsedMoment.format(format);
    }
  }

  return "";
};

const WiderResponseCell = styled(ResponseCell)(({ theme }) => ({
  minWidth: 180,
  maxWidth: 320,
  padding: "12px 16px",
  fontSize: "1rem",
  verticalAlign: "top",
  wordBreak: "break-word",
}));

const FileCellWrapper = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  width: "100%",
});

const FileRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  marginBottom: 4,
});

const CarouselNoPad = styled(CustomCarousel)({
  "& .CustomCarousel_carouselWrapper__aFOsH": {
    padding: 0,
  },
});

const ChildResponseRowComponent: React.FC<ChildResponseRowProps> = ({
  response,
  linkedFormId,
  formFields,
  parentFormId,
  searchQuery,
}) => {
  const navigate = useNavigate();

  const highlightText = useCallback(
    (text: string | number | null | undefined): React.ReactNode => {
      return highlightTextUtil(text, searchQuery);
    },
    [searchQuery],
  );

  const formatCreatedDate = new Date(response.created || "").toLocaleDateString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const handleViewClick = useCallback((): void => {
    navigate(`/response/view/${linkedFormId}/${response.id}`, {
      state: { parentFormId },
    });
  }, [navigate, linkedFormId, response.id, parentFormId]);

  const onFileClick = useCallback(
    (file: CarouselFile) => {
      downloadFileFromResponse(file, String(linkedFormId));
    },
    [linkedFormId],
  );

  const formatFileCell = useCallback(
    (value: unknown): React.ReactElement => {
      if (!isFileFieldValue(value) || value.files.length === 0) {
        return <Box component="span" className="cell-box" />;
      }

      return (
        <FileCellWrapper>
          {value.files.map((file) => (
            <FileRow key={file.path}>
              <CarouselNoPad
                formId={linkedFormId}
                items={[file]}
                onItemClickHandler={onFileClick}
              />
            </FileRow>
          ))}
        </FileCellWrapper>
      );
    },
    [linkedFormId, onFileClick],
  );

  const getResponseFieldStringValue = (field: FormFieldDto, value: unknown): React.ReactNode => {
    if (value === undefined || value === null) return "";

    switch (field.fieldType) {
      case fieldType.LongText:
      case fieldType.ShortText:
        return highlightText(String(value));

      case fieldType.Number:
        return highlightText(String(value));

      case fieldType.Time: {
        const extra = getFieldExtra(field);
        const displayValue = formatTimeValue(value, Boolean(extra.includeSeconds));

        return displayValue ? highlightText(displayValue) : "";
      }

      case fieldType.Date: {
        if (!moment(value).isValid()) return "";

        const extra = getFieldExtra(field);
        const includeTime = Boolean(
          (field as any).dateAndTime ??
          extra.dateAndTime ??
          (field as any).includeTime ??
          extra.includeTime,
        );

        const datePart = moment(value).format(DEFAULT_DATE_FORMAT);
        const timePart = includeTime ? ` ${moment(value).format("HH:mm")}` : "";

        return (
          <>
            {highlightText(datePart)}
            {timePart}
          </>
        );
      }

      case fieldType.Boolean:
        return highlightText(value === "true" || value === true ? "כן" : "לא");

      case fieldType.Options: {
        const displayValue = getOptionResponseDisplayValue(value);
        if (Array.isArray(displayValue)) {
          return highlightText(displayValue.join(", "));
        }
        return highlightText(String(displayValue ?? ""));
      }

      case fieldType.Location:
        if (typeof value === "string" && value.startsWith("POINT")) return highlightText(value);

        if (value && typeof value === "object") {
          const locationValue = value as { x?: string; y?: string; utm?: string };

          if (locationValue.x && locationValue.y) {
            return (
              <>
                x: {highlightText(String(locationValue.x))}, y:{" "}
                {highlightText(String(locationValue.y))}
              </>
            );
          }

          if (locationValue.utm) return highlightText(`UTM: ${locationValue.utm}`);
        }

        return "";

      case fieldType.Link:
        if (value && typeof value === "object") {
          const linkValue = value as { linkTxt?: string; link?: string };

          return highlightText(linkValue.linkTxt || linkValue.link || "");
        }

        return "";

      case fieldType.File:
        if (isFileFieldValue(value)) {
          return highlightText(value.files.map((file) => file.name).join(", "));
        }

        return "";

      default:
        break;
    }

    if (typeof value === "string") return highlightText(value);

    if (Array.isArray(value)) return highlightText(value.join(", "));

    return "";
  };

  return (
    <TableRow>
      <WiderResponseCell align="center">
        <IconButton color="primary" size="small" onClick={handleViewClick}>
          <OpenInNew />
        </IconButton>
      </WiderResponseCell>

      {formFields.map((field) => {
        const fieldValue = response[field.displayName] ?? "";

        if (
          field.fieldType === fieldType.Location &&
          fieldValue &&
          typeof fieldValue === "object"
        ) {
          const locationValue = fieldValue as { x?: string; y?: string };

          return (
            <WiderResponseCell key={field.id}>
              {locationValue.x && (
                <Box sx={{ mb: 0.5 }}>
                  <label>x: {highlightText(String(locationValue.x))}</label>
                </Box>
              )}
              {locationValue.y && (
                <Box>
                  <label>y: {highlightText(String(locationValue.y))}</label>
                </Box>
              )}
            </WiderResponseCell>
          );
        }

        if (field.fieldType === fieldType.File && isFileFieldValue(fieldValue)) {
          return <WiderResponseCell key={field.id}>{formatFileCell(fieldValue)}</WiderResponseCell>;
        }

        return (
          <WiderResponseCell key={field.id}>
            {getResponseFieldStringValue(field, fieldValue)}
          </WiderResponseCell>
        );
      })}

      <WiderResponseCell>{formatCreatedDate}</WiderResponseCell>
      <WiderResponseCell>{response.createdByName}</WiderResponseCell>
    </TableRow>
  );
};

export const ChildResponseRow = memo(ChildResponseRowComponent);
