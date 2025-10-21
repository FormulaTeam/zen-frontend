import ResponseToolbar from "../../components/ResponseToolbar/ResponseToolbar";
import { Role, User } from "../../utils/interfaces";
import Header from "../../components/Responses/Header";
import { MainContentWrapper, PageWrapper, TopSection } from "./styled";
import { useDeleteForm, useGetForm } from "../../api";
import { useNavigate, useParams } from "react-router";
import { useFormStore } from "./form.store";
import { useEffect, useState } from "react";
import {
  Stack,
  Box,
  Button,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { DeleteForever, MoreVert } from "@mui/icons-material";
import ToolbarMainMenu from "../../components/ResponseToolbar/Menus/ToolbarMainMenu";
import { CustomIcon } from "../../theme/icons";
import { PERMISSION_TYPES } from "../../utils/utils";
import { PermissionGate } from "./PermissionGate";
import UserPicker from "../../components/USerPicker/UserPicker";
import ImportFromExcelPopup from "../../components/ResponseToolbar/Popups/ImportFromExcelPopup";
import ConfirmPopup from "../../popups/ConfirmPopup/ConfirmPopup";
import deleteResponseImg from "../../images/delete_response.png";
import { useAuth } from "../../contexts/AuthContext";

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
  // const { isSuperAdmin } = useSuperAdmin();
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
      setPermissions([...(formData?.permissions || [])]);
    }
  }, [isSuccess]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError || !formData) {
    return <div>Error loading form data.</div>;
  }
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
          <ResponsesToolbar />
        </TopSection>
      </MainContentWrapper>
    </PageWrapper>
  );
}

