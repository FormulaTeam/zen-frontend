import { useParams } from "react-router";

import Loader from "../../components/Responses/Loader";
import { Role, User } from "../../utils/interfaces";
import { FormActionsToolbar } from "./components/FormActionsToolbar";
import { EditResponsesButton } from "./components/EditResponsesButton";
import { CancelEditDialog } from "./components/CancelEditDialog";
import { useFormLoader } from "./hooks/useFormLoader";
import { useResponsesEdit } from "./hooks/useResponsesEdit";
import { MainContentWrapper, PageWrapper, TopSection } from "./styled";
import SearchInfo from "../../components/Responses/SearchInfo";
import { ResponsesTable } from "./components/ResponsesTable";
import Header from "./components/Header";

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
  const { isLoading, isError } = useFormLoader(formId || ""); // try to fix later

  const {
    isInEditMode,
    editedRows,
    localRows,
    isUpdating,
    showCancelDialog,
    handleToggleEditMode,
    handleCellEditStart,
    handleProcessRowUpdate,
    handleSaveChanges,
    handleConfirmCancel,
    handleCancelDialogClose,
  } = useResponsesEdit();

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

  return (
    <PageWrapper>
      <MainContentWrapper>
        <TopSection>
          <Header />
          <FormActionsToolbar />
          {/* <SearchInfo search={search} setSearch={setSearch} allResponsesCount={allResponsesCount} /> */}
        </TopSection>
        <EditResponsesButton
          isInEditMode={isInEditMode}
          editedRowsCount={editedRows.size}
          isUpdating={isUpdating}
          onToggleEditMode={handleToggleEditMode}
          onSaveChanges={handleSaveChanges}
        />
        <ResponsesTable
          isInEditMode={isInEditMode}
          localRows={localRows}
          handleProcessRowUpdate={handleProcessRowUpdate}
          onCellEditStart={handleCellEditStart}
        />
        <CancelEditDialog
          open={showCancelDialog}
          onConfirm={handleConfirmCancel}
          onCancel={handleCancelDialogClose}
        />
      </MainContentWrapper>
    </PageWrapper>
  );
}
