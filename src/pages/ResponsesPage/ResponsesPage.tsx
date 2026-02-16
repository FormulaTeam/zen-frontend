import { useParams } from "react-router";

import Loader from "../../components/Responses/Loader";
import { Role, User } from "../../utils/interfaces";
import { FormActionsToolbar } from "./components/FormActionsToolbar";
import { EditResponsesButton } from "./components/EditResponsesButton";
import AddResponseButton from "./components/AddResponseButton";
import { CancelEditDialog } from "./components/CancelEditDialog";
import { useFormLoader } from "./hooks/useFormLoader";
import { useResponsesEdit } from "./hooks/useResponsesEdit";
import { MainContentWrapper, PageWrapper, TopSection, ActionsRow } from "./styled";
import SearchInfo from "../../components/Responses/SearchInfo";
import { ResponsesTable } from "./components/ResponsesTable";
import Header from "./components/Header";
import Tooltip from "@mui/material/Tooltip";
import { ViewManageButton } from "@components/Responses/styled";
import { BackupTable, CalendarViewWeek } from "@mui/icons-material";

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
  const { isLoading, isError } = useFormLoader(formId || "");

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

  return <ResponsesPageContent />;
}

const ResponsesPageContent = (): JSX.Element => {
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
  } = useResponsesEdit();

  return (
    <PageWrapper>
      <MainContentWrapper>
        <TopSection>
          <Header />
          <FormActionsToolbar />
        </TopSection>
        <TopSection>
          <ActionsRow>
            {!isInEditMode && <AddResponseButton />}
            <EditResponsesButton
              isInEditMode={isInEditMode}
              editedRowsCount={editedRowsCount}
              isUpdating={isUpdating}
              onToggleEditMode={handleToggleEditMode}
              onSaveChanges={handleSaveChanges}
            />
          </ActionsRow>
          <SearchInfo />
          <Tooltip title="ניהול תצוגות">
            <span>
              <ViewManageButton
                variant="contained"
                 onClick={() => {}} disabled={false}>
                <BackupTable />
                 <span>ניהול תצוגות</span>
              </ViewManageButton>
            </span>
          </Tooltip>
          {/* <Tooltip title="ניהול תצוגות">
            <div>
              <ViewManageButton variant="contained" onClick={() => {}} disabled={false}>
                <CalendarViewWeek />
              </ViewManageButton>
            </div>
          </Tooltip> */}
        </TopSection>
        <ResponsesTable
          isInEditMode={isInEditMode}
          localRows={localRows}
          handleProcessRowUpdate={handleProcessRowUpdate}
          onCellEditStart={handleCellEditStart}
          validationErrors={validationErrors}
          onCellLiveChange={handleCellLiveChange}
        />
        <CancelEditDialog
          open={showCancelDialog}
          onConfirm={handleConfirmCancel}
          onCancel={handleCancelDialogClose}
        />
      </MainContentWrapper>
    </PageWrapper>
  );
};
