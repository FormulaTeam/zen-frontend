import React from "react";
import { Typography, IconButton, Chip, Tooltip } from "@mui/material";
import { Edit } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
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
  Default = "ברירת מחדל",
  Public = "ציבורי",
  EditView = "עריכת תצוגה",
  DeleteView = "מחיקת תצוגה",
  CreatedBy = "נוצר על ידי:",
}

interface SavedViewCardProps {
  view: ResponsesView;
  canEditOrDeleteView: (view: ResponsesView) => boolean;
  onLoadView: (view: ResponsesView) => void;
  onEditView?: (view: ResponsesView) => void;
  onDeleteView?: (view: ResponsesView) => void;
}

const SavedViewCard: React.FC<SavedViewCardProps> = ({
  view,
  canEditOrDeleteView,
  onLoadView,
  onEditView,
  onDeleteView,
}) => {
  const canEdit = canEditOrDeleteView(view);

  const handleLoad = () => {
    onLoadView(view);
  };

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <ViewCard
      role="button"
      tabIndex={0}
      onClick={handleLoad}
      onKeyDown={(e) => e.key === "Enter" && handleLoad()}>
      <ViewCardContent>
        <ViewCardActions>
          <ViewCardInfo>
            <ViewNameTypography variant="body1" $isDefault={view.isDefault}>
              {view.name}
            </ViewNameTypography>

            <ViewChipsContainer>
              {view.isDefault && <Chip label={HebrewTitles.Default} size="small" />}
              {view.isPublic && <Chip label={HebrewTitles.Public} size="small" color="primary" />}
            </ViewChipsContainer>

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
};

export default SavedViewCard;
