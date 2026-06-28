import SyncIcon from "@mui/icons-material/Sync";
import { Box, Tooltip } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
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

const headerActionButtonBaseSx = {
  height: 42,
  borderRadius: "10px",
  backgroundColor: "#ffffff",
  color: "#1a1a24",
  border: "none",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
  textTransform: "none",
  fontWeight: 600,
  lineHeight: 1,
  transition: "background-color 160ms ease, box-shadow 160ms ease",

  "&:hover": {
    backgroundColor: "#ffffff",
    boxShadow: "0 6px 12px rgba(15, 23, 42, 0.08)",
  },

  "&.Mui-disabled": {
    backgroundColor: "#f8fafc",
    color: "#94a3b8",
    boxShadow: "none",
  },
};

export const responseIconButtonSx = {
  ...headerActionButtonBaseSx,
  width: 50,
  minWidth: 50,
  p: 0,

  "& svg": {
    fontSize: 24,
  },
};

export type SourceOperationStatusType =
  (typeof SourceOperationStatus)[keyof typeof SourceOperationStatus];

export const FormActionsToolbar = () => {
  const { permissions, form, setForm } = useFormStore();
  const { formId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const showSharePopup = searchParams.get("modal") === "permissions";
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
          buttonSx={responseIconButtonSx}
        />
      </PermissionGate>

      {/* Edit */}
      <PermissionGate requiredPermissions={[permission.UpdateForm]} userPermissions={permissions}>
        <Tooltip title="עריכת טופס">
          <IconOnlyButton
            sx={responseIconButtonSx}
            onClick={() =>
              navigate(`/forms/${formId}/edit`, {
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
          <IconOnlyButton
            sx={responseIconButtonSx}
            disabled={!hasFormFields}
            onClick={() => {
              setSearchParams(
                (prev) => {
                  const updated = new URLSearchParams(prev);
                  updated.set("modal", "permissions");
                  return updated;
                },
                { replace: true },
              );
            }}>
            <ShareIcon />
          </IconOnlyButton>
        </Tooltip>

        {showSharePopup && (
          <UserPicker
            form={form}
            closeSharePopupAndRefreshForm={(users, updatedForm) => {
              const formToUpdate = updatedForm || form;
              setForm(formToUpdate as typeof form);

              setSearchParams(
                (prev) => {
                  const updated = new URLSearchParams(prev);
                  updated.delete("modal");
                  return updated;
                },
                { replace: true },
              );
            }}
          />
        )}
      </PermissionGate>

      <SyncTypeMenu
        anchorElSourceType={anchorElSourceType}
        handleCloseMoreActions={handleCloseMoreActions}
        handleAutomaticSource={handleAutomaticSource}
      />

      {showMetroPopup && <MetroSyncingPopup setShowMetroPopup={setShowMetroPopup} />}
    </Box>
  );
};
