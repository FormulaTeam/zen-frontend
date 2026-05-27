import { GridRowId, GridRowModel, GridRowSelectionModel } from "@mui/x-data-grid-pro";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Tooltip, IconButton, Typography } from "@mui/material";
import Delete from "@mui/icons-material/Delete";

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
import { PermissionGate } from "@src/components/PermissionGate/PermissionGate";
import { permission } from "formula-gear";
import DraftRecoveryBanner from "../../components/BasePopup/DraftRecoveryBanner";
import { clearQuickEditDraft, getQuickEditDraft } from "../FormEditor/utils/draftPersistence";
import { showErrorNotification, showSuccessNotification } from "@utils/utils";

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

  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any>(null);

  useEffect(() => {
    const draft = getQuickEditDraft(form?.id);
    if (draft && (draft.editedRows.length > 0 || draft.deletedRowIds?.length > 0)) {
      setPendingDraft(draft);
      setShowRestoreBanner(true);
    }
  }, [form?.id]);

  const handleRestore = () => {
    if (pendingDraft) {
      setIsInEditMode(true);
      setEditedRows(new Map(pendingDraft.editedRows));
      setLocalRows(pendingDraft.localRows);
      setDeletedRowIds(pendingDraft.deletedRowIds || []);
    }
    setShowRestoreBanner(false);
    setPendingDraft(null);
  };

  const handleDiscardDraft = () => {
    clearQuickEditDraft(form?.id);
    setShowRestoreBanner(false);
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
    if (!isInEditMode && !showRestoreBanner) {
      const draft = getQuickEditDraft(form?.id);
      if (draft && (draft.editedRows.length > 0 || draft.deletedRowIds?.length > 0)) {
        setPendingDraft(draft);
        setShowRestoreBanner(true);
      }
    }
  }, [isInEditMode, form?.id, showRestoreBanner]);

  const sidePanelForm: SidePanelForm | undefined = useMemo(() => {
    if (!form) return undefined;
    return {
      id: form.id,
      name: form.name,
      fields: form.sections.flatMap((s) => s.fields),
    };
  }, [form]);

  const sidePanelUser = useMemo(() => {
    if (!user) return undefined;
    return {
      id: (user as any).id?.toString() || user.upn || "",
      upn: user.upn,
      role_id: 1,
    };
  }, [user]);

  const selectedRows = useMemo(() => {
    const ids = Array.from(rowSelectionModel.ids as Set<GridRowId>);
    return storeRows.filter((row) => ids.includes(row.id));
  }, [rowSelectionModel.ids, storeRows]);

  const handleRowSelectionModelChange = useCallback((model: GridRowSelectionModel) => {
    setRowSelectionModel(model);
  }, []);

  return (
    <PageWrapper>
      <Header />
      <TopSection>
        <ActionsRow>
          <AddResponseButton />

          <EditResponsesButton
            isInEditMode={isInEditMode}
            hasUnsavedChanges={hasUnsavedChanges}
            onToggleEditMode={handleToggleEditMode}
            onSaveChanges={handleSaveChanges}
            onAddNewResponse={handleAddNewResponse}
            isUpdating={isUpdating}
            permissions={permissions}
          />

          <ViewsButton
            isSidePanelOpen={isSidePanelOpen}
            setIsSidePanelOpen={setIsSidePanelOpen}
            hasSavedViews={hasSavedViews}
            savedViews={savedViews}
            selectedViewId={selectedViewId}
            defaultViewId={defaultViewId}
            handleViewDropdownChange={handleViewDropdownChange}
          />

          {selectedRows.length > 0 && (
            <Tooltip title="מחיקת תגובות נבחרות">
              <IconButton color="error" onClick={() => handleDeleteResponses(selectedRows as any)}>
                <Delete />
              </IconButton>
            </Tooltip>
          )}
        </ActionsRow>

        <SearchInfo search={search} setSearch={setSearch} />
      </TopSection>

      <MainContentWrapper>
        <ResponsesTable
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={handleRowSelectionModelChange}
          isInEditMode={isInEditMode}
          localRows={localRows}
          handleProcessRowUpdate={handleProcessRowUpdate}
          onCellEditStart={handleCellEditStart}
          onCellLiveChange={handleCellLiveChange}
          validationErrors={validationErrors}
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

      <DraftRecoveryBanner
        open={showRestoreBanner}
        message="מצאנו טיוטה של עריכה מהירה עם שינויים שלא נשמרו."
        onRestore={handleRestore}
        onDiscard={handleDiscardDraft}
      />
    </PageWrapper>
  );
};
