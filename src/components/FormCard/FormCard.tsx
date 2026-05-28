import React, { useState } from "react";

import * as MuiIcons from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
} from "@mui/material";
import { MoreVert, ChatBubbleOutline, EditOutlined, ShareOutlined, DeleteOutline } from "@mui/icons-material";
import { permission } from "formula-gear";
import UserPicker from "../UserPicker/UserPicker";
import ShareIcon from "../../icons/share.svg";
import formX from "../../images/form_x.png";
import { CustomIcon } from "../../theme/icons";
import { getFormIconByName } from "../../utils/utils";
import CardCreationDetails from "./CardCreationDetails";
import { PermissionGate } from "../PermissionGate";
import {
  DescriptionDiv,
  FormIconWrapper,
  ItemBottomDiv,
  ItemBtnsDiv,
  ItemButton,
  ItemDescription,
  ItemIconsDiv,
  ItemImgAndTitles,
  ItemResponsesNum,
  ItemTitle,
  ItemTitleAndNum,
  ItemTitles,
  StyledCard,
} from "./styled";
import { GrayShareIcon } from "./styled";
import { FormOverviewDto } from "@src/types/shared";
import { useDeleteForm } from "../../api/formsApi";
import { toast } from "sonner";
import ConfirmDeleteDialog from "../BasePopup/ConfirmDeleteDialog";

