import { useCallback, useMemo } from "react";
import { Box, IconButton, Tooltip, Stack, Typography } from "@mui/material";
import { GridColDef, GridRowId, GridRowParams, GRID_DETAIL_PANEL_TOGGLE_FIELD } from "@mui/x-data-grid-pro";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import { Row } from "@utils/interfaces";
import { useRowExpansion } from "./useRowExpansion";
import { ExpandIconBox } from "../styled";
import { ExpandedRowContent } from "../components/childForms/ExpandedRowContent";
import { ResponsesViewColumn } from "../../../types/interfaces/tableViews.types";
import { FormDto, FormFieldDto } from "../../../types/shared";
import { fieldType } from "formula-gear";
import { FieldTypeIds } from "../../../utils/interfaces";

type EditorFieldExtra = {
    connectedFormId?: number | string;
    linkedFormId?: number | string;
}; type ChildFormData = {
    form: FormDto;
    rows: Row[];
};

interface UseDetailPanelProps {
    form: FormDto | null;
    rows: Row[];
    hasFormInFormFields: boolean;
    childrenFormsData: ChildFormData[];
    isInEditMode: boolean;
    getChildFormData: (formId: number | string) => ChildFormData | undefined;
    currentViewConfig?: ResponsesViewColumn[];
    searchQuery?: string;
}

interface UseDetailPanelReturn {
    expandColumn: GridColDef | null;
    getDetailPanelContent: ((params: GridRowParams) => JSX.Element) | undefined;
    getDetailPanelHeight: (() => "auto") | undefined;
    detailPanelExpandedRowIds: Set<GridRowId>;
}

const getFieldExtra = (field: FormFieldDto): EditorFieldExtra =>
    (field.extra as EditorFieldExtra | undefined) ?? {};

