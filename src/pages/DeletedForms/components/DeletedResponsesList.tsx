import React from "react";
import { Box, Grid, CircularProgress } from "@mui/material";
import { DeletedFormWithResponses } from "../types";
import ActiveFormWithDeletedResponsesCard from "./ActiveFormWithDeletedResponsesCard";
import DeletedFormsEmptyState from "./DeletedFormsEmptyState";

interface DeletedResponsesListProps {
  activeFormsWithDeleted: DeletedFormWithResponses[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  selectedResponseIds: Set<string>;
  expandedForms: Record<number, boolean>;
  restoringResponseId: string | null;
  hasFilters: boolean;
  onToggleSelectResponse: (id: string) => void;
  onToggleExpand: (id: number) => void;
  onRestoreResponse: (formId: number, responseId: string) => void;
  onClearFilters: () => void;
  getIconContent: (icon: string | null) => React.ReactNode;
}

const DeletedResponsesList: React.FC<DeletedResponsesListProps> = ({
  activeFormsWithDeleted,
  isLoading,
  isFetchingNextPage,
  selectedResponseIds,
  expandedForms,
  restoringResponseId,
  hasFilters,
  onToggleSelectResponse,
  onToggleExpand,
  onRestoreResponse,
  onClearFilters,
  getIconContent,
}) => {
  if (isLoading && activeFormsWithDeleted.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (activeFormsWithDeleted.length === 0) {
    return <DeletedFormsEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />;
  }

  return (
    <>
      <Grid container spacing={2} columns={12}>
        {activeFormsWithDeleted.map((form) => (
          <Grid key={form.id} size={{ xs: 12 }}>
            <ActiveFormWithDeletedResponsesCard
              form={form}
              isExpanded={!!expandedForms[form.id]}
              selectedResponseIds={selectedResponseIds}
              restoringResponseId={restoringResponseId}
              onToggleExpand={onToggleExpand}
              onToggleSelectResponse={onToggleSelectResponse}
              onRestoreResponse={onRestoreResponse}
              getIconContent={getIconContent}
            />
          </Grid>
        ))}
        {isFetchingNextPage && (
          <Grid size={{ xs: 12 }} sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} />
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default DeletedResponsesList;
