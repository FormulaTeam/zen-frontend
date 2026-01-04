import { Box } from "@mui/material";
import { Add, AutoAwesome } from "@mui/icons-material";
import { ResponsesView } from "../../../types/interfaces/tableViews.types";
import { useViewPermissions } from "../../../hooks/useViewPermissions";
import {
  SavedViewsContainer,
  CreateNewViewContainer,
  CreateNewViewButton,
} from "../ViewManager/styled";
import {
  CreateFirstViewButton,
  EmptyViewsState,
  EmptyViewsSubtitle,
  EmptyViewsTitle,
} from "../../Responses/styled";
import { SavedViewCard } from "./index";
import { User } from "../../../utils/interfaces";

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

  // Example / fake views — can be removed when real data is provided
  if (savedViews.length === 0) {
    savedViews = [
      {
        id: 1,
        name: "דף הבית",
        isDefault: true,
        isPublic: true,
        createdBy: "user1",
        createdByName: "שירה רייכר",
        formId: "form1",
        config: { columns: [{ columnId: "id", displayName: "מספר", order: 0, visible: true }] },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "תצוגה אישית",
        isDefault: false,
        isPublic: false,
        createdBy: "user2",
        createdByName: "ארז טור",
        formId: "form1",
        config: { columns: [] },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: "תצוגה ציבורית",
        isDefault: false,
        isPublic: true,
        createdBy: "user3",
        createdByName: "גלי צבי",
        formId: "form1",
        config: { columns: [] },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: "תצוגה של רויטל",
        isDefault: false,
        isPublic: false,
        createdBy: "user4",
        createdByName: "רויטל פריד",
        formId: "form1",
        config: { columns: [] },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  const hasViews = savedViews.length > 0;

  return (
    <Box>
      {hasViews && (
        <SavedViewsContainer>
          {savedViews.map((view) => (
            <SavedViewCard
              key={view.id}
              view={view}
              canEditOrDeleteView={canEditOrDeleteView}
              onLoadView={onLoadView}
              onEditView={onEditView}
              onDeleteView={onDeleteView}
            />
          ))}
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
