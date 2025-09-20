import { Box, Button, Tooltip } from "@mui/material";
import { PERMISSION_TYPES } from "../../../utils/utils";
import { MoreVert } from "@mui/icons-material";
import { CustomIcon } from "../../../theme/icons";
import ToolbarMainMenu from "../Menus/ToolbarMainMenu";
import SyncTypeMenu from "../Menus/SyncTypeMenu";
import { useNavigate } from "react-router-dom";
import { useSuperAdmin } from "../../../contexts/SuperAdminContext";

interface MenusContainerProps {
  deleteAllResponsesConfirmation: () => void;
  deleteFormFromBtn: () => void;
  permissionTypes: number[];
  form: any;
  setAnchorElMoreActions: (value: HTMLElement | null) => void;
  setShowSharePopup: (value: boolean) => void;
  responsesCount: number;
  setShowImportFromExcelPopup: (value: boolean) => void;
  pushToMetro: () => void;
  anchorElMoreActions: HTMLElement | null;
  anchorElSourceType: HTMLElement | null;
  handleManualSource: () => void;
  handleAutomaticSource: () => void;
  setAnchorElSourceType: (value: HTMLElement | null) => void;
  handleCloseMoreActions: () => void;
}

const MenusContainer: React.FC<MenusContainerProps> = ({
  deleteAllResponsesConfirmation,
  deleteFormFromBtn,
  permissionTypes,
  form,
  setAnchorElMoreActions,
  setShowSharePopup,
  responsesCount,
  setShowImportFromExcelPopup,
  pushToMetro,
  anchorElMoreActions,
  anchorElSourceType,
  handleManualSource,
  handleAutomaticSource,
  setAnchorElSourceType,
  handleCloseMoreActions,
}) => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useSuperAdmin();

  const handleNavigateToEditForm = () => {
    navigate(`/form/edit/${form.id}`, { state: { from: location.pathname } });
  };

  const hasPermissions =
    isSuperAdmin ||
    !(permissionTypes.length === 1 && permissionTypes[0] === PERMISSION_TYPES.VIEW_RESPONSE);

  return (
    <Box>
      <Tooltip title="פעולות נוספות">
        <span>
          <Button
            variant="customIcon"
            onClick={(e) => setAnchorElMoreActions(e.currentTarget)}
            disabled={!hasPermissions}>
            <MoreVert sx={{ scale: 1.5 }} />
          </Button>
        </span>
      </Tooltip>

      {permissionTypes.includes(PERMISSION_TYPES.EDIT_FORM) && (
        <Tooltip title="עריכת הטופס">
          <Button variant="customIcon" onClick={handleNavigateToEditForm}>
            <CustomIcon forcePointer iconName="edit" style={{ width: 23 }} />
          </Button>
        </Tooltip>
      )}

      {permissionTypes.includes(PERMISSION_TYPES.SHARE_FORM) && (
        <Tooltip title="שיתוף הטופס">
          <Button
            variant="customIcon"
            disabled={!(form?.fields?.length > 0)}
            onClick={() => setShowSharePopup(true)}>
            <CustomIcon forcePointer iconName="share" style={{ width: 23 }} />
          </Button>
        </Tooltip>
      )}

      <Tooltip title="חזרה">
        <Button onClick={() => navigate("/")} variant="customIcon">
          <CustomIcon forcePointer iconName="arrowBack" />
        </Button>
      </Tooltip>

      <ToolbarMainMenu
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
      />

      <SyncTypeMenu
        anchorElSourceType={anchorElSourceType}
        handleCloseMoreActions={handleCloseMoreActions}
        handleManualSource={handleManualSource}
        handleAutomaticSource={handleAutomaticSource}
      />
    </Box>
  );
};

export default MenusContainer;
