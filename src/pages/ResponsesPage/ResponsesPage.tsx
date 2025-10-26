import ResponseToolbar from "../../components/ResponseToolbar/ResponseToolbar";
import { Role, User } from "../../utils/interfaces";
import Header from "../../components/Responses/Header";
import { MainContentWrapper, PageWrapper, TopSection } from "./styled";
import { useGetForm } from "../../api";
import { useParams } from "react-router";
import { useFormStore } from "./form.store";
import { useEffect } from "react";
import { Stack, Box, Button, Tooltip } from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import ToolbarMainMenu from "../../components/ResponseToolbar/Menus/ToolbarMainMenu";
import { CustomIcon } from "../../theme/icons";
import { PERMISSION_TYPES } from "../../utils/utils";

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
  const { id: formId } = useParams();
  const { form, setForm, setPermissions } = useFormStore();
  const {
    data: formData,
    isLoading,
    isError,
    isSuccess,
  } = useGetForm({ formId, config: { enabled: !!formId } });

  useEffect(() => {
    if (isSuccess) {
      setForm(formData);
    }
  }, [isSuccess]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError || !formData) {
    return <div>Error loading form data.</div>;
  }
  console.log("fuck my life:", user);
  return (
    <PageWrapper>
      <MainContentWrapper>
        <TopSection>
          {form && <Header form={form} />}
          <Stack gap={1}></Stack>
          {/* <ResponseToolbar
            deleteAllResponsesConfirmation={deleteAllResponsesConfirmation}
            deleteFormFromBtn={deleteFormFromBtn}
            form={form}
            responsesCount={allResponsesCount}
            getResponsesForCurrentPage={getResponsesForCurrentPage}
            setShowSharePopup={setShowSharePopup}
            permissionTypes={permissionTypes}
            setShouldRefreshPage={setShouldRefreshPage}
          /> */}
        </TopSection>
      </MainContentWrapper>
    </PageWrapper>
  );
}

// const ResponsesToolbar = () => {
//   return (
//     <Box>
//       <Tooltip title="פעולות נוספות">
//         <span>
//           <Button
//             variant="customIcon"
//             onClick={(e) => setAnchorElMoreActions(e.currentTarget)}
//             disabled={!hasPermissions}>
//             <MoreVert sx={{ scale: 1.5 }} />
//           </Button>
//         </span>
//       </Tooltip>

//       {permissionTypes.includes(PERMISSION_TYPES.EDIT_FORM) && (
//         <Tooltip title="עריכת הטופס">
//           <Button variant="customIcon" onClick={handleNavigateToEditForm}>
//             <CustomIcon forcePointer iconName="edit" style={{ width: 23 }} />
//           </Button>
//         </Tooltip>
//       )}

//       {permissionTypes.includes(PERMISSION_TYPES.SHARE_FORM) && (
//         <Tooltip title="שיתוף הטופס">
//           <Button
//             variant="customIcon"
//             disabled={!(form?.fields?.length > 0)}
//             onClick={() => setShowSharePopup(true)}>
//             <CustomIcon forcePointer iconName="share" style={{ width: 23 }} />
//           </Button>
//         </Tooltip>
//       )}

//       <Tooltip title="חזרה">
//         <Button onClick={() => navigate("/")} variant="customIcon">
//           <CustomIcon forcePointer iconName="arrowBack" />
//         </Button>
//       </Tooltip>

//       <ToolbarMainMenu
//         deleteAllResponsesConfirmation={deleteAllResponsesConfirmation}
//         deleteFormFromBtn={deleteFormFromBtn}
//         permissionTypes={permissionTypes}
//         form={form}
//         responsesCount={responsesCount}
//         setShowImportFromExcelPopup={setShowImportFromExcelPopup}
//         pushToMetro={pushToMetro}
//         setAnchorElMoreActions={setAnchorElMoreActions}
//         setAnchorElSourceType={setAnchorElSourceType}
//         anchorElMoreActions={anchorElMoreActions}
//       />

//       {/* <SyncTypeMenu
//         anchorElSourceType={anchorElSourceType}
//         handleCloseMoreActions={handleCloseMoreActions}
//         handleManualSource={handleManualSource}
//         handleAutomaticSource={handleAutomaticSource}
//       /> */}
//     </Box>
//   );
// };
