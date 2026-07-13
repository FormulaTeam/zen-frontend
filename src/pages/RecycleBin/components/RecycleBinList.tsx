import React from "react";
import { Box, Grid, CircularProgress } from "@mui/material";
import { RecycleBinItemWithResponses } from "../types";
import { useRecycleBin } from "../context/RecycleBinContext";
import RecycleBinFormCard from "./RecycleBinFormCard";
import RecycleBinEmptyState from "./RecycleBinEmptyState";

interface RecycleBinListProps {
  deletedForms: RecycleBinItemWithResponses[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
}

const RecycleBinList: React.FC<RecycleBinListProps> = ({
  deletedForms,
  isLoading,
  isFetchingNextPage,
}) => {
  const { hasFilters, onClearFilters } = useRecycleBin();

  if (isLoading && deletedForms.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (deletedForms.length === 0) {
    return <RecycleBinEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />;
  }

  return (
    <>
      <Grid container spacing={2} columns={12}>
        {deletedForms.map((form) => (
          <Grid key={form.id} size={{ xs: 12 }}>
            <RecycleBinFormCard form={form} />
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

export default RecycleBinList;
