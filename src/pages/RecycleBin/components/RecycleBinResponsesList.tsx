import React from "react";
import { Box, Grid, CircularProgress } from "@mui/material";
import { RecycleBinItemWithResponses } from "../types";
import { useRecycleBin } from "../context/RecycleBinContext";
import ActiveFormWithRecycleBinResponsesCard from "./ActiveFormWithRecycleBinResponsesCard";
import RecycleBinEmptyState from "./RecycleBinEmptyState";

interface RecycleBinResponsesListProps {
  activeFormsWithDeleted: RecycleBinItemWithResponses[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
}

const RecycleBinResponsesList: React.FC<RecycleBinResponsesListProps> = ({
  activeFormsWithDeleted,
  isLoading,
  isFetchingNextPage,
}) => {
  const { hasFilters, onClearFilters } = useRecycleBin();

  if (isLoading && activeFormsWithDeleted.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (activeFormsWithDeleted.length === 0) {
    return <RecycleBinEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />;
  }

  return (
    <>
      <Grid container spacing={2} columns={12}>
        {activeFormsWithDeleted.map((form) => (
          <Grid key={form.id} size={{ xs: 12 }}>
            <ActiveFormWithRecycleBinResponsesCard form={form} />
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

export default RecycleBinResponsesList;
