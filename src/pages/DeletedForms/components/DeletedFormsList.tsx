import React from "react";
import { Box, Grid, CircularProgress } from "@mui/material";
import { DeletedFormWithResponses } from "../types";
import { useTrash } from "../context/TrashContext";
import DeletedFormCard from "./DeletedFormCard";
import DeletedFormsEmptyState from "./DeletedFormsEmptyState";

interface DeletedFormsListProps {
  deletedForms: DeletedFormWithResponses[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
}

const DeletedFormsList: React.FC<DeletedFormsListProps> = ({
  deletedForms,
  isLoading,
  isFetchingNextPage,
}) => {
  const { hasFilters, onClearFilters } = useTrash();

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
            <DeletedFormCard form={form} />
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
