import React from "react";
import { Box, Grid, CircularProgress } from "@mui/material";
import { DeletedFormWithResponses } from "../types";
import DeletedFormCard from "./DeletedFormCard";
import DeletedFormsEmptyState from "./DeletedFormsEmptyState";

interface DeletedFormsListProps {
  deletedForms: DeletedFormWithResponses[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  selectedFormIds: Set<number>;
  expandedForms: Record<number, boolean>;
  restoringFormId: number | null;
  hasFilters: boolean;
  onToggleSelect: (id: number) => void;
  onToggleExpand: (id: number) => void;
  onRestore: (id: number) => void;
  onClearFilters: () => void;
  getIconContent: (icon: string | null) => React.ReactNode;
}

const DeletedFormsList: React.FC<DeletedFormsListProps> = ({
  deletedForms,
  isLoading,
  isFetchingNextPage,
  selectedFormIds,
  expandedForms,
  restoringFormId,
  hasFilters,
  onToggleSelect,
  onToggleExpand,
  onRestore,
  onClearFilters,
  getIconContent,
}) => {
  if (isLoading && deletedForms.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (deletedForms.length === 0) {
    return <DeletedFormsEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />;
  }

  return (
    <>
      <Grid container spacing={2} columns={12}>
        {deletedForms.map((form) => (
          <Grid key={form.id} size={{ xs: 12 }}>
            <DeletedFormCard
              form={form}
              isSelected={selectedFormIds.has(form.id)}
              isExpanded={!!expandedForms[form.id]}
              isRestoring={restoringFormId === form.id}
              onToggleSelect={onToggleSelect}
              onToggleExpand={onToggleExpand}
              onRestore={onRestore}
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

export default DeletedFormsList;
