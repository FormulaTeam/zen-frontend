import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

import * as MuiIcons from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { MoreVert, ChatBubbleOutline, EditOutlined, ShareOutlined, DeleteOutline } from "@mui/icons-material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import { Pin } from "lucide-react";
import { permission, MAX_PINNED_FORMS } from "formula-gear";
import UserPicker from "../UserPicker/UserPicker";
import { getFormIconByName } from "../../utils/utils";
import { highlightText } from "../../utils/highlighting";
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
import { FormOverviewDto } from "@src/types/shared";
import { getFormById, useDeleteForm, usePinForm, useUnpinForm } from "../../api/formsApi";
import { toast } from "sonner";
import ConfirmDeleteDialog from "../BasePopup/ConfirmDeleteDialog";
import DuplicateFormDialog from "./DuplicateFormDialog";
import {
  buildDuplicatedFormStructure,
  type DuplicateFormSelections,
} from "@pages/FormEditor/utils/duplicateForm";
import { IPath } from "@src/types/enums/global.enums";

const FormCard = ({
  form,
  isSuperAdmin,
  navigate,
  resetSearchValue,
  isCreator,
  searchValue,
}: {
  form: FormOverviewDto;
  isSuperAdmin: boolean | null;
  navigate: any;
  resetSearchValue: () => void;
  isCreator: boolean;
  searchValue?: string;
}) => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const showSharePopup = searchParams.get("modal") === "permissions" && searchParams.get("formId") === form.id.toString();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const openMenu = Boolean(anchorEl);

  const deleteFormMutation = useDeleteForm({ id: form.id.toString() });
  const pinFormMutation = usePinForm();
  const unpinFormMutation = useUnpinForm();


  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleShareClick = async () => {
    handleMenuClose();
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.set("modal", "permissions");
      updated.set("formId", form.id.toString());
      return updated;
    }, { replace: true });
  };

  const handleEditClick = () => {
    handleMenuClose();
    navigate(`/forms/${form.id}/edit`, { state: { from: location.pathname } });
  };

  const handleDeleteClick = async () => {
    handleMenuClose();
    setShowDeletePopup(true);
  };

  const handleDuplicateClick = () => {
    handleMenuClose();
    setShowDuplicatePopup(true);
  };

  const handleDuplicateConfirm = async ({
    selections,
    duplicateName,
    duplicateDescription,
  }: {
    selections: DuplicateFormSelections;
    duplicateName: string;
    duplicateDescription: string;
  }) => {
    const sourceFormId = Number(form.id);
    const sourceForm = await getFormById(sourceFormId);

    if (!sourceForm) {
      throw new Error("Source form could not be loaded for duplication");
    }

    const duplicateFormStructure = buildDuplicatedFormStructure(
      sourceForm,
      selections,
      duplicateName,
      duplicateDescription,
    );
    const duplicateSelections = {
      permissions: selections.permissions,
      fields: selections.fields,
      conditions: selections.conditions,
    };
    duplicateFormStructure.duplicate = {
      sourceFormId,
      selections: duplicateSelections,
    };

    setShowDuplicatePopup(false);
    navigate(IPath.FORM_CREATE, {
      state: {
        duplicateFormStructure,
        duplicateSourceFormId: sourceFormId,
        duplicateSelections,
      },
    });
  };

  const handleDuplicateError = () => {
    setShowDuplicatePopup(false);
    toast.error(`לא ניתן היה לשכפל את הטופס "${form.name}".`, {
      duration: 4000,
      position: "top-right",
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteFormMutation.mutateAsync();
      toast.success("הטופס נמחק בהצלחה");
    } catch (error) {
      toast.error("מחיקת הטופס נכשלה");
    }
  };

  const handlePinToggle = async (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    if (form.isPinned) {
      try {
        await unpinFormMutation.mutateAsync(form.id);
      } catch (error) {
        toast.error("אירעה שגיאה בביטול נעיצת הטופס. נסו שוב.");
      }
      return;
    }

    try {
      await pinFormMutation.mutateAsync(form.id);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error(`לא ניתן לנעוץ יותר מ־${MAX_PINNED_FORMS} טפסים.`);
      } else {
        toast.error("אירעה שגיאה בנעיצת הטופס. נסו שוב.");
      }
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

    return (
      <FormIconWrapper>
        {renderDynamicIcon(iconName ?? "grid_view")}
      </FormIconWrapper>
    );
  };

  const goToResponsesPage = (event?: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation();
    resetSearchValue();
    navigate(`/forms/${form.id}/responses`, { replace: true });
  };

  const stopPropagation = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  if (!form) return null;

  const userPermissions =
    (isSuperAdmin || isCreator ? Object.values(permission) : form.permissions) ?? [];

  const hasMenuPermissions = userPermissions.some((perm) =>
    [permission.UpdateForm, permission.ShareForm, permission.DeleteForm].includes(perm as any),
  );

  const canDuplicateForm = [permission.UpdateForm, permission.ShareForm, permission.DeleteForm].every(
    (perm) => userPermissions.includes(perm as any),
  );

  return (
    <StyledCard
      sx={{ backgroundcolor: theme.palette.background.paper, cursor: "pointer", position: "relative" }}
      data-testid={`form-id-${form.id}`}
      onClick={goToResponsesPage}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="form-card">
      <ItemImgAndTitles>
        <ItemTitles>
          <ItemTitleAndNum>
            <Box sx={{ display: "flex", alignItems: "center", overflow: "hidden", gap: "12px", flex: 1 }}>
              {getIcon(form.icon ?? null)}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                  overflow: "hidden",
                  flex: 1,
                }}>
                <ItemTitle
                  onClick={goToResponsesPage}
                  title={form.name}
                  className="form-title"
                  sx={{ color: "#020618" }}>
                  {highlightText(form.name, searchValue)}
                </ItemTitle>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#62748E",
                    minWidth: "max-content",
                    fontWeight: 400,
                    fontSize: "11px",
                  }}>
                  {highlightText(form.id, searchValue)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              {isHovered && (
                <Tooltip arrow title={form.isPinned ? "ביטול נעיצה" : "נעיצת טופס"}>
                  <IconButton
                    aria-label={form.isPinned ? "unpin form" : "pin form"}
                    data-testid={`pin-form-button-${form.id}`}
                    onClick={handlePinToggle}
                    size="small"
                    sx={{
                      color: form.isPinned ? theme.palette.primary.main : "#62748E",
                    }}>
                    <Pin size={18} fill={form.isPinned ? "currentColor" : "none"} />
                  </IconButton>
                </Tooltip>
              )}

              {hasMenuPermissions && (
                <>
                  <IconButton
                    aria-label="more"
                    id="long-button"
                    aria-controls={openMenu ? "long-menu" : undefined}
                    aria-expanded={openMenu ? "true" : undefined}
                    aria-haspopup="true"
                    onClick={(e) => {
                      stopPropagation(e);
                      handleMenuClick(e);
                    }}
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
                    onClick={stopPropagation}
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
                        <EditOutlined fontSize="small" /> עריכה
                      </MenuItem>
                    </PermissionGate>

                    <PermissionGate
                      userPermissions={userPermissions}
                      requiredPermissions={[permission.ShareForm]}>
                      <MenuItem onClick={handleShareClick} sx={{ fontSize: "14px", gap: 1, color: "#020618" }}>
                        <ShareOutlined fontSize="small" /> שיתוף
                      </MenuItem>
                    </PermissionGate>

                    {canDuplicateForm && (
                      <MenuItem
                        onClick={handleDuplicateClick}
                        sx={{ fontSize: "14px", gap: 1, color: "#020618" }}>
                        <ContentCopyOutlinedIcon fontSize="small" /> שכפול
                      </MenuItem>
                    )}

                    <PermissionGate
                      userPermissions={userPermissions}
                      requiredPermissions={[permission.DeleteForm]}>
                      <MenuItem
                        onClick={handleDeleteClick}
                        sx={{ fontSize: "14px", color: theme.palette.error.main, gap: 1 }}>
                        <DeleteOutline fontSize="small" /> מחיקה
                      </MenuItem>
                    </PermissionGate>
                  </Menu>
                </>
              )}
            </Box>
          </ItemTitleAndNum>

          <DescriptionDiv>
            <ItemDescription className="form-description" sx={{ color: "#020618" }}>
              {form.description ? highlightText(form.description, searchValue) : "-"}
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
            <Box onClick={stopPropagation}>
              <UserPicker
                form={form}
                closeSharePopupAndRefreshForm={() => {
                  setSearchParams((prev) => {
                    const updated = new URLSearchParams(prev);
                    updated.delete("modal");
                    updated.delete("formId");
                    return updated;
                  }, { replace: true });
                }}
              />
            </Box>
          )}

          {showDeletePopup && (
            <Box onClick={stopPropagation}>
              <ConfirmDeleteDialog
                open={showDeletePopup}
                title="מחיקת טופס"
                message="האם אתה בטוח שברצונך למחוק את הטופס?"
                onConfirm={confirmDelete}
                onClose={() => setShowDeletePopup(false)}
                confirmText="מחק טופס"
              />
            </Box>
          )}

          {showDuplicatePopup && (
            <Box onClick={stopPropagation}>
              <DuplicateFormDialog
                open={showDuplicatePopup}
                formName={form.name}
                formDescription={form.description}
                onClose={() => setShowDuplicatePopup(false)}
                onDuplicateError={handleDuplicateError}
                onDuplicate={handleDuplicateConfirm}
              />
            </Box>
          )}

          <ItemBtnsDiv>
            <PermissionGate
              userPermissions={userPermissions}
              requiredPermissions={[permission.CreateResponse]}>
              <ItemButton
                className="form-add-response-button"
                onClick={(e) => {
                  stopPropagation(e);
                  navigate(`/forms/${form.id}/responses/new`);
                }}
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
