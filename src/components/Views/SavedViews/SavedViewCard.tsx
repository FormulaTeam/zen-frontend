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

enum HebrewTitles {
  EditView = "עריכת תצוגה",
  DeleteView = "מחיקת תצוגה",
  CreatedBy = "נוצרה על ידי",
}

interface SavedViewCardProps {
  view: ResponsesView;
  canEditOrDeleteView: (view: ResponsesView) => boolean;
  onLoadView: (view: ResponsesView) => void;
  onEditView?: (view: ResponsesView) => void;
  onDeleteView?: (view: ResponsesView) => void;
  currentViewId?: number | null;
  setCurrentViewId?: (id: number | null) => void;
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
  const canEdit = canEditOrDeleteView(view);

  const handleLoad = () => onLoadView(view);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
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
              {view.isPublic && <PublicIcon fontSize="small" />}
              {view.isDefault && <Chip label="ברירת מחדל" size="small"></Chip>}
            </Stack>

            <ViewChipsContainer></ViewChipsContainer>

            <Typography variant="caption" color="text.secondary">
              {HebrewTitles.CreatedBy} {view.createdByName}
            </Typography>
          </ViewCardInfo>

          {canEdit && (
            <ViewCardButtons>
              {onEditView && (
                <Tooltip title={HebrewTitles.EditView}>
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
                <Tooltip title={HebrewTitles.DeleteView}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      stop(e);
                      onDeleteView(view);
                    }}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </ViewCardButtons>
          )}
        </ViewCardActions>
      </ViewCardContent>
    </ViewCard>
  );
}
