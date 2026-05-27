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
import { CancelEditDialog } from "./components/CancelEditDialog";
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

  const [search, setSearch] = useState<string>("");
  const { rows: storeRows, form, permissions } = useFormStore();
  const { user } = useAuth();

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
    const ids = Array.from(rowSelectionModel.ids as Set<GridRowId>);
    return storeRows.filter((row) => ids.includes(row.id));
  }, [rowSelectionModel.ids, storeRows]);

  const handleRowSelectionModelChange = useCallback((model: GridRowSelectionModel) => {
    setRowSelectionModel(model);
  }, []);

  return (
    <PageWrapper>
      <MainContentWrapper>
        <TopSection>
          <MetadataLine>
            {/* RIGHT SIDE: Nav Actions (Back, Share, Edit, More) */}
            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
              <FormActionsToolbar />
            </Box>

            {/* MIDDLE: Search Responses Bar (Exact Middle) */}
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Box sx={{ width: "100%", maxWidth: "500px" }}>
                <SearchInfo search={search} setSearch={setSearch} />
              </Box>
            </Box>

            {/* LEFT SIDE: Metadata (Info, ID, Name) */}
            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <Header />
            </Box>
          </MetadataLine>

          <ActionLine>
            {/* RIGHT SIDE: Main Actions (Add, Quick Edit) */}
            <Box sx={{ display: "flex", gap: "12px", alignItems: "center" }}>
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
            </Box>

            {/* LEFT SIDE: View Management */}
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {selectedRows.length > 0 && (
                <Tooltip title="מחיקת תגובות נבחרות">
                  <IconButton color="error" onClick={() => handleDeleteResponses(selectedRows as any)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              )}
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