const FormCard = ({
  form,
  isSuperAdmin,
  navigate,
  resetSearchValue,
  isCreator,
}: {
  form: FormOverviewDto;
  isSuperAdmin: boolean | null;
  navigate: any;
  resetSearchValue: () => void;
  isCreator: boolean;
}) => {
  const theme = useTheme();
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const deleteFormMutation = useDeleteForm({ id: form.id.toString() });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleShareClick = async () => {
    handleMenuClose();
    setShowSharePopup(true);
  };

  const handleEditClick = () => {
    handleMenuClose();
    navigate(`/form/edit/${form.id}`, { state: { from: location.pathname } });
  };

  const handleDeleteClick = async () => {
    handleMenuClose();
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteFormMutation.mutateAsync();
      toast.success("הטופס נמחק בהצלחה");
    } catch (error) {
      toast.error("מחיקת הטופס נכשלה");
    }
  };

  const renderDynamicIcon = (name: string) => {
    const IconComponent = MuiIcons[name as keyof typeof MuiIcons];

    return IconComponent ? <IconComponent sx={{ color: "#020618" }} /> : name;
  };

  const getIcon = (iconName: string | null) => {
    const iconSrc = getFormIconByName(iconName ?? undefined);

    if (typeof iconSrc === "string") {
      return (
        <FormIconWrapper>
          <img src={iconSrc} alt={iconName ?? "form icon"} />
        </FormIconWrapper>
      );
    }

    if (iconSrc) {
      const IconComponent = iconSrc;
      return (
        <FormIconWrapper>
          <IconComponent sx={{ color: "#020618" }} />
        </FormIconWrapper>
      );
    }

    if (!iconName) {
      return (
        <FormIconWrapper>
          <img src={formX} alt="form icon" />
        </FormIconWrapper>
      );
    }

    return <FormIconWrapper>{renderDynamicIcon(iconName)}</FormIconWrapper>;
  };

  const goToResponsesPage = (event: React.MouseEvent<HTMLElement>) => {
    resetSearchValue();
    navigate(`/responses/${form.id}`, { replace: true });
    event.stopPropagation();
  };

  if (!form) return null;

  const userPermissions =
    (isSuperAdmin || isCreator ? Object.values(permission) : form.permissions) ?? [];

  const hasMenuPermissions = userPermissions.some((perm) =>
    [permission.UpdateForm, permission.ShareForm].includes(perm as any),
  );

  return (
    <StyledCard
      sx={{ backgroundcolor: theme.palette.background.paper }}
      data-testid={`form-id-${form.id}`}
      className="form-card">
      <ItemImgAndTitles>
        <ItemTitles>
          <ItemTitleAndNum>
            <Box sx={{ display: "flex", alignItems: "center", overflow: "hidden", gap: "12px", flex: 1 }}>
              {getIcon(form.icon ?? null)}
              <ItemTitle onClick={goToResponsesPage} title={form.name} className="form-title" sx={{ color: "#020618" }}>
                {form.name}
              </ItemTitle>
            </Box>

            {hasMenuPermissions && (
              <>
                <IconButton
                  aria-label="more"
                  id="long-button"
                  aria-controls={openMenu ? "long-menu" : undefined}
                  aria-expanded={openMenu ? "true" : undefined}
                  aria-haspopup="true"
                  onClick={handleMenuClick}
                  size="small"
                  sx={{ color: "#62748E" }}>
                  <MoreVert />
                </IconButton>
                <Menu
                  id="long-menu"
                  MenuListProps={{
                    "aria-labelledby": "long-button",
                  }}
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={handleMenuClose}
                  PaperProps={{
                    style: {
                      maxHeight: 48 * 4.5,
                      minWidth: "160px",
                      borderRadius: "8px",
                      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                    },
                  }}>
                  <PermissionGate
                    userPermissions={userPermissions}
                    requiredPermissions={[permission.UpdateForm]}>
                    <MenuItem onClick={handleEditClick} sx={{ fontSize: "14px", gap: 1, color: "#020618" }}>
                      <EditOutlined fontSize="small" /> עריכת טופס
                    </MenuItem>
                  </PermissionGate>

                  <PermissionGate
                    userPermissions={userPermissions}
                    requiredPermissions={[permission.ShareForm]}>
                    <MenuItem onClick={handleShareClick} sx={{ fontSize: "14px", gap: 1, color: "#020618" }}>
                      <ShareOutlined fontSize="small" /> שיתוף טופס
                    </MenuItem>
                  </PermissionGate>

                  <PermissionGate
                    userPermissions={userPermissions}
                    requiredPermissions={[permission.UpdateForm]}>
                    <MenuItem
                      onClick={handleDeleteClick}
                      sx={{ fontSize: "14px", color: theme.palette.error.main, gap: 1 }}>
                      <DeleteOutline fontSize="small" /> מחיקת טופס
                    </MenuItem>
                  </PermissionGate>
                </Menu>
              </>
            )}
          </ItemTitleAndNum>

          <DescriptionDiv>
            <ItemDescription className="form-description" sx={{ color: "#020618" }}>
              {form.description ? form.description : "-"}
            </ItemDescription>
          </DescriptionDiv>
        </ItemTitles>
      </ItemImgAndTitles>

      <Box sx={{ width: "100%", mt: "auto" }}>
        <Box sx={{ mb: 1 }}>
          <CardCreationDetails form={form} />
        </Box>

        <Divider sx={{ mb: 1, borderColor: "#D1D1D1", opacity: 0.6 }} />

        <ItemBottomDiv sx={{ marginTop: 0, alignItems: "center" }}>
          <ItemResponsesNum className="form-responses-count" sx={{ color: "#020618", gap: 0.5 }}>
            <ChatBubbleOutline sx={{ fontSize: "18px" }} />
            {form.responsesCount ?? 0}
          </ItemResponsesNum>

          {showSharePopup && (
            <UserPicker
              form={form}
              closeSharePopupAndRefreshForm={() => {
                setShowSharePopup(false);
              }}
            />
          )}

          {showDeletePopup && (
            <ConfirmDeleteDialog
              open={showDeletePopup}
              title="מחיקת טופס"
              message="האם אתה בטוח שברצונך למחוק את הטופס?"
              onConfirm={confirmDelete}
              onClose={() => setShowDeletePopup(false)}
              confirmText="מחק טופס"
            />
          )}

          <ItemBtnsDiv>
            <PermissionGate
              userPermissions={userPermissions}
              requiredPermissions={[permission.CreateResponse]}>
              <ItemButton
                className="form-add-response-button"
                onClick={() => navigate(`/response/create/${form.id}`)}
                variant="outlined"
                sx={{
                  height: "32px",
                  color: "#020618",
                  borderColor: "#D1D1D1",
                  borderRadius: "8px",
                  fontWeight: 400,
                  fontSize: "14px",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#020618",
                    backgroundColor: "rgba(2, 6, 24, 0.04)",
                    color: "#020618",
                  },
                }}>
                הוספת תגובה
              </ItemButton>
            </PermissionGate>
          </ItemBtnsDiv>
        </ItemBottomDiv>
      </Box>
      </StyledCard>
      );
      };
export default FormCard;
