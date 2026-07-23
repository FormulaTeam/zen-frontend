import React from "react";
import { Box, Typography } from "@mui/material";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import Grid from "@mui/material/Grid";
import FormCard from "../FormCard/FormCard";
import { FormOverviewDto } from "@src/types/shared";
import { MAX_PINNED_FORMS } from "formula-gear";

const PLACEHOLDER_INDEXES = Array.from({ length: MAX_PINNED_FORMS });

interface PinnedFormsRowProps {
  pinnedForms: FormOverviewDto[];
  isSuperAdmin: boolean | null;
  navigate: any;
  resetSearchValue: () => void;
  myUpn?: string;
}

const PinnedPlaceholderCard = ({ showHint }: { showHint: boolean }) => (
  <Box
    sx={{
      width: "100%",
      minHeight: "220px",
      height: "100%",
      borderRadius: "15px",
      border: "1px dashed #D1D1D1",
      backgroundColor: "rgba(2, 6, 24, 0.02)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      padding: "24px",
      textAlign: "center",
    }}>
    <PushPinOutlinedIcon sx={{ fontSize: "28px", color: "#94A3B8" }} />
    {showHint && (
      <Typography sx={{ fontSize: "13px", color: "#62748E" }}>
        נעצו טפסים חשובים כדי למצוא אותם במהירות
      </Typography>
    )}
  </Box>
);

const PinnedFormsRow: React.FC<PinnedFormsRowProps> = ({
  pinnedForms,
  isSuperAdmin,
  navigate,
  resetSearchValue,
  myUpn,
}) => {
  const placeholdersCount = Math.max(MAX_PINNED_FORMS - pinnedForms.length, 0);

  return (
    <Box sx={{ width: "100%", mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PushPinOutlinedIcon sx={{ fontSize: "20px", color: "#020618" }} />
          <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#020618" }}>
            טפסים נעוצים
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#62748E" }}>
          {pinnedForms.length}/{MAX_PINNED_FORMS}
        </Typography>
      </Box>

      <Grid container columns={{ xs: 4, sm: 8, md: 12 }} spacing={3}>
        {pinnedForms.map((form) => (
          <Grid key={form.id} size={{ xs: 4, sm: 4, md: 6, lg: 4, xl: 3 }}>
            <FormCard
              form={form}
              isSuperAdmin={isSuperAdmin}
              navigate={navigate}
              resetSearchValue={resetSearchValue}
              isCreator={form.createdBy?.upn?.toLowerCase() === myUpn?.toLowerCase()}
            />
          </Grid>
        ))}

        {PLACEHOLDER_INDEXES.slice(0, placeholdersCount).map((_, index) => (
          <Grid key={`pinned-placeholder-${index}`} size={{ xs: 4, sm: 4, md: 6, lg: 4, xl: 3 }}>
            <PinnedPlaceholderCard showHint={pinnedForms.length === 0 && index === 0} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PinnedFormsRow;
