import React from "react";
import { Typography, IconButton, Chip, Tooltip, Button, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Add, AutoAwesome, Edit } from "@mui/icons-material";
import { TableView } from "../../types/interfaces/tableViews.types";
import { useViewPermissions } from "../../hooks/useViewPermissions";
import {
  SavedViewsTitle,
  SavedViewsContainer,
  ViewCard,
  ViewCardContent,
  ViewCardActions,
  ViewCardInfo,
  ViewCardButtons,
  ViewNameTypography,
  ViewChipsContainer,
  CreateNewViewContainer,
  CreateNewViewButton,
} from "../ViewManager/styled";
import {
  CreateFirstViewButton,
  EmptyViewsState,
  EmptyViewsSubtitle,
  EmptyViewsTitle,
} from "../Responses/styled";
import { User } from "../../utils/interfaces";

interface SavedViewsListProps {
  savedViews?: TableView[];
  user?: User;
  permissionTypes?: number[];
  onLoadView: (view: TableView) => void;
  onEditView?: (view: TableView) => void;
  onDeleteView?: (view: TableView) => void;
  onCreateNew?: () => void;
}

const SavedViewsList: React.FC<SavedViewsListProps> = ({
  savedViews,
  user,
  permissionTypes = [],
  onLoadView,
  onEditView,
  onDeleteView,
  onCreateNew,
}) => {
  // Permissions hook
  const { canEditOrDeleteView } = useViewPermissions({
    user,
    permissionTypes,
  });

  return (
    <Box>
      {/* Saved Views */}
      {savedViews && savedViews.length > 0 && (
        <>
          <SavedViewsTitle variant="subtitle1" gutterBottom>
            תצוגות שמורות
          </SavedViewsTitle>
          <SavedViewsContainer>
            {savedViews.map((view) => (
              <ViewCard key={view.id || view.name}>
                <ViewCardContent>
                  <ViewCardActions>
                    <ViewCardInfo>
                      <ViewNameTypography variant="body1" $isDefault={view.isDefault}>
                        {view.name}
                      </ViewNameTypography>
                      <ViewChipsContainer>
                        {view.isDefault && <Chip label="ברירת מחדל" size="small" />}
                        {view.isPublic && <Chip label="ציבורי" size="small" color="primary" />}
                      </ViewChipsContainer>
                      <Typography variant="caption" color="text.secondary">
                        נוצר על ידי: {view.createdByName}
                      </Typography>
                    </ViewCardInfo>
                    <ViewCardButtons>
                      {canEditOrDeleteView(view) && onEditView && (
                        <Tooltip title="עריכת תצוגה">
                          <IconButton
                            size="small"
                            onClick={() => onEditView(view)}
                            title="Edit View">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onDeleteView && canEditOrDeleteView(view) && (
                        <Tooltip title="מחיקת תצוגה">
                          <IconButton size="small" onClick={() => onDeleteView(view)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </ViewCardButtons>
                  </ViewCardActions>
                </ViewCardContent>
              </ViewCard>
            ))}
          </SavedViewsContainer>
        </>
      )}

      {/* Create New View Button */}
      {onCreateNew && (
        <CreateNewViewContainer>
          {savedViews && savedViews.length > 0 ? (
            <CreateNewViewButton variant="contained" onClick={onCreateNew} startIcon={<Add />}>
              יצירת תצוגה חדשה
            </CreateNewViewButton>
          ) : (
            <EmptyViewsState>
              <EmptyViewsTitle>אין עדיין תצוגות</EmptyViewsTitle>
              <EmptyViewsSubtitle>תצוגות הן פשוטות לבנייה ועושות המון סדר</EmptyViewsSubtitle>

              <CreateFirstViewButton
                variant="contained"
                endIcon={<AutoAwesome />}
                onClick={onCreateNew}>
                ליצירת תצוגה ראשונה
              </CreateFirstViewButton>
            </EmptyViewsState>
          )}
        </CreateNewViewContainer>
      )}
    </Box>
  );
};

export default SavedViewsList;
