// useDetailPanel.tsx
import { useCallback, useMemo } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { GridColDef, GridRowId, GridRowParams } from "@mui/x-data-grid-pro";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import { Row } from "@utils/interfaces";
import { useRowExpansion } from "./useRowExpansion";
import { ExpandIconBox } from "../styled";
import { ExpandedRowContent } from "../components/childForms/ExpandedRowContent";
import { ViewColumn } from "../../../types/interfaces/tableViews.types";
import { FormDto, FormFieldDto } from "../../../types/shared";
import { fieldType } from "formula-gear";

type EditorFieldExtra = {
  connectedFormId?: number;
};

type ChildFormData = {
  form: FormDto;
  rows: Row[];
};

interface UseDetailPanelProps {
  form: FormDto | null;
  rows: Row[];
  hasFormInFormFields: boolean;
  childrenFormsData: ChildFormData[];
  isInEditMode: boolean;
  getChildFormData: (formId: number) => ChildFormData | undefined;
  currentViewConfig?: ViewColumn[];
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
}: UseDetailPanelProps): UseDetailPanelReturn => {
  const formFields = useMemo<FormFieldDto[]>(
    () => (form?.sections ?? []).flatMap((section) => section.fields ?? []),
    [form],
  );

  const visibleFormInFormFieldIds = useMemo((): Set<string> | null => {
    if (!currentViewConfig || currentViewConfig.length === 0) {
      return null;
    }

    const visibleIds = new Set<string>();
    currentViewConfig.forEach((viewColumn) => {
      if (viewColumn.visible) {
        visibleIds.add(viewColumn.columnId);
      }
    });
    return visibleIds;
  }, [currentViewConfig]);

  const getChildRowsForParent = useCallback(
    (parentRowId: string | number, connectedFormId: number): Row[] => {
      const childFormData = getChildFormData(connectedFormId);
      if (!childFormData) {
        return [];
      }

      return childFormData.rows.filter((row) => {
        const parentResponse = row.parentResponse?.split(";") || [];
        const parentResId = parentResponse[1];
        return parentResId === String(parentRowId);
      });
    },
    [getChildFormData],
  );

  const rowHasChildren = useCallback(
    (rowId: string | number): boolean => {
      if (!hasFormInFormFields || formFields.length === 0) {
        return false;
      }

      const formInFormFields = formFields.filter((field) => {
        if (field.fieldType !== fieldType.Form) {
          return false;
        }

        if (visibleFormInFormFieldIds !== null) {
          return visibleFormInFormFieldIds.has(field.id);
        }

        return true;
      });

      return formInFormFields.some((field) => {
        const connectedFormId = getFieldExtra(field).connectedFormId;
        if (!connectedFormId) {
          return false;
        }

        const childRows = getChildRowsForParent(rowId, connectedFormId);
        return childRows.length > 0;
      });
    },
    [hasFormInFormFields, formFields, getChildRowsForParent, visibleFormInFormFieldIds],
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
          isInEditMode={isInEditMode}
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
