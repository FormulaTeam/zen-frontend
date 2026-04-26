import { Box } from "@mui/material";
import { Add, AutoAwesome } from "@mui/icons-material";
import { ResponsesView } from "../../../types/interfaces/tableViews.types";
import { useViewPermissions } from "../../../hooks/useViewPermissions";
import {
  SavedViewsContainer,
  CreateNewViewContainer,
  CreateNewViewButton,
  SectionTitle,
} from "../ViewManager/styled";
import {
  CreateFirstViewButton,
  EmptyViewsState,
  EmptyViewsSubtitle,
  EmptyViewsTitle,
} from "../../Responses/styled";
import { SavedViewCard } from "./index";
import { User } from "../../../utils/interfaces";
import { useState, useMemo } from "react";

interface SavedViewsListProps {
  savedViews?: ResponsesView[];
  user?: User;
  permissionTypes?: number[];
  onLoadView: (view: ResponsesView) => void;
  onEditView?: (view: ResponsesView) => void;
  onDeleteView?: (view: ResponsesView) => void;
  onCreateNew?: () => void;
}

enum HebrewTitles {
  NoViews = "אין עדיין תצוגות",
  NoViewsSubtitle = "תצוגות הן פשוטות לבנייה ועושות המון סדר",
  CreateFirstView = "ליצירת תצוגה ראשונה",
  CreateNewView = "יצירת תצוגה חדשה",
  PublicViews = "תצוגות ציבוריות",
  PrivateViews = "תצוגות פרטיות",
}

export function SavedViewsList({
  savedViews = [],
  user,
  permissionTypes = [],
  onLoadView,
  onEditView,
  onDeleteView,
  onCreateNew,
}: SavedViewsListProps) {
  const { canEditOrDeleteView } = useViewPermissions({
    user,
    permissionTypes,
  });
  const [currentViewId, setCurrentViewId] = useState<string | number | null>(null);
  const hasViews = savedViews.length > 0;

  const publicViews = useMemo(() => savedViews.filter((v) => v.isPublic), [savedViews]);
  const privateViews = useMemo(() => savedViews.filter((v) => !v.isPublic), [savedViews]);

  const renderViewList = (views: ResponsesView[]) =>
    views.map((view) => (
      <SavedViewCard
        key={view.id}
        view={view}
        canEditOrDeleteView={canEditOrDeleteView}
        onLoadView={onLoadView}
        onEditView={onEditView}
        onDeleteView={onDeleteView}
        currentViewId={currentViewId}
        setCurrentViewId={setCurrentViewId}
      />
    ));

  return (
    <Box>
      {hasViews && (
        <SavedViewsContainer>
          {publicViews.length > 0 && (
            <Box mb={3}>
              <SectionTitle variant="subtitle2">{HebrewTitles.PublicViews}</SectionTitle>
              {renderViewList(publicViews)}
            </Box>
          )}

          {privateViews.length > 0 && (
            <Box>
              <SectionTitle variant="subtitle2">{HebrewTitles.PrivateViews}</SectionTitle>
              {renderViewList(privateViews)}
            </Box>
          )}
        </SavedViewsContainer>
      )}

      {onCreateNew && (
        <CreateNewViewContainer>
          {hasViews ? (
            <CreateNewViewButton variant="contained" startIcon={<Add />} onClick={onCreateNew}>
              {HebrewTitles.CreateNewView}
            </CreateNewViewButton>
          ) : (
            <EmptyViewsState>
              <EmptyViewsTitle>{HebrewTitles.NoViews}</EmptyViewsTitle>
              <EmptyViewsSubtitle>{HebrewTitles.NoViewsSubtitle}</EmptyViewsSubtitle>

              <CreateFirstViewButton
                variant="contained"
                endIcon={<AutoAwesome />}
                onClick={onCreateNew}>
                {HebrewTitles.CreateFirstView}
              </CreateFirstViewButton>
            </EmptyViewsState>
          )}
        </CreateNewViewContainer>
      )}
    </Box>
  );
}
