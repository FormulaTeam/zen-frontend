import { DeleteForever, FileDownload, MoreVert } from "@mui/icons-material";
import { Button, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material";
import { FC, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useDeleteAllFormsResponses, useDeleteForm } from "../../../api";
import deleteResponseImg from "../../../images/delete_response.png";
import ConfirmPopup from "../../../popups/ConfirmPopup/ConfirmPopup";
import { CustomIcon } from "../../../theme/icons";
import { createExcelExport } from "../../../utils/utils";
import { PermissionGate } from "../PermissionGate";
import { useFormStore } from "../stores/form.store";
import { SourceOperationStatus, SourceOperationStatusType } from "./FormActionsToolbar";
import { UploadResponses } from "./UploadResponses";
import { permission } from "formula-gear";

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

  const [anchorElMoreActions, setAnchorElMoreActions] = useState<HTMLElement | null>(null);
  const [showDeleteFormPopup, setShowDeleteFormPopup] = useState(false);
  const [showDeleteResponsesPopup, setShowDeleteResponsesPopup] = useState(false);
  const [showImportFromExcelPopup, setShowImportFromExcelPopup] = useState(false);

  const { mutate: deleteForm } = useDeleteForm({ id: formId ?? "" });
  const { mutate: deleteAllResponses } = useDeleteAllFormsResponses({ formId: formId ?? "" });

  if (!permissions || !form || !formId) return null;

  const hasMetroSource = !!(form.metro_access_url || form.oasisSourceKey);
  const hasFormFields = (form.sections ?? []).some((section) => (section.fields?.length ?? 0) > 0);

  const closeMoreActionsMenu = () => {
    setAnchorElMoreActions(null);
  };

  const handleExportToExcel = () => {
    createExcelExport(form, rows);
    closeMoreActionsMenu();
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
          <CustomIcon iconName={"sync"} style={{ padding: 2 }} />
        </ListItemIcon>
        <ListItemText>סנכרון נתונים</ListItemText>
      </MenuItem>
    ),
    [rows.length, sourceOperationStatus, hasMetroSource, pushToMetro],
  );

  return (
    <>
      <Tooltip title="פעולות נוספות">
        <Button
          variant="customIcon"
          onClick={(event) => setAnchorElMoreActions(event.currentTarget)}>
          <MoreVert sx={{ scale: 1.5 }} />
        </Button>
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
        <PermissionGate permissions={[permission.SyncForm]} userPermissions={permissions}>
          {sourceOperationStatus === SourceOperationStatus.NOT_IN_PROGRESS ? (
            syncingDataMenuItem
          ) : (
            <Tooltip arrow title={getSourceOperationTooltip()}>
              <span style={{ display: "block" }}>{syncingDataMenuItem}</span>
            </Tooltip>
          )}

          {hasMetroSource ? (
            <MenuItem onClick={(event) => setAnchorElSourceType(event.currentTarget)}>
              <ListItemIcon>
                <CustomIcon iconName={"source"} />
              </ListItemIcon>
              <ListItemText>עריכת מקור</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem onClick={(event) => setAnchorElSourceType(event.currentTarget)}>
              <ListItemIcon>
                <CustomIcon iconName={"source"} />
              </ListItemIcon>
              <ListItemText>יצירת מקור</ListItemText>
            </MenuItem>
          )}
        </PermissionGate>

        <PermissionGate
          permissions={[permission.CreateResponse, permission.UpdateAnyResponse]}
          userPermissions={permissions}>
          <MenuItem
            disabled={!hasFormFields}
            onClick={() => {
              setShowImportFromExcelPopup(true);
              closeMoreActionsMenu();
            }}>
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

        <PermissionGate permissions={[permission.ReadForm]} userPermissions={permissions}>
          <MenuItem disabled={!hasFormFields} onClick={handleExportToExcel}>
            <ListItemIcon>
              <FileDownload sx={{ fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText>ייצוא לאקסל</ListItemText>
          </MenuItem>
        </PermissionGate>

        <PermissionGate permissions={[permission.UpdateForm]} userPermissions={permissions}>
          <MenuItem
            onClick={() => {
              setShowDeleteFormPopup(true);
              closeMoreActionsMenu();
            }}>
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
                deleteForm(undefined, {
                  onSuccess: () => {
                    navigate("/", { replace: true });
                  },
                });
              }}
              closePopup={() => setShowDeleteFormPopup(false)}
              okBtnText={"מחק טופס"}
            />
          )}
        </PermissionGate>

        <PermissionGate permissions={[permission.UpdateForm]} userPermissions={permissions}>
          <MenuItem
            onClick={() => {
              setShowDeleteResponsesPopup(true);
              closeMoreActionsMenu();
            }}
            disabled={rows.length === 0}>
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
                deleteAllResponses(undefined);
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
