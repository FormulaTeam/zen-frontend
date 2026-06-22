import { GridRowId, GridRowModel, GridRowSelectionModel } from "@mui/x-data-grid-pro";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Box, Tooltip, IconButton } from "@mui/material";
import Delete from "@mui/icons-material/Delete";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import { StatusCodes } from "http-status-codes";
import { IOrderBy } from "../../types/enums/filtersAndSorts.enum";

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
  UnifiedButton,
} from "./styled";
import { FormDto, FormFieldDto } from "../../types/shared";
import DraftRecoveryBanner from "../../components/BasePopup/DraftRecoveryBanner";
import { getQuickEditDraft, clearQuickEditDraft } from "../FormEditor/utils/draftPersistence";
import UnsavedChangesDialog from "../../components/BasePopup/UnsavedChangesDialog";
import ConfirmDeleteDialog from "../../components/BasePopup/ConfirmDeleteDialog";

const ACTION_BUTTON_BACKGROUND = "#DFECF9";
const ACTION_BUTTON_HOVER_BACKGROUND = "#D4E6F8";

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
  const { formId } = useParams<string>();
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set<GridRowId>(),
  });

  const {
    rows: storeRows,
    form,
    permissions,
    filter,
    setFilter,
    setResponseFilters,
  } = useFormStore();
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

  const [showFilters, setShowFilters] = useState(false);
  const activeFiltersCount = filter?.responseFilters?.items?.length ?? 0;

  useEffect(() => {
    if (activeFiltersCount > 0) {
      setShowFilters(true);
    }
  }, [activeFiltersCount]);

  useEffect(() => {
    if (isInEditMode) {
      setShowFilters(false);
    }
  }, [isInEditMode]);

  const handleToggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleClearFilters = useCallback(() => {
    setResponseFilters(null);
  }, [setResponseFilters]);

  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any>(null);
  const [showBackCancelDialog, setShowBackCancelDialog] = useState(false);

  const handleBackClick = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowBackCancelDialog(true);
    } else {
      navigate("/");
    }
  }, [hasUnsavedChanges, navigate]);

  const handleBackDiscard = useCallback(() => {
    handleConfirmCancel();
    setShowBackCancelDialog(false);
    navigate("/");
  }, [handleConfirmCancel, navigate]);

  const handleBackSave = useCallback(async () => {
    const success = await handleSaveChanges();
    if (success) {
      setShowBackCancelDialog(false);
      navigate("/");
    }
  }, [handleSaveChanges, navigate]);

  const handleBackCancelDialogClose = useCallback(() => {
    setShowBackCancelDialog(false);
  }, []);

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
        handleToggleEditMode();
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
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");

    const newFilter = { ...(filter || {}) };
    let hasChanges = false;

    if (pageParam) {
      newFilter.pageNumber = Number(pageParam);
      hasChanges = true;
    }
    if (pageSizeParam) {
      newFilter.pageSize = Number(pageSizeParam);
      hasChanges = true;
    }

    if (hasChanges) {
      setFilter(newFilter);
    }
  }, []);

  useEffect(() => {
    if (!filter) return;

    setSearchParams(
      (prev) => {
        const updated = new URLSearchParams(prev);

        if (filter.pageNumber && filter.pageNumber !== 1) {
          updated.set("page", String(filter.pageNumber));
        } else {
          updated.delete("page");
        }

        if (filter.pageSize && filter.pageSize !== 25) {
          updated.set("pageSize", String(filter.pageSize));
        } else {
          updated.delete("pageSize");
        }

        return updated;
      },
      { replace: true },
    );
  }, [filter, setSearchParams]);

  useEffect(() => {
    const drawerParam = searchParams.get("drawer");
    const targetSidePanelOpen = drawerParam === "views";
    if (targetSidePanelOpen !== isSidePanelOpen) {
      setIsSidePanelOpen(targetSidePanelOpen);
    }

    const modeParam = searchParams.get("mode");
    const targetEditMode = modeParam === "quick-edit";
    if (targetEditMode !== isInEditMode) {
      setIsInEditMode(targetEditMode);
    }
  }, [searchParams]);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const updated = new URLSearchParams(prev);

        if (isSidePanelOpen) {
          updated.set("drawer", "views");
        } else {
          updated.delete("drawer");
        }

        if (isInEditMode) {
          updated.set("mode", "quick-edit");
        } else {
          updated.delete("mode");
        }

        return updated;
      },
      { replace: true },
    );
  }, [isSidePanelOpen, isInEditMode, setSearchParams]);

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
              <FormActionsToolbar onBackClick={handleBackClick} />
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

              {!isInEditMode && (
                <Box
                  style={{
                    position: "relative",
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    overflow: "visible",
                  }}>
                  <Tooltip title={showFilters ? "הסתר סינון" : "הצג סינון"} arrow>
                    <UnifiedButton
                      aria-label={showFilters ? "הסתר סינון" : "הצג סינון"}
                      onClick={handleToggleFilters}
                      sx={{
                        minWidth: "40px",
                        width: "40px",
                        height: "40px",
                        padding: 0,
                        backgroundColor: `${ACTION_BUTTON_BACKGROUND} !important`,
                        border: "none !important",
                        borderColor: "transparent !important",
                        boxShadow: "none !important",

                        "&:hover": {
                          backgroundColor: `${ACTION_BUTTON_HOVER_BACKGROUND} !important`,
                          border: "none !important",
                          borderColor: "transparent !important",
                          boxShadow: "none !important",
                        },

                        "&:focus, &:focus-visible": {
                          outline: "none !important",
                          backgroundColor: `${ACTION_BUTTON_BACKGROUND} !important`,
                          border: "none !important",
                          borderColor: "transparent !important",
                          boxShadow: "none !important",
                        },
                      }}>
                      <FilterListRoundedIcon fontSize="small" />
                    </UnifiedButton>
                  </Tooltip>

                  {activeFiltersCount > 0 && (
                    <Box
                      component="span"
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        minWidth: 22,
                        height: 22,
                        padding: "0 6px",
                        borderRadius: 999,
                        backgroundColor: "#1E88E5",
                        color: "#fff",
                        border: "2px solid #f8fbff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        lineHeight: 1,
                        boxSizing: "border-box",
                        pointerEvents: "none",
                      }}>
                      {activeFiltersCount}
                    </Box>
                  )}
                </Box>
              )}

              <Box
                sx={{
                  "& .MuiButton-root": {
                    backgroundColor: `${ACTION_BUTTON_BACKGROUND} !important`,
                    borderColor: "transparent !important",
                    border: "none !important",
                    boxShadow: "none !important",
                  },
                  "& .MuiButton-root:hover": {
                    backgroundColor: `${ACTION_BUTTON_HOVER_BACKGROUND} !important`,
                    borderColor: "transparent !important",
                    border: "none !important",
                    boxShadow: "none !important",
                  },
                  "& .MuiButton-root:focus, & .MuiButton-root:focus-visible": {
                    outline: "none !important",
                    borderColor: "transparent !important",
                    border: "none !important",
                    boxShadow: "none !important",
                  },
                }}>
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
          showFilters={showFilters}
          activeFiltersCount={activeFiltersCount}
          onToggleFilters={handleToggleFilters}
          onClearFilters={handleClearFilters}
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

        <UnsavedChangesDialog
          open={showBackCancelDialog}
          onClose={handleBackCancelDialogClose}
          onSave={handleBackSave}
          onDiscard={handleBackDiscard}
          title="שינויים שלא נשמרו"
          message="ישנם שינויים שלא נשמרו. האם ברצונך לשמור את השינויים לפני היציאה מהעמוד?"
          saveText="שמירה ויציאה"
          discardText="יציאה ללא שמירה"
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