export const useDetailPanel = ({
    form,
    rows,
    hasFormInFormFields,
    childrenFormsData,
    isInEditMode,
    getChildFormData,
    currentViewConfig,
    searchQuery,
}: UseDetailPanelProps): UseDetailPanelReturn => {
    const formFields = useMemo<FormFieldDto[]>(() => {
        const sectionsFields = (form?.sections ?? []).flatMap((section) => section.fields ?? []);
        if (sectionsFields.length > 0) return sectionsFields;
        return (form as any)?.fields ?? [];
    }, [form]);

    const visibleFormInFormFieldIds = useMemo((): Set<string> | null => {
        if (!currentViewConfig || currentViewConfig.length === 0) {
            return null;
        }

        const visibleIds = new Set<string>();
        currentViewConfig.forEach((vc: any) => {
            if (vc.isVisible ?? vc.visible) {
                visibleIds.add(vc.fieldId || vc.columnId);
            }
        });
        return visibleIds;
    }, [currentViewConfig]);

    const getChildRowsForParent = useCallback(
        (parentRowId: string | number, connectedFormId: number | string): Row[] => {
            const parentRow = rows.find(r => String(r.id) === String(parentRowId));
            if (!parentRow || !parentRow.childResponses) {
                return [];
            }

            const childFormData = getChildFormData(connectedFormId);
            if (!childFormData) {
                return [];
            }

            // Map child responses to Row format
            return (parentRow.childResponses as any[]).filter(cr => String(cr.formId) === String(connectedFormId)).map((node: any) => {
                const row: Row = {
                    id: node.id,
                    edited: node.updatedAt,
                    editedByName: node.updatedBy?.name,
                    created: node.createdAt,
                    createdByName: node.createdBy?.name,
                    index: node.index,
                    form_id: node.formId,
                };

                // Map field IDs to displayNames using the form's fields or sections
                const fieldIdToDisplayName = new Map<string, string>();
                const childFormFields = (childFormData.form as any).fields?.length
                    ? (childFormData.form as any).fields
                    : (childFormData.form.sections ?? []).flatMap(s => s.fields ?? []);

                childFormFields.forEach((field) => {
                    fieldIdToDisplayName.set(field.id, field.displayName);
                });

                const fieldValues = node.fieldValues || node.data || [];
                fieldValues.forEach((fv: any) => {
                    const fieldId = fv.fieldId;
                    const displayName = fieldIdToDisplayName.get(fieldId);
                    if (displayName) {
                        row[displayName] = fv.value;
                    }
                });

                return row;
            });
        },
        [getChildFormData, rows],
    );

    const getChildRowsLengthForParent = useCallback(
        (parentRowId: string | number, connectedFormId: number | string): number => {
            const parentRow = rows.find(r => String(r.id) === String(parentRowId));
            if (!parentRow || !parentRow.childResponses) {
                return 0;
            }
            return (parentRow.childResponses as any[]).filter(cr => String(cr.formId) === String(connectedFormId)).length;
        }, [rows]
    );

    const rowHasChildren = useCallback(
        (rowId: string | number): boolean => {
            if (!hasFormInFormFields || formFields.length === 0) {
                return false;
            }

            const formInFormFields = formFields.filter((field) => {
                const isFormType = field.fieldType === fieldType.Form ||
                    (field as any).typeId === FieldTypeIds.linkedForm ||
                    (field as any).fieldType === FieldTypeIds.linkedForm;

                if (!isFormType) {
                    return false;
                }

                if (visibleFormInFormFieldIds !== null) {
                    return visibleFormInFormFieldIds.has(field.id);
                }

                return true;
            });

            return formInFormFields.some((field) => {
                const connectedFormId = getFieldExtra(field).connectedFormId || getFieldExtra(field).linkedFormId;
                if (!connectedFormId) {
                    return false;
                }

                return getChildRowsLengthForParent(rowId, connectedFormId) > 0;
            });
        },
        [hasFormInFormFields, formFields, getChildRowsLengthForParent, visibleFormInFormFieldIds],
    );

    const { expandedRowIds, toggleRowExpanded, toggleAllExpanded, isRowExpanded, allExpanded } =
        useRowExpansion({
            rows,
            canRowExpand: rowHasChildren,
        });

    const renderRowExpandIcon = useCallback(
        (row: Row): JSX.Element => {
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
                            }}>
                            {rowIsExpanded ? (
                                <KeyboardArrowUpIcon fontSize="small" />
                            ) : (
                                <KeyboardArrowDownIcon fontSize="small" />
                            )}
                        </IconButton>
                    </Tooltip>
                </ExpandIconBox>
            );
        },
        [rowHasChildren, isRowExpanded, hasFormInFormFields, toggleRowExpanded],
    );

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
                        }}>
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
            field: GRID_DETAIL_PANEL_TOGGLE_FIELD,
            headerName: "",
            minWidth: 80,
            width: 80,
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

    const getDetailPanelContent = useCallback(
        (params: GridRowParams): JSX.Element => {
            if (!hasFormInFormFields || !form) {
                return <Box />;
            }

            const visibleParentFields =
                visibleFormInFormFieldIds !== null
                    ? formFields.filter((field) => visibleFormInFormFieldIds.has(field.id))
                    : formFields;

            return (
                <ExpandedRowContent
                    parentRowId={params.row?.id}
                    parentFormId={form.id}
                    parentFormFields={visibleParentFields}
                    childrenFormsData={childrenFormsData}
                    getChildRowsForParent={getChildRowsForParent}
                    isInEditMode={isInEditMode}
                    searchQuery={searchQuery}
                />
            );
        },
        [
            hasFormInFormFields,
            form,
            formFields,
            childrenFormsData,
            isInEditMode,
            visibleFormInFormFieldIds,
            searchQuery,
        ],
    );


    const getDetailPanelHeight = useCallback(() => {
        return "auto" as const;
    }, []);

    const detailPanelExpandedRowIds = useMemo(() => {
        const gridRowIds = new Set<GridRowId>();
        expandedRowIds.forEach((id) => {
            gridRowIds.add(id as GridRowId);
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
