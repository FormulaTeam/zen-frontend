import { useParams } from "react-router";
import { useMemo, useState } from "react";

import Loader from "../../components/Responses/Loader";
import { Role, Row, User } from "../../utils/interfaces";
import { FormActionsToolbar } from "./components/FormActionsToolbar";
import { EditResponsesButton } from "./components/EditResponsesButton";
import AddResponseButton from "./components/AddResponseButton";
import { RowActionsButtons } from "./components/RowActionsButtons";
import { CancelEditDialog } from "./components/CancelEditDialog";
import { useFormLoader } from "./hooks/useFormLoader";
import { useResponsesEdit } from "./hooks/useResponsesEdit";
import { useFormStore } from "./stores/form.store";
import { MainContentWrapper, PageWrapper, TopSection, ActionsRow } from "./styled";
import SearchInfo from "../../components/Responses/SearchInfo";
import { ResponsesTable } from "./components/ResponsesTable";
import Header from "./components/Header";
import Tooltip from "@mui/material/Tooltip";
import { ViewManageButton } from "@components/Responses/styled";
import { BackupTable } from "@mui/icons-material";
import { GridRowId, GridRowSelectionModel } from "@mui/x-data-grid-pro";

interface ResponsesPageProps {
  user: User | null;
  shouldRefreshPage: boolean;
  setShouldRefreshPage: (shouldRefresh: boolean) => void;
  roles: Role[];
}

export default function ResponsesPage({
  user,
  shouldRefreshPage,
  setShouldRefreshPage,
  roles,
}: ResponsesPageProps) {
  const { id: formId } = useParams<string>();
  const { isLoading, isError } = useFormLoader(formId || "");

  if (isLoading) {
    return (
      <div style={{ margin: "auto" }}>
        <Loader />
      </div>
    );
  }

  if (isError) {
    return <div>Error loading form data.</div>;
  }

  return <ResponsesPageContent />;
}

const ResponsesPageContent = (): JSX.Element => {
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set<GridRowId>(),
  });

  // ---------------------------------------------------------------------------
  // TEMPORARY: Frontend-only search filter.
  // This is a basic client-side filter applied over the already-loaded rows.
  // Once backend search is wired through SearchInfo, remove:
  //   - the `search` / `setSearch` state below
  //   - the `displayedRows` memo
  //   - the `search` / `setSearch` props on <SearchInfo>
  //   - the `localRows={displayedRows}` prop override on <ResponsesTable>
  //     (revert to `localRows={localRows}`)
  // ---------------------------------------------------------------------------
  const [search, setSearch] = useState<string>("");
  const { rows: storeRows } = useFormStore();

  const {
    isInEditMode,
    editedRowsCount,
    localRows,
    validationErrors,
    handleCellLiveChange,
    isUpdating,
    showCancelDialog,
    handleToggleEditMode,
    handleCellEditStart,
    handleProcessRowUpdate,
    handleSaveChanges,
    handleConfirmCancel,
    handleCancelDialogClose,
    handleAddNewResponse,
  } = useResponsesEdit();

  // TEMPORARY: Filter rows client-side by search term across all string fields.
  // Filters from the store's rows (source of truth) so it works in both view and edit mode.
  // Remove this memo when backend search is connected (see comment above).
  const displayedRows = useMemo<Row[]>(() => {
    const trimmed = search.trim().toLowerCase();
    if (!trimmed) {
      return isInEditMode ? localRows : storeRows;
    }
    const sourceRows = isInEditMode ? localRows : storeRows;
    return sourceRows.filter((row) =>
      Object.values(row).some((val) => {
        if (val == null) {
          return false;
        }
        return String(val).toLowerCase().includes(trimmed);
      }),
    );
  }, [storeRows, localRows, isInEditMode, search]);

  const selectedIds: GridRowId[] = Array.from(rowSelectionModel.ids);
  const hasSelection = rowSelectionModel.type === "include"
    ? selectedIds.length > 0
    : true;

  const handleRowDeleted = () => {
    setRowSelectionModel({ type: "include", ids: new Set<GridRowId>() });
  };

  return (
    <PageWrapper>
      <MainContentWrapper>
        <TopSection>
          <Header />
          <FormActionsToolbar />
        </TopSection>
        <TopSection>
          <ActionsRow>
            {hasSelection ? (
              <RowActionsButtons
                rowSelectionModel={rowSelectionModel}
                onDeleted={handleRowDeleted}
              />
            ) : (
              <>
                {!isInEditMode && <AddResponseButton />}
                <EditResponsesButton
                  isInEditMode={isInEditMode}
                  editedRowsCount={editedRowsCount}
                  isUpdating={isUpdating}
                  onToggleEditMode={handleToggleEditMode}
                  onSaveChanges={handleSaveChanges}
                  onAddNewResponse={handleAddNewResponse}
                />
              </>
            )}
          </ActionsRow>
          {/* TEMPORARY: pass search state for frontend-only filtering (remove when backend search is ready) */}
          <SearchInfo search={search} setSearch={setSearch} />
          <Tooltip title="ניהול תצוגות">
            <span>
              <ViewManageButton
                variant="contained"
                onClick={() => { }} disabled={false}>
                <BackupTable />
                <span>ניהול תצוגות</span>
              </ViewManageButton>
            </span>
          </Tooltip>
        </TopSection>
        {/* TEMPORARY: using `displayedRows` (frontend-filtered) instead of `localRows` — revert to `localRows` when backend search is connected */}
        <ResponsesTable
          isInEditMode={isInEditMode}
          localRows={displayedRows}
          handleProcessRowUpdate={handleProcessRowUpdate}
          onCellEditStart={handleCellEditStart}
          validationErrors={validationErrors}
          onCellLiveChange={handleCellLiveChange}
          onRowSelectionModelChange={setRowSelectionModel}
        />
        <CancelEditDialog
          open={showCancelDialog}
          onConfirm={handleConfirmCancel}
          onCancel={handleCancelDialogClose}
        />
      </MainContentWrapper>
    </PageWrapper>
  );
};
