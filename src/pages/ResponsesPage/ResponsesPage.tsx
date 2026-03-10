import { useParams } from "react-router";
import { useMemo, useState } from "react";

import Loader from "../../components/Responses/Loader";
import { Row, User } from "../../utils/interfaces";
import { FormActionsToolbar } from "./components/FormActionsToolbar";
import { EditResponsesButton } from "./components/EditResponsesButton";
import AddResponseButton from "./components/AddResponseButton";
import { RowActionsButtons } from "./components/RowActionsButtons";
import { CancelEditDialog } from "./components/CancelEditDialog";
import { useFormLoader } from "./hooks/useFormLoader";
import { useResponsesEdit } from "./hooks/useResponsesEdit";
import { useFormStore } from "./stores/form.store";
import { MainContentWrapper, PageWrapper, TopSection, ActionsRow, CenteredBox } from "./styled";
import SearchInfo from "../../components/Responses/SearchInfo";
import { ResponsesTable } from "./components/ResponsesTable";
import Header from "./components/Header";
import { GridRowId, GridRowSelectionModel } from "@mui/x-data-grid-pro";
import { useResponsesViews } from "./hooks/useResponsesViews";
import { ViewsButton } from "./components/ViewsButton";
import SidePanel from "../../components/SidePanel/SidePanel";
import { useAuth } from "../../contexts/AuthContext";

interface ResponsesPageProps {
  user: User | null;
  shouldRefreshPage: boolean;
  setShouldRefreshPage: (shouldRefresh: boolean) => void;
}

export default function ResponsesPage({
  user,
  shouldRefreshPage,
  setShouldRefreshPage,
}: ResponsesPageProps) {
  const { id: formId } = useParams<string>();
  const { isLoading, isError } = useFormLoader(formId || "");

  if (isLoading) {
    return (
      <CenteredBox>
        <Loader />
      </CenteredBox>
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

  // TEMPORARY: client-side search filter — remove once backend search is wired through SearchInfo.
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

  const {
    isSidePanelOpen,
    setIsSidePanelOpen,
    currentViewConfig,
    currentView,
    savedViews,
    isSaving,
    handleSaveView,
    handleLoadView,
    handleDeleteView,
    handleApplyView,
  } = useResponsesViews();

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

  const { form, permissions } = useFormStore();
  const { user } = useAuth();

  const sidePanelForm = useMemo(
    () =>
      form
        ? {
          id: String(form.id),
          name: form.name ?? "",
          fields: (form.fields ?? []).map((f) => ({
            uniqueId: String(f.uniqueId ?? f.name),
            name: f.name ?? "",
            displayName: f.displayName ?? f.name ?? "",
            required: !!f.required,
            index: f.index ?? 0,
            fieldType: String(f.typeId ?? ""),
          })),
        }
        : undefined,
    [form?.id, form?.fields],
  );

  const sidePanelUser = useMemo(
    () =>
      user
        ? { upn: user.upn, firstName: user.firstName, lastName: user.lastName }
        : undefined,
    [user?.upn, user?.firstName, user?.lastName],
  );

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
          <SearchInfo search={search} setSearch={setSearch} />
          <ViewsButton
            isSidePanelOpen={isSidePanelOpen}
            setIsSidePanelOpen={setIsSidePanelOpen}
          />
        </TopSection>
        <ResponsesTable
          isInEditMode={isInEditMode}
          localRows={displayedRows}
          handleProcessRowUpdate={handleProcessRowUpdate}
          onCellEditStart={handleCellEditStart}
          validationErrors={validationErrors}
          onCellLiveChange={handleCellLiveChange}
          onRowSelectionModelChange={setRowSelectionModel}
          currentViewConfig={currentViewConfig}
        />
        <CancelEditDialog
          open={showCancelDialog}
          onConfirm={handleConfirmCancel}
          onCancel={handleCancelDialogClose}
        />
      </MainContentWrapper>

      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        title="ניהול תצוגות"
        form={sidePanelForm}
        user={sidePanelUser}
        onSaveView={handleSaveView}
        onLoadView={handleLoadView}
        onDeleteView={handleDeleteView}
        onApplyView={handleApplyView}
        currentView={currentView}
        savedViews={savedViews}
        permissionTypes={permissions}
        isSaving={isSaving}
      />
    </PageWrapper>
  );
};
