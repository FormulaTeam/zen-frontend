import { Typography, IconButton, Stack, Tooltip, Chip } from "@mui/material";
import { Edit } from "@mui/icons-material";
import PublicIcon from "@mui/icons-material/Public";
import DeleteIcon from "@mui/icons-material/Delete";
import PushPinIcon from "@mui/icons-material/PushPin";
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
import BasePopup from "../../BasePopup/BasePopup";

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
                    <PublicIcon fontSize="small" />
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
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        stop(e);
                        onEditView(view);
                      }}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                )}

                {onDeleteView && (
                  <Tooltip title={HebrewTitles.DELETE_VIEW}>
                    <IconButton size="small" color="error" onClick={openDeletePopup}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </ViewCardButtons>
            )}
          </ViewCardActions>
        </ViewCardContent>
      </ViewCard>

      <BasePopup
        open={isDeletePopupOpen}
        onClose={closeDeletePopup}
        title={HebrewTitles.DELETE_CONFIRM_TITLE}
        content={`האם אתה בטוח שברצונך למחוק את תצוגת ${view.name}?`}
        mainButton={{
          text: HebrewTitles.DELETE_CONFIRM_APPROVE,
          onClick: handleDelete,
          color: "error",
        }}
        cancelButton={{
          text: HebrewTitles.DELETE_CONFIRM_CANCEL,
          onClick: closeDeletePopup,
        }}
      />
    </>
  );
}
