import { useCallback } from "react";
import { Box, Link as MuiLink, Tooltip, styled } from "@mui/material";
import moment from "moment";

import CustomCarousel from "../../../components/FilePreview/CustomCarousel";
import { FormFieldDto } from "../../../types/shared";
import { fieldType } from "formula-gear";
import { DEFAULT_DATE_FORMAT, DEFAULT_DATE_TIME_FORMAT } from "../../../utils/utils";

interface UseCellDisplayParams {
  formId?: number;
  onFileClick?: (file: any) => void;
}

interface UseCellDisplayReturn {
  formatCellValue: (value: any, field: FormFieldDto) => React.ReactElement | null;
}

type EditorFieldExtra = {
  dateAndTime?: boolean;
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

export const useCellDisplay = ({
  formId,
  onFileClick,
}: UseCellDisplayParams): UseCellDisplayReturn => {
  const formatLinkCell = useCallback((value: LinkValue): React.ReactElement => {
    if (!value || !value.link) return <Box component="span" className="cell-box"></Box>;

    const href = /^https?:\/\//.test(value.link) ? value.link : `https://${value.link}`;
    const displayText = value.linkTxt || value.link;

    return (
      <Box component="span" className="cell-box">
        <MuiLink
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={value.link}
          sx={{
            color: "primary.main",
            textDecoration: "underline",
            cursor: "pointer",
            "&:hover": {
              textDecoration: "underline",
            },
          }}>
          {displayText}
        </MuiLink>
      </Box>
    );
  }, []);

  const formatFileCell = useCallback(
    (value: any): React.ReactElement => {
      if (!value || !value.files) return <Box component="span" className="cell-box"></Box>;

      let filesList: any[] = [];

      if (Array.isArray(value.files)) {
        filesList = value.files;
      } else if (value.files && typeof value.files === "object") {
        const { newFiles = [], attachedFiles = [] } = value.files;
        const newFilesData = newFiles.map((file: File) => ({ name: file.name, file }));

        filesList = [...attachedFiles, ...newFilesData];
      }

      if (filesList.length === 0) return <Box component="span" className="cell-box"></Box>;

      return (
        <CenteredBox>
          <CustomCarousel
            formId={formId}
            items={filesList}
            onItemClickHandler={onFileClick || (() => {})}
            shouldSpaceFiles={true}
          />
        </CenteredBox>
      );
    },
    [formId, onFileClick],
  );

  const formatDateCell = useCallback((value: any, includeTime?: boolean): React.ReactElement => {
    if (!value || !moment(value).isValid())
      return <Box component="span" className="cell-box-date"></Box>;

    const format = includeTime ? DEFAULT_DATE_TIME_FORMAT : DEFAULT_DATE_FORMAT;
    const formattedDate = moment(value).format(format);

    return (
      <Box component="span" className="cell-box-date">
        <label>{formattedDate}</label>
      </Box>
    );
  }, []);

  const formatTimeCell = useCallback((value: any): React.ReactElement => {
    if (!value || value === "") return <Box component="span" className="cell-box-date"></Box>;

    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(value)) {
      return (
        <Box component="span" className="cell-box-date">
          <label>{value}</label>
        </Box>
      );
    }

    if (value instanceof Date) {
      const hours = value.getHours().toString().padStart(2, "0");
      const minutes = value.getMinutes().toString().padStart(2, "0");
      const seconds = value.getSeconds().toString().padStart(2, "0");
      const timeString = `${hours}:${minutes}:${seconds}`;

      return (
        <Box component="span" className="cell-box-date">
          <label>{timeString}</label>
        </Box>
      );
    }

    return <Box component="span" className="cell-box-date"></Box>;
  }, []);

  const formatLocationCell = useCallback((value: LocationValue): React.ReactElement | null => {
    if (!value || !value.x || !value.y) return null;

    return (
      <Box className="cell-box" sx={{ lineHeight: 1.2 }}>
        <Box>
          <label>{`x: ${value.x}`}</label>
        </Box>
        <Box>
          <label>{`y: ${value.y}`}</label>
        </Box>
      </Box>
    );
  }, []);

  const formatCheckboxCell = useCallback((value: boolean): React.ReactElement => {
    return <Box component="span">{value ? "כן" : "לא"}</Box>;
  }, []);

  const formatListCell = useCallback((value: any): React.ReactElement => {
    if (!Array.isArray(value)) return <Box component="span" className="cell-box"></Box>;

    const stringValue = value.join(", ");

    return (
      <Tooltip title={stringValue} arrow>
        <EllipsisBox>
          <label>{stringValue}</label>
        </EllipsisBox>
      </Tooltip>
    );
  }, []);

  const formatDefaultCell = useCallback(
    (value: any): React.ReactElement => {
      if (typeof value === "string" || typeof value === "number") {
        const displayValue = String(value);
        const isNumber = typeof value === "number" || /^-?\d+(\.\d+)?$/.test(displayValue);

        return (
          <Tooltip title={displayValue} arrow>
            <EllipsisBox>
              {isNumber ? <span dir="ltr">{displayValue}</span> : <label>{displayValue}</label>}
            </EllipsisBox>
          </Tooltip>
        );
      }

      if (Array.isArray(value)) return formatListCell(value);

      return <Box component="span" className="cell-box"></Box>;
    },
    [formatListCell],
  );

  const formatCellValue = useCallback(
    (value: any, field: FormFieldDto): React.ReactElement | null => {
      if (value === null || value === undefined || value === "")
        return <Box component="span" className="cell-box"></Box>;

      const extra = getFieldExtra(field);
      const dateAndTime = extra.dateAndTime;

      switch (field.fieldType) {
        case fieldType.Link:
          return formatLinkCell(value as LinkValue);

        case fieldType.File:
          return formatFileCell(value);

        case fieldType.Date:
          return formatDateCell(value, dateAndTime);

        case fieldType.Time:
          return formatTimeCell(value);

        case fieldType.Location:
          return formatLocationCell(value as LocationValue);

        case fieldType.Boolean:
          return formatCheckboxCell(value as boolean);

        default:
          return formatDefaultCell(value);
      }
    },
    [
      formatLinkCell,
      formatFileCell,
      formatDateCell,
      formatTimeCell,
      formatLocationCell,
      formatCheckboxCell,
      formatDefaultCell,
    ],
  );

  return { formatCellValue };
};
