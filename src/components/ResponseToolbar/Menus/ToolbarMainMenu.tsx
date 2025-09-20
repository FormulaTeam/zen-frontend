import React from "react";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { PERMISSION_TYPES } from "../../../utils/utils";
import { CustomIcon } from "../../../theme/icons";
import { useSuperAdmin } from "../../../contexts/SuperAdminContext";
import { DeleteForever } from "@mui/icons-material";

interface ToolbarMainMenuProps {
  permissionTypes: number[];
  form: any;
  responsesCount: number;
  setAnchorElMoreActions: (value: HTMLElement | null) => void;
  setAnchorElSourceType: (value: HTMLElement | null) => void;
  anchorElMoreActions: HTMLElement | null;
  pushToMetro: () => void;
  setShowImportFromExcelPopup: (value: boolean) => void;
  deleteAllResponsesConfirmation: () => void;
  deleteFormFromBtn?: () => void;
}

const ToolbarMainMenu: React.FC<ToolbarMainMenuProps> = ({
  permissionTypes,
  form,
  responsesCount,
  setAnchorElMoreActions,
  setAnchorElSourceType,
  anchorElMoreActions,
  pushToMetro,
  setShowImportFromExcelPopup,
  deleteAllResponsesConfirmation,
  deleteFormFromBtn = () => {},
}) => {
  const { isSuperAdmin } = useSuperAdmin();
  const handleCloseMoreActions = () => {
    setAnchorElMoreActions(null);
    setAnchorElSourceType(null);
  };

  return (
    <Menu
      id="demo-positioned-menu"
      aria-labelledby="demo-positioned-button"
      anchorEl={anchorElMoreActions}
      open={anchorElMoreActions !== null}
      onClose={handleCloseMoreActions}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}>
      {permissionTypes.includes(PERMISSION_TYPES.SYNC_FORM) && (
        <>
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
        </>
      )}
      {(permissionTypes.includes(PERMISSION_TYPES.CREATE_RESPONSE) ||
        permissionTypes.includes(PERMISSION_TYPES.EDIT_RESPONSE)) && (
        <MenuItem
          disabled={!(form?.fields?.length > 0)} //btn enabled only if form has fields
          onClick={() => setShowImportFromExcelPopup(true)}>
          <ListItemIcon>
            <CustomIcon iconName="import" />
          </ListItemIcon>
          <ListItemText>ייבוא נתונים</ListItemText>
        </MenuItem>
      )}
      {(isSuperAdmin || permissionTypes.includes(PERMISSION_TYPES.EDIT_FORM)) && (
        <MenuItem onClick={deleteFormFromBtn}>
          <ListItemIcon>
            <DeleteForever sx={{ color: "red", fontSize: 22 }} />
          </ListItemIcon>
          <ListItemText sx={{ color: "red" }}>מחיקת הטופס</ListItemText>
        </MenuItem>
      )}
      {(isSuperAdmin || permissionTypes.includes(PERMISSION_TYPES.EDIT_FORM)) && (
        <MenuItem
          onClick={deleteAllResponsesConfirmation}
          disabled={!responsesCount || responsesCount === 0}>
          <ListItemIcon>
            <DeleteForever sx={{ color: "red", fontSize: 22 }} />
          </ListItemIcon>
          <ListItemText sx={{ color: "red" }}>מחיקת כל התגובות</ListItemText>
        </MenuItem>
      )}
    </Menu>
  );
};

export default ToolbarMainMenu;