const ResponsesToolbar = () => {
  const { permissions, form } = useFormStore();
  const { id: formId } = useParams();
  const [anchorElMoreActions, setAnchorElMoreActions] = useState<HTMLElement | null>(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const navigate = useNavigate();
  const { mutate: deleteForm } = useDeleteForm({ id: formId || "" });
  const [showConfirmMsg, setShowConfirmMsg] = useState(false);

  if (!permissions || !form || !formId) return null;

  const handleNavigateToEditForm = () => {
    navigate(`/form/edit/${form.id}`, { state: { from: location.pathname } });
  };

  return (
    <Box>
      <Tooltip title="פעולות נוספות">
        <span>
          <PermissionGate permissions={[PERMISSION_TYPES.SYNC_FORM]} userPermissions={permissions}>
            <Button variant="customIcon" onClick={(e) => setAnchorElMoreActions(e.currentTarget)}>
              <MoreVert sx={{ scale: 1.5 }} />
            </Button>
          </PermissionGate>
        </span>
      </Tooltip>
      {showSharePopup && "fuck my life"}

      <PermissionGate permissions={[PERMISSION_TYPES.EDIT_FORM]} userPermissions={permissions}>
        <Tooltip title="עריכת הטופס">
          <Button variant="customIcon" onClick={handleNavigateToEditForm}>
            <CustomIcon forcePointer iconName="edit" style={{ width: 23 }} />
          </Button>
        </Tooltip>
      </PermissionGate>

      <PermissionGate permissions={[PERMISSION_TYPES.SHARE_FORM]} userPermissions={permissions}>
        <Tooltip title="שיתוף הטופס">
          <Button
            variant="customIcon"
            disabled={!(form?.fields?.length > 0)}
            onClick={() => setShowSharePopup(true)}>
            <CustomIcon forcePointer iconName="share" style={{ width: 23 }} />
          </Button>
        </Tooltip>
      </PermissionGate>

      <Tooltip title="חזרה">
        <Button onClick={() => navigate("/")} variant="customIcon">
          <CustomIcon forcePointer iconName="arrowBack" />
        </Button>
      </Tooltip>

      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorElMoreActions}
        open={anchorElMoreActions !== null}
        onClose={() => setAnchorElMoreActions(null)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}>
        {/* Metro sync menu items 
         <PermissionGate permissions={[PERMISSION_TYPES.SYNC_FORM]} userPermissions={permissions}>
          <MenuItem
            disabled={!responsesCount || responsesCount === 0 || !form?.metro_access_url} //btn enabled only if form has responses and has metro source
            onClick={pushToMetro}>
            <ListItemIcon>
              <CustomIcon iconName={"sync"} style={{ padding: 2 }} />
            </ListItemIcon>
            <ListItemText>סנכרון נתונים</ListItemText>
          </MenuItem>
          {form?.metro_access_token && form?.metro_access_url ? (
            <MenuItem onClick={(e) => setAnchorElSourceType(e.currentTarget)}>
              <ListItemIcon>
                <CustomIcon iconName={"source"} />
              </ListItemIcon>
              <ListItemText>עריכת מקור</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem onClick={(e) => setAnchorElSourceType(e.currentTarget)}>
              <ListItemIcon>
                <CustomIcon iconName={"source"} />
              </ListItemIcon>
              <ListItemText>יצירת מקור</ListItemText>
            </MenuItem>
          )}
        </PermissionGate> */}

        {/* <PermissionGate
          permissions={[PERMISSION_TYPES.CREATE_RESPONSE, PERMISSION_TYPES.EDIT_RESPONSE]}
          userPermissions={permissions}>
          <MenuItem
            disabled={!(form?.fields?.length > 0)} //btn enabled only if form has fields
            onClick={() => setShowImportFromExcelPopup(true)}>
            <ListItemIcon>
              <CustomIcon iconName="import" />
            </ListItemIcon>
            <ListItemText>ייבוא נתונים</ListItemText>
          </MenuItem>
        </PermissionGate> */}

        <PermissionGate permissions={[PERMISSION_TYPES.EDIT_FORM]} userPermissions={permissions}>
          <MenuItem onClick={() => setShowConfirmMsg(true)}>
            <ListItemIcon>
              <DeleteForever sx={{ color: "red", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText sx={{ color: "red" }}>מחיקת הטופס</ListItemText>
          </MenuItem>
          {showConfirmMsg && (
            <ConfirmPopup
              image={deleteResponseImg}
              msg={"האם אתה בטוח שברצונך למחוק את הטופס?"}
              okFunc={() => {
                deleteForm(null, {
                  onSuccess: () => {
                    navigate("/", { replace: true });
                  },
                });
              }}
              closePopup={() => setShowConfirmMsg(false)}
              okBtnText={"מחק טופס"}
            />
          )}
        </PermissionGate>

        {/* <PermissionGate permissions={[PERMISSION_TYPES.EDIT_FORM]} userPermissions={permissions}>
          <MenuItem
            onClick={deleteAllResponsesConfirmation}
            disabled={!responsesCount || responsesCount === 0}>
            <ListItemIcon>
              <DeleteForever sx={{ color: "red", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText sx={{ color: "red" }}>מחיקת כל התגובות</ListItemText>
          </MenuItem>
        </PermissionGate> */}
      </Menu>

      {/* <ToolbarMainMenu
        deleteAllResponsesConfirmation={deleteAllResponsesConfirmation}
        deleteFormFromBtn={deleteFormFromBtn}
        permissionTypes={permissionTypes}
        form={form}
        responsesCount={responsesCount}
        setShowImportFromExcelPopup={setShowImportFromExcelPopup}
        pushToMetro={pushToMetro}
        setAnchorElMoreActions={setAnchorElMoreActions}
        setAnchorElSourceType={setAnchorElSourceType}
        anchorElMoreActions={anchorElMoreActions}
      /> */}

      {/* <SyncTypeMenu
        anchorElSourceType={anchorElSourceType}
        handleCloseMoreActions={handleCloseMoreActions}
        handleManualSource={handleManualSource}
        handleAutomaticSource={handleAutomaticSource}
      /> */}
    </Box>
  );
};
