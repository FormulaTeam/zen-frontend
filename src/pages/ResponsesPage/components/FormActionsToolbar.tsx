import { Box, Button, Tooltip } from "@mui/material";
import SyncIcon from '@mui/icons-material/Sync';

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomIcon } from "../../../theme/icons";
import { PERMISSION_TYPES } from "../../../utils/utils";
import { useFormStore } from "../stores/form.store";
import { PermissionGate } from "../PermissionGate";
import { MoreOptions } from "./MoreOptions";
import UserPicker from "../../../components/USerPicker/UserPicker";
import SyncTypeMenu from "@components/ResponseToolbar/Menus/SyncTypeMenu";
import { useMetro } from "@hooks/useMetro";

export const SourceOperationStatus = {
  NOT_IN_PROGRESS: 'not_in_progress',
  CREATING: 'creating',
  EDITING: 'editing',
} as const;

export type SourceOperationStatusType =
  typeof SourceOperationStatus[keyof typeof SourceOperationStatus];

export const FormActionsToolbar = () => {
  const { permissions, form, setForm } = useFormStore();
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [anchorElMoreActions, setAnchorElMoreActions] = useState<null | HTMLElement>(null);
  const [anchorElSourceType, setAnchorElSourceType] = useState<null | HTMLElement>(null);
  const [sourceOperationStatus, setSourceOperationStatus] =
    useState<SourceOperationStatusType>(
      SourceOperationStatus.NOT_IN_PROGRESS
    );


  if (!permissions || !form || !formId) return null;


  const {
    showMetroPopup,
    setShowMetroPopup,
    showMetroInputsPopup,
    setShowMetroInputsPopup,
    theForm,
    pushToMetro,
    syncSourceToMetro,
    editSource,
    copied,
    setCopied,
    metroInputsPopupLoading,
    sourceKey,
    setSourceKey,
    appKey,
    setAppKey,
    clusterURL,
    setClusterURL,
    saveMetroData,
    copySchemaToClipboard
  } = useMetro({
    form,
    loadingIcon: <div style={{ display: 'flex', alignItems: 'center' }}>
      <SyncIcon
        sx={{
          fontSize: 30,
          '@keyframes spin': {
            from: { transform: 'rotate(360deg)' },
            to: { transform: 'rotate(0deg)' },
          },
          animation: 'spin 1.2s linear infinite',
        }}
      />
    </div >,
    setSourceOperationStatus
  });

  const handleCloseMoreActions = (): void => {
    setAnchorElMoreActions(null);
    setAnchorElSourceType(null);
  };

  const handleAutomaticSource = (): void => {
    if (theForm?.metro_access_url || theForm?.oasisSourceKey) {
      editSource();
    } else {
      syncSourceToMetro();
    }
    handleCloseMoreActions();
  };

  return (
    <Box>
      <PermissionGate permissions={[PERMISSION_TYPES.SYNC_FORM]} userPermissions={permissions}>
        <MoreOptions
          setAnchorElSourceType={setAnchorElSourceType}
          pushToMetro={pushToMetro}
          sourceOperationStatus={sourceOperationStatus}
        />
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
        {showSharePopup && (
          // Massive refactor needed - dogshit component
          <UserPicker
            form={form}
            closeSharePopupAndRefreshForm={(users, updatedForm) => {
              // if we got updated form from UserPicker, use it to update the form state, otherwise use existing form and just update users
              const formToUpdate = updatedForm || { ...form, users };

              setForm(formToUpdate);
              setShowSharePopup(false);
            }}
          />
        )}
      </PermissionGate>

      <Tooltip title="חזרה">
        <Button onClick={() => navigate("/")} variant="customIcon">
          <CustomIcon forcePointer iconName="arrowBack" />
        </Button>
      </Tooltip>

      <SyncTypeMenu
        anchorElSourceType={anchorElSourceType}
        handleCloseMoreActions={handleCloseMoreActions}
        handleAutomaticSource={handleAutomaticSource}
      />
    </Box>
  );
};
