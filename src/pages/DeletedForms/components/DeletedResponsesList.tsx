import React from "react";
import { Box, Grid, CircularProgress } from "@mui/material";
import { DeletedFormWithResponses } from "../types";
import { useTrash } from "../context/TrashContext";
import ActiveFormWithDeletedResponsesCard from "./ActiveFormWithDeletedResponsesCard";
import DeletedFormsEmptyState from "./DeletedFormsEmptyState";

interface DeletedResponsesListProps {
  activeFormsWithDeleted: DeletedFormWithResponses[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
}

const DeletedResponsesList: React.FC<DeletedResponsesListProps> = ({
  activeFormsWithDeleted,
  isLoading,
  isFetchingNextPage,
}) => {
  const { hasFilters, onClearFilters } = useTrash();

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
            <ActiveFormWithDeletedResponsesCard form={form} />
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
