import { Typography, Stack, Tooltip, Chip } from "@mui/material";
import { Globe, Pencil, Trash2 } from "lucide-react";
import {
  ViewCard,
  ViewCardContent,
  ViewCardActions,
  ViewCardInfo,
  ViewCardButtons,
  ViewNameTypography,
  ViewChipsContainer,
} from "../ViewManager/styled";
import { ResponsesView } from "../../../types/interfaces/tableViews.types";
import { useState } from "react";
import ConfirmDeleteDialog from "../../BasePopup/ConfirmDeleteDialog";
import { IconOnlyButton } from "../../../pages/ResponsesPage/styled";

enum HebrewTitles {
  EDIT_VIEW = "עריכת תצוגה",
  DELETE_VIEW = "מחיקת תצוגה",
  CREATED_BY = "נוצרה על ידי",
  DEFAULT = "ברירת מחדל",
  PUBLIC_VIEW = "תצוגה ציבורית",
  DELETE_CONFIRM_TITLE = "מחיקת תצוגה",
  DELETE_CONFIRM_CANCEL = "ביטול",
  DELETE_CONFIRM_APPROVE = "מחיקה",
}

interface SavedViewCardProps {
  view: ResponsesView;
  canEditOrDeleteView: (view: ResponsesView) => boolean;
  onLoadView: (view: ResponsesView) => void;
  onEditView?: (view: ResponsesView) => void;
  onDeleteView?: (view: ResponsesView) => void;
  currentViewId?: string | number | null;
  setCurrentViewId?: (id: string | number | null) => void;
}

export function SavedViewCard({
  view,
  canEditOrDeleteView,
  onLoadView,
  onEditView,
  onDeleteView,
  currentViewId,
  setCurrentViewId,
}: SavedViewCardProps) {
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const canEdit = canEditOrDeleteView(view);

  const handleLoad = () => onLoadView(view);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const openDeletePopup = (e: React.MouseEvent) => {
    stop(e);
    setIsDeletePopupOpen(true);
  };

  const closeDeletePopup = () => {
    setIsDeletePopupOpen(false);
  };

  const handleDelete = () => {
    onDeleteView?.(view);
    closeDeletePopup();
  };

  return (
    <>
      <ViewCard
        role="button"
        tabIndex={0}
        onClick={() => {
          handleLoad();
          setCurrentViewId && setCurrentViewId(view.id ?? null);
        }}
        $isSelected={currentViewId === view.id}>
        <ViewCardContent>
          <ViewCardActions>
            <ViewCardInfo>
              <Stack direction="row" spacing={1} alignItems="center">
                <ViewNameTypography variant="body1" $isDefault={view.isDefault}>
                  {view.name}
                </ViewNameTypography>
                {view.isPublic && (
                  <Tooltip title={HebrewTitles.PUBLIC_VIEW}>
                    <Globe size={16} strokeWidth={2.4} />
                  </Tooltip>
                )}
                {view.isDefault && <Chip label={HebrewTitles.DEFAULT} size="small"></Chip>}
              </Stack>

              <ViewChipsContainer></ViewChipsContainer>

              <Typography variant="caption" color="text.secondary">
                {HebrewTitles.CREATED_BY}{" "}
                {view.createdByName ||
                  (typeof view.createdBy === "object" ? view.createdBy.name : view.createdBy)}
              </Typography>
            </ViewCardInfo>

            {canEdit && (
              <ViewCardButtons>
                {onEditView && (
                  <Tooltip title={HebrewTitles.EDIT_VIEW}>
                    <IconOnlyButton
                      size="small"
                      onClick={(e) => {
                        stop(e);
                        onEditView(view);
                      }}>
                      <Pencil size={18} strokeWidth={2.4} />
                    </IconOnlyButton>
                  </Tooltip>
                )}

                {onDeleteView && (
                  <Tooltip title={HebrewTitles.DELETE_VIEW}>
                    <IconOnlyButton size="small" onClick={openDeletePopup} $hoverColor="red">
                      <Trash2 size={18} strokeWidth={2.4} />
                    </IconOnlyButton>
                  </Tooltip>
                )}
              </ViewCardButtons>
            )}
          </ViewCardActions>
        </ViewCardContent>
      </ViewCard>

      <ConfirmDeleteDialog
        open={isDeletePopupOpen}
        onClose={closeDeletePopup}
        title={HebrewTitles.DELETE_CONFIRM_TITLE}
        message={`האם אתה בטוח שברצונך למחוק את תצוגת ${view.name}?`}
        onConfirm={handleDelete}
        confirmText={HebrewTitles.DELETE_CONFIRM_APPROVE}
        cancelText={HebrewTitles.DELETE_CONFIRM_CANCEL}
      />
    </>
  );
}
