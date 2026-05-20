import { GridRowId, GridRowModel, GridRowSelectionModel } from "@mui/x-data-grid-pro";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";

import SidePanel from "../../components/SidePanel/SidePanel";
import SearchInfo from "../../components/Responses/SearchInfo";
import { useAuth } from "../../contexts/AuthContext";
import { AddResponseButton } from "./components/AddResponseButton";
import { CancelEditDialog } from "./components/CancelEditDialog";
import { EditResponsesButton } from "./components/EditResponsesButton";
import { FormActionsToolbar } from "./components/FormActionsToolbar";
import Header from "./components/Header";
import Loader from "../../components/Responses/Loader";
import { ResponsesTable } from "./components/ResponsesTable";
import { RowActionsButtons } from "./components/RowActionsButtons";
import { ViewsButton } from "./components/ViewsButton";
import { useFormLoader } from "./hooks/useFormLoader";
import { useResponsesEdit } from "./hooks/useResponsesEdit";
import { useResponsesViews } from "./hooks/useResponsesViews";
import { useFormStore } from "./stores/form.store";
import { ActionsRow, CenteredBox, MainContentWrapper, PageWrapper, TopSection } from "./styled";
import { FormDto, FormFieldDto } from "../../types/shared";
import { PermissionGate } from "@src/components/PermissionGate";
import { permission } from "formula-gear";
import DraftRecoveryDialog from "../../components/BasePopup/DraftRecoveryDialog";
import { clearQuickEditDraft, getQuickEditDraft } from "../FormEditor/utils/draftPersistence";

type ResponsePageRow = GridRowModel & {
  id: string | number;
  [key: string]: unknown;
};

type SidePanelForm = Pick<FormDto, "id" | "name"> & {
  fields: FormFieldDto[];
};

interface ResponsesPageProps {
  user: unknown | null;
  shouldRefreshPage: boolean;
  setShouldRefreshPage: (shouldRefresh: boolean) => void;
}

export default function ResponsesPage({
  user,
  shouldRefreshPage,
  setShouldRefreshPage,
}: ResponsesPageProps) {
  void user;
  void shouldRefreshPage;
  void setShouldRefreshPage;

  const { id: formId } = useParams<string>();
  const { isLoading, isError } = useFormLoader(formId || "");

  if (isLoading) {
    return (
      <CenteredBox>
        <Loader />
      </CenteredBox>
    );
  }

  if (isError) return <div>Error loading form data.</div>;

  return <ResponsesPageContent />;
}

