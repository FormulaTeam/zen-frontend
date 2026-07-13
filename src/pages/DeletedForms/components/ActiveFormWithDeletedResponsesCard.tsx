import React from "react";
import { Box, Card, Typography, Tooltip, IconButton, Collapse, Stack } from "@mui/material";
import { ChevronUp, ChevronDown } from "lucide-react";
import { DeletedFormWithResponses } from "../types";
import { useTrash } from "../context/TrashContext";
import DeletedResponseRow from "./DeletedResponseRow";

interface ActiveFormWithDeletedResponsesCardProps {
  form: DeletedFormWithResponses;
}

const ActiveFormWithDeletedResponsesCard: React.FC<ActiveFormWithDeletedResponsesCardProps> = ({
  form,
}) => {
  const { expandedForms, onToggleExpand, getIconContent } = useTrash();
  const isExpanded = !!expandedForms[form.id];
  const responsesCount = (form as any).responsesCount ?? 0;

  return (
    <Card
      sx={{
        p: 0,
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        borderRadius: "4px",
        boxShadow: "none",
        bgcolor: "#ffffff",
      }}>
      <Box
        sx={{
          py: 2,
          px: 3,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => onToggleExpand(form.id)}>
        <Stack direction="row" alignItems="center" gap={2}>
          <Box
            sx={{
              width: "40px",
              height: "40px",
              bgcolor: "rgba(25, 118, 210, 0.08)",
              color: "primary.main",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "& img": { width: "20px", height: "20px" },
              "& .MuiSvgIcon-root": { fontSize: "20px" },
            }}>
            {getIconContent(form.icon)}
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: "20px",
              color: "#020618",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}>
            {form.name}
            <Tooltip title="מזהה הטופס" arrow placement="top">
              <Typography component="span" sx={{ fontSize: "16px", color: "#020618", fontWeight: 400, cursor: "help" }}>
                {form.id}
              </Typography>
            </Tooltip>
            <Typography component="span" sx={{ fontSize: "18px", color: "#020618", fontWeight: 400 }}>
              ←
            </Typography>
            <Typography component="span" sx={{ fontSize: "18px", color: "#62748E", fontWeight: 400 }}>
              {responsesCount} תגובות
            </Typography>
          </Typography>
        </Stack>

        <IconButton size="small" sx={{ color: "#62748E" }}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Box sx={{ bgcolor: "rgba(241, 245, 249, 0.4)", px: 3, py: 2, borderTop: "1px solid #E2E8F0" }}>
          {form.responses?.length ? (
            <Stack spacing={1}>
              {form.responses.map((resp) => (
                <DeletedResponseRow key={resp.id} response={resp} />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ textAlign: "center", py: 2, color: "text.secondary" }}>
              אין תגובות שנמחקו
            </Typography>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

export default ActiveFormWithDeletedResponsesCard;
