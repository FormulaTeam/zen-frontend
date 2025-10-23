import { DeleteForever, MoreVert } from "@mui/icons-material";
import { Button, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeleteAllFormsResponses, useDeleteForm } from "../../../api";
import deleteResponseImg from "../../../images/delete_response.png";
import ConfirmPopup from "../../../popups/ConfirmPopup/ConfirmPopup";
import { CustomIcon } from "../../../theme/icons";
import { PERMISSION_TYPES } from "../../../utils/utils";
import { useFormStore } from "../stores/form.store";
import { PermissionGate } from "../PermissionGate";
import { UploadResponses } from "./UploadResponses";

export const MoreOptions = () => {
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const { permissions, form } = useFormStore();
  const [anchorElMoreActions, setAnchorElMoreActions] = useState<HTMLElement | null>(null);
  const { mutate: deleteForm } = useDeleteForm({ id: formId || "" });
  const { mutate: deleteAllResponses } = useDeleteAllFormsResponses({ formId: formId || "" });

  const [showDeleteFormPopup, setShowDeleteFormPopup] = useState(false);
  const [showDeleteResponsesPopup, setShowDeleteResponsesPopup] = useState(false);
  const [showImportFromExcelPopup, setShowImportFromExcelPopup] = useState(false);

  if (!permissions || !form || !formId) return null;

  return (
    <>
      <Tooltip title="פעולות נוספות">
        <Button variant="customIcon" onClick={(e) => setAnchorElMoreActions(e.currentTarget)}>
          <MoreVert sx={{ scale: 1.5 }} />
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
        {/* Metro sync menu items  */}
        {/* <PermissionGate permissions={[PERMISSION_TYPES.SYNC_FORM]} userPermissions={permissions}>
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

        <PermissionGate
          permissions={[PERMISSION_TYPES.CREATE_RESPONSE, PERMISSION_TYPES.EDIT_RESPONSE]}
          userPermissions={permissions}>
          <MenuItem
            disabled={!(form?.fields?.length > 0)}
            onClick={() => setShowImportFromExcelPopup(true)}>
            <ListItemIcon>
              <CustomIcon iconName="import" />
            </ListItemIcon>
            <ListItemText>ייבוא נתונים</ListItemText>
          </MenuItem>
          <UploadResponses
            showImportFromExcelPopup={showImportFromExcelPopup}
            setShowImportFromExcelPopup={setShowImportFromExcelPopup}
          />
        </PermissionGate>

        <PermissionGate permissions={[PERMISSION_TYPES.EDIT_FORM]} userPermissions={permissions}>
          <MenuItem onClick={() => setShowDeleteFormPopup(true)}>
            <ListItemIcon>
              <DeleteForever sx={{ color: "red", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText sx={{ color: "red" }}>מחיקת הטופס</ListItemText>
          </MenuItem>
          {showDeleteFormPopup && (
            <ConfirmPopup
              image={deleteResponseImg}
              msg={"האם אתה בטוח שברצונך למחוק את הטופס?"}
              okFunc={() => {
                deleteForm(
                  {},
                  {
                    onSuccess: () => {
                      navigate("/", { replace: true });
                    },
                  },
                );
              }}
              closePopup={() => setShowDeleteFormPopup(false)}
              okBtnText={"מחק טופס"}
            />
          )}
        </PermissionGate>

        <PermissionGate permissions={[PERMISSION_TYPES.EDIT_FORM]} userPermissions={permissions}>
          <MenuItem
            onClick={() => setShowDeleteResponsesPopup(true)}
            disabled={form.numberOfResponses === 0}>
            <ListItemIcon>
              <DeleteForever sx={{ color: "red", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText sx={{ color: "red" }}>מחיקת כל התגובות</ListItemText>
          </MenuItem>
          {showDeleteResponsesPopup && (
            <ConfirmPopup
              image={deleteResponseImg}
              msg={"האם אתה בטוח שברצונך למחוק את כל התגובות לטופס?"}
              okFunc={() => {
                deleteAllResponses({
                  data: {
                    form_id: formId,
                  },
                });
              }}
              closePopup={() => setShowDeleteResponsesPopup(false)}
              okBtnText={"מחק תגובות"}
            />
          )}
        </PermissionGate>
      </Menu>
    </>
  );
};