const ResponsesPageContent = (): JSX.Element => {
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set<GridRowId>(),
  });

  const [search, setSearch] = useState<string>("");
  const { rows: storeRows, form, permissions, filter, setFilter } = useFormStore();
  const { user } = useAuth();

  const {
    isInEditMode,
    setIsInEditMode,
    editedRows,
    setEditedRows,
    deletedRowIds,
    setDeletedRowIds,
    hasUnsavedChanges,
    editedRowsCount,
    localRows,
    setLocalRows,
    validationErrors,
    handleCellLiveChange,
    handleDeleteResponses,
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

  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any>(null);

  useEffect(() => {
    const draft = getQuickEditDraft(form?.id);
    if (draft && (draft.editedRows.length > 0 || draft.deletedRowIds?.length > 0)) {
      setPendingDraft(draft);
      setShowRestoreDialog(true);
    }
  }, [form?.id]);

  const handleRestore = () => {
    if (pendingDraft) {
      setIsInEditMode(true);
      setEditedRows(new Map(pendingDraft.editedRows));
      setLocalRows(pendingDraft.localRows);
      setDeletedRowIds(pendingDraft.deletedRowIds || []);
    }
    setShowRestoreDialog(false);
    setPendingDraft(null);
  };

  const handleDiscardDraft = () => {
    clearQuickEditDraft(form?.id);
    setShowRestoreDialog(false);
    setPendingDraft(null);
  };

  const {
    isSidePanelOpen,
    setIsSidePanelOpen,
    currentViewConfig,
    currentView,
    savedViews,
    hasSavedViews,
    selectedViewId,
    defaultViewId,
    handleViewDropdownChange,
    handleLoadView,
    handleDeleteView,
    handleApplyView,
    handleSaveView,
    isSaving,
  } = useResponsesViews();
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter((prev) => ({
        ...prev,
        query: search,
        before: undefined,
        after: undefined,
        pageNumber: 1,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [search, setFilter]);

  const displayedRows = useMemo<ResponsePageRow[]>(() => {
    return (isInEditMode ? localRows : storeRows) as ResponsePageRow[];
  }, [storeRows, localRows, isInEditMode]);

  const selectedIds: GridRowId[] = Array.from(rowSelectionModel.ids);
  const hasSelection = rowSelectionModel.type === "include" ? selectedIds.length > 0 : true;

  const handleRowDeleted = () => {
    setRowSelectionModel({ type: "include", ids: new Set<GridRowId>() });
  };

  const sidePanelForm = useMemo<SidePanelForm | undefined>(() => {
    if (!form) {
      return undefined;
    }

    // Use form.fields which is already hierarchically sorted by useFormLoader
    return {
      id: form.id,
      name: form.name ?? "",
      fields: form.fields,
    };
  }, [form]);

  const sidePanelUser = useMemo(() => {
    if (!user) {
      return undefined;
    }

    const safeUpn = (user as any)?.upn || (user as any)?.UPN || "";
    const safeEmail = (user as any)?.email || (user as any)?.mail || "";

    let displayName = (user as any)?.name || "";
    if (!displayName) {
      const firstName = (user as any)?.firstName || "";
      const lastName = (user as any)?.lastName || "";
      displayName = `${firstName} ${lastName}`.trim();
    }

    return {
      ...user,
      name: displayName || safeUpn || safeEmail,
      upn: safeUpn,
      email: safeEmail,
    };
  }, [user]);

  const handleRowSelectionModelChange = useCallback((model: GridRowSelectionModel) => {
    setRowSelectionModel(model);
  }, []);

  return (
    <PageWrapper>
      <MainContentWrapper>
        <TopSection sx={{ alignItems: "center", gap: 3 }}>
          <Header />
          <SearchInfo search={search} setSearch={setSearch} />
          <FormActionsToolbar />
        </TopSection>
        <TopSection>
          <ActionsRow>
            {hasSelection ? (
              <RowActionsButtons
                rowSelectionModel={rowSelectionModel}
                onDeleted={handleRowDeleted}
                onDeleteResponses={handleDeleteResponses}
                currentUserUpn={sidePanelUser?.upn}
              />
            ) : (
              <>
                {!isInEditMode && <AddResponseButton />}
                <EditResponsesButton
                  isInEditMode={isInEditMode}
                  hasUnsavedChanges={hasUnsavedChanges}
                  isUpdating={isUpdating}
                  onToggleEditMode={handleToggleEditMode}
                  onSaveChanges={handleSaveChanges}
                  onAddNewResponse={handleAddNewResponse}
                  permissions={permissions}
                />
              </>
            )}
          </ActionsRow>
          <PermissionGate requiredPermissions={[permission.MarkMyResponsesViewPublic]} userPermissions={permissions ?? []}>
            <ViewsButton
              isSidePanelOpen={isSidePanelOpen}
              setIsSidePanelOpen={setIsSidePanelOpen}
              hasSavedViews={hasSavedViews}
              savedViews={savedViews}
              selectedViewId={selectedViewId}
              defaultViewId={defaultViewId}
              handleViewDropdownChange={handleViewDropdownChange}
            />
          </PermissionGate>
        </TopSection>
        <ResponsesTable
          isInEditMode={isInEditMode}
          localRows={displayedRows}
          handleProcessRowUpdate={handleProcessRowUpdate}
          onCellEditStart={handleCellEditStart}
          validationErrors={validationErrors}
          onCellLiveChange={handleCellLiveChange}
          onRowSelectionModelChange={handleRowSelectionModelChange}
          currentView={currentView}
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

      <DraftRecoveryDialog
        open={showRestoreDialog}
        description="מצאנו טיוטה של עריכה מהירה עם שינויים שלא נשמרו. האם תרצה לשחזר אותם?"
        onRestore={handleRestore}
        onDiscard={handleDiscardDraft}
      />
    </PageWrapper>
  );
};
