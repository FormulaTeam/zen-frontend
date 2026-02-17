import { MRT_ColumnFiltersState, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_Hebrew } from "../utils/hebrew";
import { Edit } from "@mui/icons-material";
import { MRT_ActionMenuItem } from "material-react-table";
import { useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ViewColumn } from "../types/interfaces/tableViews.types";
import { useColumnVisibility } from "./useColumnVisibility";

interface ResponseForm {
  columns: any[];
  data: any[];
  searchCount: number;
  sorting: any[];
  setSorting: React.Dispatch<React.SetStateAction<any[]>>;
  pagination: any;
  setPagination: (val: any) => void;
  columnFilters: any[];
  setColumnFilters: React.Dispatch<React.SetStateAction<MRT_ColumnFiltersState>>;
  loadingInsideTable: boolean;
  rowSelection: any;
  setRowSelection: (val: any) => void;
  // getResponseDetails: (responseId: number) => JSX.Element | undefined;
  responsesWithChildren: any[];
  currentViewConfig?: ViewColumn[];
}

export const useResponsesTable = ({
  columns,
  data,
  searchCount,
  sorting,
  setSorting,
  pagination,
  setPagination,
  columnFilters,
  setColumnFilters,
  loadingInsideTable,
  rowSelection,
  setRowSelection,
  // getResponseDetails,
  responsesWithChildren,
  currentViewConfig,
}: ResponseForm) => {
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  // Use column visibility hook
  const { columnVisibility } = useColumnVisibility({
    columns,
    currentViewConfig,
  });

  const copyResponse = (rowData) => {
    if (rowData) {
      navigate(`/response/create/${rowData.form_id}/${rowData.id}`);
    }
  };

  // Create column order based on the columns array order
  const columnOrder = [
    "mrt-row-select",
    "mrt-row-expand",
    ...columns.map((col) => col.id || col.accessorKey),
  ];

  return useMaterialReactTable({
    columns,
    data,
    enableTopToolbar: showColumnFilters, // Show top toolbar only when filters are shown so we can hide them if needed
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
    rowCount: searchCount,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableHiding: false,
    positionExpandColumn: "last",
    localization: MRT_Localization_Hebrew,
    columnResizeMode: "onChange",
    enableGrouping: false,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableColumnFilters: true,
    enableColumnDragging: false,
    autoResetPageIndex: false,
    enableGlobalFilter: false,
    enableColumnActions: true,
    groupedColumnMode: false,
    paginationDisplayMode: "pages",
    initialState: {
      density: "spacious",
      columnVisibility,
      columnOrder,
    },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    onShowColumnFiltersChange: setShowColumnFilters,
    state: {
      rowSelection,
      isLoading: loadingInsideTable,
      sorting,
      pagination,
      columnFilters,
      showColumnFilters,
      columnVisibility,
      columnOrder,
    },
    muiPaginationProps: {
      color: "primary",
      shape: "rounded",
      variant: "outlined",
      showFirstButton: false,
      showLastButton: false,
    },
    muiToolbarAlertBannerChipProps: { color: "primary" },
    muiTopToolbarProps: {
      sx: {
        backgroundColor: theme.palette.tableHeader,
      },
    },
    enableEditing: false,
    enableCellActions: true,
    enableClickToCopy: "context-menu",
    muiTableHeadRowProps: {
      sx: {
        backgroundColor: theme.palette.tableHeader,
      },
    },
    muiTableContainerProps: {
      sx: {
        flex: "1 1 0",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        overflow: "hidden",
        ".Mui-TableHeadCell-Content-Labels, .Mui-TableHeadCell-Content-Wrapper": {
          width: "100%",
          whiteSpace: "nowrap",
        },
      },
    },
    muiTableHeadProps: { sx: { backgroundColor: theme.palette.background.paper } },
    muiTablePaperProps: {
      sx: {
        flex: "1 1 0",
        display: "flex",
        flexFlow: "column",
      },
    },
    muiTableBodyProps: {
      sx: {
        ".MuiTableRow-root:nth-of-type(odd)": {
          backgroundColor: `${theme.palette.background.paper} !important`,
        },
      },
    },
    renderCellActionMenuItems: ({ closeMenu, row, table }) => [
      <MRT_ActionMenuItem
        icon={<Edit />}
        key={1}
        label="שכפול תגובה"
        onClick={() => {
          copyResponse(row?.original);
          closeMenu();
        }}
        table={table}
      />,
    ],
    muiTableBodyCellProps: () => ({
      style: { justifyContent: "start" },
    }),

    // renderDetailPanel:
    //   responsesWithChildren.length > 0
    //     ? ({ row }) => {
    //         return getResponseDetails(row?.original.id);
    //       }
    //     : undefined,
    muiDetailPanelProps: {
      sx: {
        "& .MuiCollapse-root": {
          width: "100%",
        },
      },
    },
  });
};
