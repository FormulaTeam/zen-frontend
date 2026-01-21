import { useCallback, useMemo } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { GridColDef, GridRowId, GridRowParams } from "@mui/x-data-grid-pro";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import { Row, FieldTypeIds, Form } from "@utils/interfaces";
import { useRowExpansion } from "./useRowExpansion";
import { ExpandIconBox } from "../styled";
import { ExpandedRowContent } from "../components/childForms/ExpandedRowContent";

interface UseDetailPanelProps {
    form: Form | null;
    rows: Row[];
    hasFormInFormFields: boolean;
    childrenFormsData: any[];
    isInEditMode: boolean;
    getChildFormData: (formId: number) => any;
}

interface UseDetailPanelReturn {
    expandColumn: GridColDef | null;
    getDetailPanelContent: ((params: GridRowParams) => JSX.Element) | undefined;
    getDetailPanelHeight: (() => 'auto') | undefined;
    detailPanelExpandedRowIds: Set<GridRowId>;
}

/**
 * Manages row expansion and detail panels for displaying child form responses.
 * Returns expand column config, panel content renderer, and currently expanded row IDs.
 */
export const useDetailPanel = ({
    form,
    rows,
    hasFormInFormFields,
    childrenFormsData,
    isInEditMode,
    getChildFormData,
}: UseDetailPanelProps): UseDetailPanelReturn => {

    const getChildRowsForParent = useCallback((parentRowId: number, connectedFormId: number): Row[] => {
        const childFormData = getChildFormData(connectedFormId);
        if (!childFormData) {
            return [];
        }

        return childFormData.rows.filter((row) => {
            const parentResponse = row.parentResponse?.split(";") || [];
            const parentResId = parentResponse[1];
            return parentResId === String(parentRowId);
        });
    }, [getChildFormData]);

    const rowHasChildren = useCallback((rowId: number): boolean => {
        if (!hasFormInFormFields || !form?.fields) {
            return false;
        }

        const formInFormFields = form.fields.filter(field => field.typeId === FieldTypeIds.form);

        return formInFormFields.some(field => {
            if (!field.connectedFormId) {
                return false;
            }
            const childRows = getChildRowsForParent(rowId, field.connectedFormId);
            return childRows.length > 0;
        });
    }, [hasFormInFormFields, form?.fields, getChildRowsForParent]);

    const {
        expandedRowIds,
        toggleRowExpanded,
        toggleAllExpanded,
        isRowExpanded,
        allExpanded,
    } = useRowExpansion({
        rows,
        canRowExpand: rowHasChildren,
    });

    const renderRowExpandIcon = useCallback((row: Row): JSX.Element => {
        const rowCanExpand = rowHasChildren(row.id);
        const rowIsExpanded = isRowExpanded(String(row.id));

        if (!hasFormInFormFields) {
            return <ExpandIconBox />;
        }

        if (!rowCanExpand) {
            return (
                <ExpandIconBox>
                    <IconButton size="small" disabled>
                        <KeyboardArrowDownIcon fontSize="small" />
                    </IconButton>
                </ExpandIconBox>
            );
        }

        return (
            <ExpandIconBox>
                <Tooltip title={rowIsExpanded ? "כיווץ" : "הרחבה"}>
                    <IconButton
                        size="small"
                        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                            event.stopPropagation();
                            toggleRowExpanded(String(row.id));
                        }}
                    >
                        {rowIsExpanded ? (
                            <KeyboardArrowUpIcon fontSize="small" />
                        ) : (
                            <KeyboardArrowDownIcon fontSize="small" />
                        )}
                    </IconButton>
                </Tooltip>
            </ExpandIconBox>
        );
    }, [rowHasChildren, isRowExpanded, hasFormInFormFields, toggleRowExpanded]);

    const renderExpandAllHeader = useCallback((): JSX.Element => {
        if (!hasFormInFormFields) {
            return <Box />;
        }

        return (
            <Tooltip title={allExpanded ? "כיווץ הכל" : "הרחב הכל"}>
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleAllExpanded();
                    }}
                >
                    {allExpanded ? (
                        <KeyboardDoubleArrowUpIcon fontSize="small" />
                    ) : (
                        <KeyboardDoubleArrowDownIcon fontSize="small" />
                    )}
                </IconButton>
            </Tooltip>
        );
    }, [hasFormInFormFields, allExpanded, toggleAllExpanded]);

    const expandColumn: GridColDef | null = useMemo(() => {
        if (!hasFormInFormFields) {
            return null;
        }

        return {
            field: "expand",
            headerName: "",
            minWidth: 120,
            width: 150,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            editable: false,
            align: "center" as const,
            headerAlign: "center" as const,
            renderHeader: () => renderExpandAllHeader(),
            renderCell: ({ row }: { row: Row }) => renderRowExpandIcon(row),
        };
    }, [hasFormInFormFields, renderExpandAllHeader, renderRowExpandIcon]);

    const getDetailPanelContent = useCallback((params: GridRowParams): JSX.Element => {
        if (!hasFormInFormFields || !form) {
            return <Box />;
        }

        return (
            <ExpandedRowContent
                parentRowId={params.row?.id}
                parentFormId={form.id}
                parentFormFields={form.fields || []}
                childrenFormsData={childrenFormsData}
                isInEditMode={isInEditMode}
            />
        );
    }, [hasFormInFormFields, form, childrenFormsData, isInEditMode]);

    const getDetailPanelHeight = useCallback(() => {
        return 'auto' as const;
    }, []);

    const detailPanelExpandedRowIds = useMemo(() => {
        const gridRowIds = new Set<GridRowId>();
        expandedRowIds.forEach(id => {
            gridRowIds.add(Number(id) as GridRowId);
        });
        return gridRowIds;
    }, [expandedRowIds]);

    return {
        expandColumn,
        getDetailPanelContent: hasFormInFormFields ? getDetailPanelContent : undefined,
        getDetailPanelHeight: hasFormInFormFields ? getDetailPanelHeight : undefined,
        detailPanelExpandedRowIds,
    };
};
