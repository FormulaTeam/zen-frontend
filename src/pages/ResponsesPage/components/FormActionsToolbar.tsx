import SyncIcon from "@mui/icons-material/Sync";
import { Box, Tooltip } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import MetroSyncingPopup from "@components/ResponseToolbar/Popups/MetroSyncingPopup";
import SyncTypeMenu from "@components/ResponseToolbar/Menus/SyncTypeMenu";
import UserPicker from "../../../components/UserPicker/UserPicker";
import { useMetro } from "@hooks/useMetro";
import { useFormStore } from "../stores/form.store";
import { MoreOptions } from "./MoreOptions";
import { permission } from "formula-gear";
import { PermissionGate } from "@src/components/PermissionGate";
import { IconOnlyButton } from "../styled";

export const SourceOperationStatus = {
  NOT_IN_PROGRESS: "not_in_progress",
  CREATING: "creating",
  EDITING: "editing",
} as const;

export type SourceOperationStatusType =
  (typeof SourceOperationStatus)[keyof typeof SourceOperationStatus];

export const FormActionsToolbar = () => {
  const { permissions, form, setForm } = useFormStore();
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [anchorElSourceType, setAnchorElSourceType] = useState<null | HTMLElement>(null);
  const [sourceOperationStatus, setSourceOperationStatus] = useState<SourceOperationStatusType>(
    SourceOperationStatus.NOT_IN_PROGRESS,
  );

  if (!permissions || !form || !formId) return null;

  const hasFormFields = (form.sections ?? []).some((section) => (section.fields?.length ?? 0) > 0);

  const { showMetroPopup, setShowMetroPopup, pushToMetro, syncSourceToMetro, editSource } =
    useMetro({
      form,
      loadingIcon: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <SyncIcon
            sx={{
              fontSize: 30,
              "@keyframes spin": {
                from: { transform: "rotate(360deg)" },
                to: { transform: "rotate(0deg)" },
              },
              animation: "spin 1.2s linear infinite",
            }}
          />
        </div>
      ),
      setSourceOperationStatus,
    });

  const handleCloseMoreActions = (): void => {
    setAnchorElSourceType(null);
  };

  const handleAutomaticSource = (): void => {
    if (form?.metro_access_url || form?.oasisSourceKey) editSource();
    else syncSourceToMetro();

    handleCloseMoreActions();
  };

  return (
    <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
      {/* More options (now first) */}
      <PermissionGate
        requiredPermissions={[
          permission.SyncForm,
          permission.DeleteForm,
          permission.ShareForm,
          permission.ExportForm,
          permission.ImportResponses,
          permission.DeleteAnyResponse,
        ]}
        userPermissions={permissions}>
        <MoreOptions
          setAnchorElSourceType={setAnchorElSourceType}
          pushToMetro={pushToMetro}
          sourceOperationStatus={sourceOperationStatus}
        />
      </PermissionGate>

      {/* Edit */}
      <PermissionGate requiredPermissions={[permission.UpdateForm]} userPermissions={permissions}>
        <Tooltip title="עריכת טופס">
          <IconOnlyButton
            onClick={() =>
              navigate(`/form/edit/${formId}`, {
                state: { from: location.pathname },
              })
            }>
            <EditIcon />
          </IconOnlyButton>
        </Tooltip>
      </PermissionGate>

      {/* Share */}
      <PermissionGate requiredPermissions={[permission.ShareForm]} userPermissions={permissions}>
        <Tooltip title="שיתוף">
          <IconOnlyButton disabled={!hasFormFields} onClick={() => setShowSharePopup(true)}>
            <ShareIcon />
          </IconOnlyButton>
        </Tooltip>

        {showSharePopup && (
          <UserPicker
            form={form}
            closeSharePopupAndRefreshForm={(users, updatedForm) => {
              const formToUpdate = updatedForm || form;
              setForm(formToUpdate as typeof form);
              setShowSharePopup(false);
            }}
          />
        )}
      </PermissionGate>

      {/* Back (now last) */}
      <Tooltip title="חזרה">
        <IconOnlyButton onClick={() => navigate("/")}>
          <ArrowBackIcon />
        </IconOnlyButton>
      </Tooltip>

      <SyncTypeMenu
        anchorElSourceType={anchorElSourceType}
        handleCloseMoreActions={handleCloseMoreActions}
        handleAutomaticSource={handleAutomaticSource}
      />

      {showMetroPopup && <MetroSyncingPopup setShowMetroPopup={setShowMetroPopup} />}
    </Box>
  );
};
