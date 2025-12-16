import { useParams } from "react-router";
import Header from "../../components/Responses/Header";
import Loader from "../../components/Responses/Loader";
import { Role, User } from "../../utils/interfaces";
import { FormActionsToolbar } from "./components/FormActionsToolbar";
import { EditResponsesButton } from "./components/EditResponsesButton";
import { useFormLoader } from "./hooks/useFormLoader";
import { useResponsesEdit } from "./hooks/useResponsesEdit";
import { BoxWrapper, MainContentWrapper, PageWrapper, TopSection } from "./styled";
import SearchInfo from "../../components/Responses/SearchInfo";
import { ResponsesTable } from "./components/ResponsesTable";

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
    handleToggleEditMode,
    handleProcessRowUpdate,
    handleSaveChanges,
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
          <BoxWrapper>
            <Header />
            <FormActionsToolbar />
          </BoxWrapper>
          <EditResponsesButton
            isInEditMode={isInEditMode}
            editedRowsCount={editedRows.size}
            isUpdating={isUpdating}
            onToggleEditMode={handleToggleEditMode}
            onSaveChanges={handleSaveChanges}
          />
          {/* <SearchInfo search={search} setSearch={setSearch} allResponsesCount={allResponsesCount} /> */}
        </TopSection>
        <ResponsesTable
          isInEditMode={isInEditMode}
          localRows={localRows}
          handleProcessRowUpdate={handleProcessRowUpdate}
        />
      </MainContentWrapper>
    </PageWrapper>
  );
}
