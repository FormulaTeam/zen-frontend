import React, { memo, useCallback } from "react";
import { OpenInNew } from "@mui/icons-material";
import { Box, IconButton, styled } from "@mui/material";
import TableRow from "@mui/material/TableRow";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import CustomCarousel from "@components/FilePreview/CustomCarousel";
import { downloadFileFromResponse } from "@api/filesApi";
import { FormFieldDto } from "../../../../types/shared";
import { fieldType } from "formula-gear";
import { DEFAULT_DATE_FORMAT, DEFAULT_DATE_TIME_FORMAT } from "@utils/utils";
import { Row } from "@utils/interfaces";
import { ResponseCell } from "./styled";

interface ChildResponseRowProps {
  response: Row;
  linkedFormId: number;
  formFields: FormFieldDto[];
  parentFormId?: number;
}

type EditorFieldExtra = {
  dateAndTime?: boolean;
  includeTime?: boolean;
};

const getFieldExtra = (field: FormFieldDto): EditorFieldExtra =>
  (field.extra as EditorFieldExtra | undefined) ?? {};

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
}) => {
  const navigate = useNavigate();

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

  const getResponseFieldStringValue = (field: FormFieldDto, value: unknown): string => {
    if (value === undefined || value === null) return "";

    switch (field.fieldType) {
      case fieldType.LongText:
      case fieldType.ShortText:
        return String(value);

      case fieldType.Number:
        return String(value);

      case fieldType.Time: {
        const validTimeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

        if (typeof value === "string" && validTimeRegex.test(value)) return value;

        if (value instanceof Date) {
          const hours = value.getHours().toString().padStart(2, "0");
          const minutes = value.getMinutes().toString().padStart(2, "0");
          const seconds = value.getSeconds().toString().padStart(2, "0");

          return `${hours}:${minutes}:${seconds}`;
        }

        return "";
      }

      case fieldType.Date:
        if (!moment(value).isValid()) return "";

        const extra = getFieldExtra(field);
        const includeTime = (field as any).dateAndTime || extra.dateAndTime || (field as any).includeTime || extra.includeTime;

        return includeTime
          ? moment(value).format(DEFAULT_DATE_TIME_FORMAT)
          : moment(value).format(DEFAULT_DATE_FORMAT);

      case fieldType.Boolean:
        return value === "true" || value === true ? "כן" : "לא";

      case fieldType.Location:
        if (typeof value === "string" && value.startsWith("POINT")) return value;

        if (value && typeof value === "object") {
          const locationValue = value as { x?: string; y?: string; utm?: string };

          if (locationValue.x && locationValue.y)
            return `x: ${locationValue.x}, y: ${locationValue.y}`;

          if (locationValue.utm) return `UTM: ${locationValue.utm}`;
        }

        return "";

      case fieldType.Link: {
        if (value && typeof value === "object") {
          const linkValue = value as { linkTxt?: string; link?: string };

          return linkValue.linkTxt || linkValue.link || "";
        }

        return "";
      }

      case fieldType.File:
        if (value && typeof value === "object") {
          const fileValue = value as {
            files?: Array<{ name?: string; fileName?: string }>;
          };

          if (Array.isArray(fileValue.files))
            return fileValue.files.map((file) => file.name || file.fileName || "קובץ").join(", ");
        }

        return "";

      default:
        break;
    }

    if (typeof value === "string") return value;

    if (Array.isArray(value)) return value.join(", ");

    return "";
  };

  const onFileClick = useCallback(
    (file: File) => {
      downloadFileFromResponse(file, String(linkedFormId));
    },
    [linkedFormId],
  );

  const formatFileCell = useCallback(
    (value: unknown): React.ReactElement => {
      if (!value || typeof value !== "object") return <Box component="span" className="cell-box" />;

      const fileValue = value as { files?: unknown[] };

      if (!Array.isArray(fileValue.files) || fileValue.files.length === 0)
        return <Box component="span" className="cell-box" />;

      return (
        <FileCellWrapper>
          {fileValue.files.map((file, index: number) => (
            <FileRow key={index}>
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

  return (
    <TableRow>
      <WiderResponseCell align="center">
        <IconButton color="primary" size="small" onClick={handleViewClick}>
          <OpenInNew />
        </IconButton>
      </WiderResponseCell>
      {formFields.map((field) => {
        const fieldValue = response[field.displayName] || "";

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
                  <label>{`x: ${locationValue.x}`}</label>
                </Box>
              )}
              {locationValue.y && (
                <Box>
                  <label>{`y: ${locationValue.y}`}</label>
                </Box>
              )}
            </WiderResponseCell>
          );
        }

        if (
          field.fieldType === fieldType.File &&
          fieldValue &&
          typeof fieldValue === "object" &&
          Array.isArray((fieldValue as { files?: unknown[] }).files)
        ) {
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
