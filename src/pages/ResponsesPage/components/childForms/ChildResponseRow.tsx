import React, { useCallback, memo } from "react";
import moment from "moment";
import { OpenInNew } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import { ResponseCell } from "./styled";
import { Box, styled } from "@mui/material";
import CustomCarousel from "@components/FilePreview/CustomCarousel";
import { FieldTypeIds, FormField, Row } from "@utils/interfaces";
import { DEFAULT_DATE_FORMAT, DEFAULT_DATE_TIME_FORMAT } from "@utils/utils";
import { downloadFileFromResponse } from "@api/filesApi";

interface ChildResponseRowProps {
    response: Row;
    connectedFormId: number;
    formFields: FormField[];
    parentFormId?: number;
}

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
    '& .CustomCarousel_carouselWrapper__aFOsH': {
        padding: 0,
    },
});

const ChildResponseRowComponent: React.FC<ChildResponseRowProps> = ({
    response,
    connectedFormId,
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
        navigate(`/response/view/${connectedFormId}/${response.id}`, {
            state: { parentFormId },
        });
    }, [navigate, connectedFormId, response.id, parentFormId]);


    /**
     * Converts a field value to a display string for table/cell use.
     * Supports: file, location (x/y, WKT, UTM), link, date, time, checkbox, number, text, arrays.
     */
    const getResponseFieldStringValue = (field: FormField, value: any): string => {
        if (value === undefined || value === null) {
            return "";
        }

        switch (field.typeId) {
            case FieldTypeIds.longText:
            case FieldTypeIds.shortText:
                return String(value);

            case FieldTypeIds.number:
                return value.toString();

            case FieldTypeIds.time: {
                const validTimeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
                if (validTimeRegex.test(value)) return value;
                if (value instanceof Date) {
                    const h = value.getHours().toString().padStart(2, "0");
                    const m = value.getMinutes().toString().padStart(2, "0");
                    const s = value.getSeconds().toString().padStart(2, "0");
                    return `${h}:${m}:${s}`;
                }
                return "";
            }

            case FieldTypeIds.date:
                if (!moment(value).isValid()) return "";
                return field.dateAndTime
                    ? moment(value).format(DEFAULT_DATE_TIME_FORMAT)
                    : moment(value).format(DEFAULT_DATE_FORMAT);

            case FieldTypeIds.checkbox:
                return value === "true" || value === true ? "כן" : "לא";

            case FieldTypeIds.location:
                if (typeof value === "string" && value.startsWith("POINT")) {
                    // WKT
                    return value;
                }
                if (value && typeof value === "object") {
                    if (value.x && value.y) return `x: ${value.x}, y: ${value.y}`;
                    if (value.utm) return `UTM: ${value.utm}`;
                }
                return "";

            case FieldTypeIds.link:
                return value.linkTxt || value.link || "";

            case FieldTypeIds.file:
                if (value?.files && Array.isArray(value.files)) {
                    return value.files.map((f: any) => f.name || f.fileName || "קובץ").join(", ");
                }
                return "";

            default:
                break;
        }

        if (typeof value === "string") return value;
        if (Array.isArray(value)) return value.join(", ");
        return "";
    };


    const onFileClick = useCallback((file: File) => {
        downloadFileFromResponse(file, String(connectedFormId));
    }, [connectedFormId]);


    const formatFileCell = useCallback((value: any): React.ReactElement => {
        if (!value || !value.files || value.files.length === 0) {
            return <Box component="span" className="cell-box"></Box>;
        }

        return (
            <FileCellWrapper>
                {value.files.map((file: any, i: number) => (
                    <FileRow key={i}>
                        <CarouselNoPad formId={connectedFormId} items={[file]} onItemClickHandler={onFileClick} />
                    </FileRow>
                ))}
            </FileCellWrapper>
        );
    }, [connectedFormId, onFileClick]);


    return (
        <TableRow>
            <WiderResponseCell align="center">
                <IconButton
                    color="primary"
                    size="small"
                    onClick={handleViewClick}>
                    <OpenInNew />
                </IconButton>
            </WiderResponseCell>
            {formFields.map((field, fieldIndex) => {
                const fieldValue = response[field.displayName] || "";

                if (field.typeId === FieldTypeIds.location && fieldValue && typeof fieldValue === "object") {
                    const loc = fieldValue as { x?: string; y?: string };
                    return (
                        <WiderResponseCell key={fieldIndex}>
                            {loc.x && <Box sx={{ mb: 0.5 }}><label>{`x: ${loc.x}`}</label></Box>}
                            {loc.y && <Box><label>{`y: ${loc.y}`}</label></Box>}
                        </WiderResponseCell>
                    );
                }


                if (field.typeId === FieldTypeIds.file && fieldValue && (fieldValue as any).files && Array.isArray((fieldValue as any).files)) {
                    return (
                        <WiderResponseCell key={fieldIndex}>
                            {formatFileCell(fieldValue)}
                        </WiderResponseCell>
                    );
                }

                return (
                    <WiderResponseCell key={fieldIndex}>
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
