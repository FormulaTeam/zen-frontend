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
import { FormDto, FormFieldDto, UserPersonalDto } from "../../types/shared";

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
    hasUserCreatedViews,
  } = useResponsesViews();

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter({
        ...filter,
        query: search,
        before: undefined,
        after: undefined,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

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

    const flattenedFields = (form.sections ?? [])
      .flatMap((section) => section.fields ?? [])
      .sort((a, b) => a.index - b.index);

    return {
      id: form.id,
      name: form.name ?? "",
      fields: flattenedFields,
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
            hasUserCreatedViews={hasUserCreatedViews}
          />
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
    </PageWrapper>
  );
};
