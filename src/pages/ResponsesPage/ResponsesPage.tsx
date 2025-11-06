import { useParams } from "react-router";
import Header from "../../components/Responses/Header";
import Loader from "../../components/Responses/Loader";
import { Role, User } from "../../utils/interfaces";
import { FormActionsToolbar } from "./components/FormActionsToolbar";
import { useFormLoader } from "./hooks/useFormLoader";
import { MainContentWrapper, PageWrapper, TopSection } from "./styled";
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
        <ResponsesTable />
      </MainContentWrapper>
    </PageWrapper>
  );
}
