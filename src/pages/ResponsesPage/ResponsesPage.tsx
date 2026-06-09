import { GridRowId, GridRowModel, GridRowSelectionModel } from "@mui/x-data-grid-pro";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Box, Tooltip, IconButton } from "@mui/material";
import Delete from "@mui/icons-material/Delete";
import { StatusCodes } from "http-status-codes";

import SidePanel from "../../components/SidePanel/SidePanel";
import SearchInfo from "../../components/Responses/SearchInfo";
import { useAuth } from "../../contexts/AuthContext";
import { AddResponseButton } from "./components/AddResponseButton";
import { EditResponsesButton } from "./components/EditResponsesButton";
import { FormActionsToolbar } from "./components/FormActionsToolbar";
import Header from "./components/Header";
import Loader from "../../components/Responses/Loader";
import { ResponsesTable } from "./components/ResponsesTable";
import { ViewsButton } from "./components/ViewsButton";
import { useFormLoader } from "./hooks/useFormLoader";
import { useResponsesEdit } from "./hooks/useResponsesEdit";
import { useResponsesViews } from "./hooks/useResponsesViews";
import { useFormStore } from "./stores/form.store";
import {
  CenteredBox,
  MainContentWrapper,
  PageWrapper,
  TopSection,
  MetadataLine,
  ActionLine,
} from "./styled";
import { FormDto, FormFieldDto } from "../../types/shared";
import DraftRecoveryBanner from "../../components/BasePopup/DraftRecoveryBanner";
import { getQuickEditDraft, clearQuickEditDraft } from "../FormEditor/utils/draftPersistence";
import UnsavedChangesDialog from "../../components/BasePopup/UnsavedChangesDialog";
import ConfirmDeleteDialog from "../../components/BasePopup/ConfirmDeleteDialog";

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

  const navigate = useNavigate();
  const { id: formId } = useParams<string>();
  const { isLoading, isError, error } = useFormLoader(formId || "");

  useEffect(() => {
    if (isError && error) {
      const status = (error as any).response?.status;
      if (status === StatusCodes.NOT_FOUND || status === StatusCodes.FORBIDDEN) {
        navigate("/error", { replace: true });
      }
    }
  }, [isError, error, navigate]);

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

  const { rows: storeRows, form, permissions, filter, setFilter } = useFormStore();
  const { user } = useAuth();

  const handleSearch = (val: string) => {
    setFilter({
      ...(filter || {}),
      query: val,
      pageNumber: 1,
      before: undefined,
      after: undefined,
    });
  };

  const {
    isInEditMode,
    setIsInEditMode,
    editedRows,
    setEditedRows,
    deletedRowIds,
    setDeletedRowIds,
    hasUnsavedChanges,
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
    handleDuplicateResponse,
    pendingDeleteIds,
    confirmDelete,
    cancelDelete,
  } = useResponsesEdit();

  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any>(null);

  // Hook to block navigation if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handlePopState = () => {
      if (hasUnsavedChanges) {
        window.history.pushState(null, "", window.location.href);
        handleToggleEditMode(); // This triggers the showCancelDialog internally via useResponsesEdit
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges, handleToggleEditMode]);

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
    currentView,
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
    const { type, ids } = rowSelectionModel;
    const idSet = ids as Set<GridRowId>;

    const sourceRows = isInEditMode && localRows.length > 0 ? localRows : storeRows;

    if (type === "include") {
      return sourceRows.filter((row) => idSet.has(row.id));
    }

    return sourceRows.filter((row) => !idSet.has(row.id));
  }, [rowSelectionModel, storeRows, localRows, isInEditMode]);

  const handleRowSelectionModelChange = useCallback((model: GridRowSelectionModel) => {
    setRowSelectionModel(model);
  }, []);

  const showStandardActions = !isInEditMode && selectedRows.length === 0;

  return (
    <PageWrapper>
      <MainContentWrapper>
        <TopSection>
          <MetadataLine>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
              <Header />
            </Box>

            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <FormActionsToolbar />
            </Box>
          </MetadataLine>

          <ActionLine>
            <Box sx={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {showStandardActions && <AddResponseButton />}
              <EditResponsesButton
                isInEditMode={isInEditMode}
                hasUnsavedChanges={hasUnsavedChanges}
                onToggleEditMode={handleToggleEditMode}
                onSaveChanges={handleSaveChanges}
                onAddNewResponse={handleAddNewResponse}
                onDuplicateResponse={handleDuplicateResponse}
                isUpdating={isUpdating}
                permissions={permissions}
                selectedRows={selectedRows}
                handleDeleteResponses={handleDeleteResponses}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <SearchInfo search={filter?.query || ""} setSearch={handleSearch} />
              <ViewsButton
                isSidePanelOpen={isSidePanelOpen}
                setIsSidePanelOpen={setIsSidePanelOpen}
                hasSavedViews={hasSavedViews}
                savedViews={savedViews}
                selectedViewId={selectedViewId}
                defaultViewId={defaultViewId}
                handleViewDropdownChange={handleViewDropdownChange}
              />
            </Box>
          </ActionLine>
        </TopSection>

        <ResponsesTable
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={handleRowSelectionModelChange}
          isInEditMode={isInEditMode}
          localRows={localRows}
          handleProcessRowUpdate={handleProcessRowUpdate}
          onCellEditStart={handleCellEditStart}
          onCellLiveChange={handleCellLiveChange}
          validationErrors={validationErrors}
          currentView={currentView}
          deletedRowIds={deletedRowIds}
        />

        <UnsavedChangesDialog
          open={showCancelDialog}
          onClose={handleCancelDialogClose}
          onSave={handleSaveChanges}
          onDiscard={handleConfirmCancel}
          title="ביטול שינויים"
          message="ישנם שינויים שלא נשמרו. האם אתה בטוח שברצונך לבטל את השינויים?"
          saveText="שמירת שינויים"
          discardText="ביטול שינויים"
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

      <ConfirmDeleteDialog
        open={pendingDeleteIds !== null}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="מחיקת תגובות"
        message={`האם אתה בטוח שברצונך למחוק ${pendingDeleteIds?.length || 0} תגובות?`}
      />
    </PageWrapper>
  );
};
