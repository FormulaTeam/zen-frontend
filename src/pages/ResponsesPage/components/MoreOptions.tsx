import {
  CloudOutlined,
  DeleteOutline,
  DeleteSweepOutlined,
  MoreVert,
  SyncOutlined,
  TableView,
  UploadOutlined,
} from "@mui/icons-material";
import { ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material";
import { FC, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { permission, responsesScopeOption } from "formula-gear";

import { useDeleteForm, useSoftDeleteResponses } from "../../../api";
import ConfirmDeleteDialog from "../../../components/BasePopup/ConfirmDeleteDialog";
import { useFormStore } from "../stores/form.store";
import { SourceOperationStatus, SourceOperationStatusType } from "./FormActionsToolbar";
import { UploadResponses } from "./UploadResponses";
import { PermissionGate } from "@src/components/PermissionGate";
import { useSuperAdmin } from "@src/contexts/SuperAdminContext";
import { IconOnlyButton } from "../styled";
import { getResponsesAndExportToExcel } from "@utils/utils";
interface MoreOptionsProps {
  setAnchorElSourceType: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  pushToMetro: () => Promise<void>;
  sourceOperationStatus: SourceOperationStatusType;
}

export const MoreOptions: FC<MoreOptionsProps> = ({
  setAnchorElSourceType,
  pushToMetro,
  sourceOperationStatus,
}: MoreOptionsProps) => {
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const { permissions, form, rows } = useFormStore();
  const { isSuperAdmin } = useSuperAdmin();

  const [anchorElMoreActions, setAnchorElMoreActions] = useState<HTMLElement | null>(null);
  const [showDeleteFormPopup, setShowDeleteFormPopup] = useState(false);
  const [showDeleteResponsesPopup, setShowDeleteResponsesPopup] = useState(false);
  const [showImportFromExcelPopup, setShowImportFromExcelPopup] = useState(false);

  const { mutate: deleteForm } = useDeleteForm({ id: formId ?? "" });
  const { mutate: softDeleteResponses } = useSoftDeleteResponses(formId ?? "");

  const hasVisibleOptions = useMemo(() => {
    if (isSuperAdmin) return true;

    const requiredPermissions = [
      permission.SyncForm,
      permission.ImportResponses,
      permission.ExportForm,
      permission.DeleteForm,
      permission.DeleteAnyResponse,
    ];

    return requiredPermissions.some((p) => (permissions || []).includes(p));
  }, [isSuperAdmin, permissions]);

  if (!permissions || !form || !formId || !hasVisibleOptions) return null;

  const hasMetroSource = !!(form.metro_access_url || form.oasisSourceKey);
  const hasFormFields = (form.sections ?? []).some((section) => (section.fields?.length ?? 0) > 0);

  const closeMoreActionsMenu = () => {
    setAnchorElMoreActions(null);
  };

  const handleExportToExcel = async () => {
    closeMoreActionsMenu();
    await getResponsesAndExportToExcel(form);
  };

  const handleImportFromExcel = () => {
    closeMoreActionsMenu();
    setShowImportFromExcelPopup(true);
  };

  const handleDeleteForm = () => {
    closeMoreActionsMenu();
    setShowDeleteFormPopup(true);
  };

  const handleDeleteResponses = () => {
    closeMoreActionsMenu();
    setShowDeleteResponsesPopup(true);
  };

  const getSourceOperationTooltip = (): string => {
    if (sourceOperationStatus === SourceOperationStatus.CREATING)
      return "סנכרון נתונים למטרו יתאפשר לאחר סיום יצירת המקור";

    if (sourceOperationStatus === SourceOperationStatus.EDITING)
      return "סנכרון נתונים למטרו יתאפשר לאחר סיום עריכת המקור";

    return "";
  };

  const syncingDataMenuItem = useMemo(
    () => (
      <MenuItem
        disabled={
          !rows.length ||
          sourceOperationStatus === SourceOperationStatus.CREATING ||
          sourceOperationStatus === SourceOperationStatus.EDITING ||
          !hasMetroSource
        }
        onClick={pushToMetro}>
        <ListItemIcon>
          <SyncOutlined sx={{ fontSize: 22 }} />
        </ListItemIcon>
        <ListItemText>סנכרון לאואזיס</ListItemText>
      </MenuItem>
    ),
    [rows.length, sourceOperationStatus, hasMetroSource, pushToMetro],
  );

  return (
    <>
      <Tooltip title="פעולות נוספות">
        <IconOnlyButton onClick={(event) => setAnchorElMoreActions(event.currentTarget)}>
          <MoreVert />
        </IconOnlyButton>
      </Tooltip>

      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorElMoreActions}
        open={anchorElMoreActions !== null}
        onClose={closeMoreActionsMenu}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}>
        <PermissionGate requiredPermissions={[permission.SyncForm]} userPermissions={permissions}>
          {sourceOperationStatus === SourceOperationStatus.NOT_IN_PROGRESS ? (
            syncingDataMenuItem
          ) : (
            <Tooltip arrow title={getSourceOperationTooltip()}>
              <span style={{ display: "block" }}>{syncingDataMenuItem}</span>
            </Tooltip>
          )}
        </PermissionGate>

        <PermissionGate
          requiredPermissions={[permission.ImportResponses]}
          userPermissions={permissions}>
          <MenuItem disabled={!hasFormFields} onClick={handleImportFromExcel}>
            <ListItemIcon>
              <UploadOutlined sx={{ fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText>ייבוא נתונים</ListItemText>
          </MenuItem>
        </PermissionGate>

        <PermissionGate requiredPermissions={[permission.ExportForm]} userPermissions={permissions}>
          <MenuItem disabled={!hasFormFields} onClick={handleExportToExcel}>
            <ListItemIcon>
              <TableView sx={{ fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText>ייצוא לאקסל</ListItemText>
          </MenuItem>
        </PermissionGate>

        <PermissionGate requiredPermissions={[permission.DeleteForm]} userPermissions={permissions}>
          <MenuItem onClick={handleDeleteForm}>
            <ListItemIcon>
              <DeleteOutline sx={{ color: "red", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText sx={{ color: "red" }}>מחיקת הטופס</ListItemText>
          </MenuItem>
        </PermissionGate>

        <PermissionGate
          requiredPermissions={[permission.DeleteAnyResponse]}
          userPermissions={permissions}>
          <MenuItem onClick={handleDeleteResponses} disabled={rows.length === 0}>
            <ListItemIcon>
              <DeleteSweepOutlined sx={{ color: "red", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText sx={{ color: "red" }}>מחיקת כל התגובות</ListItemText>
          </MenuItem>
        </PermissionGate>
      </Menu>

      <UploadResponses
        showImportFromExcelPopup={showImportFromExcelPopup}
        setShowImportFromExcelPopup={setShowImportFromExcelPopup}
      />

      {showDeleteFormPopup && (
        <ConfirmDeleteDialog
          open={showDeleteFormPopup}
          title="מחיקת טופס"
          message="האם אתה בטוח שברצונך למחוק את הטופס?"
          onConfirm={() => {
            deleteForm(undefined, {
              onSuccess: () => {
                navigate("/", { replace: true });
              },
            });
          }}
          onClose={() => setShowDeleteFormPopup(false)}
          confirmText="מחק טופס"
        />
      )}

      {showDeleteResponsesPopup && (
        <ConfirmDeleteDialog
          open={showDeleteResponsesPopup}
          title="מחיקת תגובות"
          message="האם אתה בטוח שברצונך למחוק את כל התגובות לטופס?"
          onConfirm={() => {
            softDeleteResponses(
              {
                scope: responsesScopeOption.AllResponses,
              },
              {
                onSuccess: () => {
                  setShowDeleteResponsesPopup(false);
                },
              },
            );
          }}
          onClose={() => setShowDeleteResponsesPopup(false)}
          confirmText="מחק תגובות"
        />
      )}
    </>
  );
};
