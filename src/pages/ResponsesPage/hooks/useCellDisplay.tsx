import { useCallback } from "react";
import { Box, Link as MuiLink, Tooltip, styled } from "@mui/material";
import moment from "moment";
import { FieldTypeIds, FormField, LocationValue, LinkValue } from "../../../utils/interfaces";
import { DEFAULT_DATE_FORMAT, DEFAULT_DATE_TIME_FORMAT } from "../../../utils/utils";
import CustomCarousel from "../../../components/FilePreview/CustomCarousel";

interface UseCellDisplayParams {
    formId?: number;
    onFileClick?: (file: any) => void;
}

interface UseCellDisplayReturn {
    formatCellValue: (value: any, field: FormField) => React.ReactElement | null;
}

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

export const useCellDisplay = ({ formId, onFileClick }: UseCellDisplayParams): UseCellDisplayReturn => {
    const formatLinkCell = useCallback((value: LinkValue): React.ReactElement => {
        if (!value || !value.link) {
            return <Box component="span" className="cell-box"></Box>;
        }

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
                    }}
                >
                    {displayText}
                </MuiLink>
            </Box>
        );
    }, []);

    const formatFileCell = useCallback((value: any): React.ReactElement => {
        if (!value || !value.files || value.files.length === 0) {
            return <Box component="span" className="cell-box"></Box>;
        }

        return (
            <CenteredBox>
                <CustomCarousel formId={formId} items={value.files} onItemClickHandler={onFileClick || (() => { })} />
            </CenteredBox>
        );
    }, [formId, onFileClick]);

    const formatDateCell = useCallback((value: any, includeTime?: boolean): React.ReactElement => {
        if (!value || !moment(value).isValid()) {
            return <Box component="span" className="cell-box-date"></Box>;
        }

        const format = includeTime ? DEFAULT_DATE_TIME_FORMAT : DEFAULT_DATE_FORMAT;
        const formattedDate = moment(value).format(format);

        return (
            <Box component="span" className="cell-box-date">
                <label>{formattedDate}</label>
            </Box>
        );
    }, []);

    const formatTimeCell = useCallback((value: any): React.ReactElement => {
        if (!value || value === "") {
            return <Box component="span" className="cell-box-date"></Box>;
        }

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
        if (!value || !value.x || !value.y) {
            return null;
        }

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

    const formatNumberCell = useCallback((value: any): React.ReactElement => {
        const displayValue = String(value);
        return (
            <Tooltip title={displayValue} arrow>
                <EllipsisBox>
                    <span dir="ltr">{displayValue}</span>
                </EllipsisBox>
            </Tooltip>
        );
    }, []);

    const formatListCell = useCallback((value: any): React.ReactElement => {
        if (!Array.isArray(value)) {
            return <Box component="span" className="cell-box"></Box>;
        }

        const str = value.join(", ");
        return (
            <Tooltip title={str} arrow>
                <EllipsisBox>
                    <label>{str}</label>
                </EllipsisBox>
            </Tooltip>
        );
    }, []);

    const formatDefaultCell = useCallback((value: any): React.ReactElement => {
        if (typeof value === "string" || typeof value === "number") {
            const displayValue = String(value);
            // If it's a number, force LTR for correct minus sign display
            const isNumber = typeof value === "number" || /^-?\d+(\.\d+)?$/.test(displayValue);
            return (
                <Tooltip title={displayValue} arrow>
                    <EllipsisBox>
                        {isNumber ? <span dir="ltr">{displayValue}</span> : <label>{displayValue}</label>}
                    </EllipsisBox>
                </Tooltip>
            );
        }

        if (Array.isArray(value)) {
            return formatListCell(value);
        }

        return <Box component="span" className="cell-box"></Box>;
    }, [formatListCell]);

    const formatCellValue = useCallback((value: any, field: FormField): React.ReactElement | null => {
        if (value === null || value === undefined || value === "") {
            return <Box component="span" className="cell-box"></Box>;
        }

        switch (field.typeId) {
            case FieldTypeIds.link:
                return formatLinkCell(value as LinkValue);

            case FieldTypeIds.file:
                return formatFileCell(value);

            case FieldTypeIds.date:
                return formatDateCell(value, field.dateAndTime);

            case FieldTypeIds.time:
                return formatTimeCell(value);

            case FieldTypeIds.location:
                return formatLocationCell(value as LocationValue);

            case FieldTypeIds.checkbox:
                return formatCheckboxCell(value as boolean);

            // The field types: options,list, number are handled here also
            default:
                return formatDefaultCell(value);
        }
    }, [formatLinkCell, formatFileCell, formatDateCell, formatTimeCell, formatLocationCell, formatCheckboxCell, formatNumberCell, formatDefaultCell]);

    return { formatCellValue };
};
