import { Box, Button, Stack, Tooltip } from "@mui/material";

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomIcon } from "../../../theme/icons";
import { PERMISSION_TYPES } from "../../../utils/utils";
import { useFormStore } from "../stores/form.store";
import { PermissionGate } from "../PermissionGate";
import { MoreOptions } from "./MoreOptions";
import UserPicker from "../../../components/USerPicker/UserPicker";

export const FormActionsToolbar = () => {
  const { permissions, form } = useFormStore();
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const [showSharePopup, setShowSharePopup] = useState(false);

  if (!permissions || !form || !formId) return null;

  return (
    <Stack gap={1}>
      <Box>
        <PermissionGate permissions={[PERMISSION_TYPES.SYNC_FORM]} userPermissions={permissions}>
          <MoreOptions />
        </PermissionGate>

        <PermissionGate permissions={[PERMISSION_TYPES.EDIT_FORM]} userPermissions={permissions}>
          <Tooltip title="עריכת הטופס">
            <Button
              variant="customIcon"
              onClick={() =>
                navigate(`/form/edit/${formId}`, { state: { from: location.pathname } })
              }>
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
          {showSharePopup &&
            null
            // Massive refactor needed - dogshit component
            // <UserPicker
            //   form={form}
            //   roles={roles}
            //   currentUser={user}
            //   closeSharePopupAndRefreshForm={(users, updatedForm) => {
            //     // if we got updated form from UserPicker, use it to update the form state, otherwise use existing form and just update users
            //     const formToUpdate = updatedForm || { ...form, users };

            //     setForm(formToUpdate);
            //     setShowSharePopup(false);
            //   }}
            // />
          }
        </PermissionGate>

        <Tooltip title="חזרה">
          <Button onClick={() => navigate("/")} variant="customIcon">
            <CustomIcon forcePointer iconName="arrowBack" />
          </Button>
        </Tooltip>

        {/* <SyncTypeMenu
        anchorElSourceType={anchorElSourceType}
        handleCloseMoreActions={handleCloseMoreActions}
        handleManualSource={handleManualSource}
        handleAutomaticSource={handleAutomaticSource}
      /> */}
      </Box>
    </Stack>
  );
};
