import React from "react";
import { Box, Button, Card, Typography, Tooltip, IconButton, Collapse, Stack, Checkbox } from "@mui/material";
import { ChevronUp, ChevronDown } from "lucide-react";
import { RecycleBinItemWithResponses } from "../types";
import { useRecycleBin } from "../context/RecycleBinContext";
import RecycleBinResponseRow from "./RecycleBinResponseRow";

interface ActiveFormWithRecycleBinResponsesCardProps {
  form: RecycleBinItemWithResponses;
}

const ActiveFormWithRecycleBinResponsesCard: React.FC<
  ActiveFormWithRecycleBinResponsesCardProps
> = ({ form }) => {
  const { expandedForms, selectedResponseIds, onToggleSelectResponses, onToggleExpand, getIconContent } =
    useRecycleBin();
  const isExpanded = !!expandedForms[form.id];
  const responsesCount = form.responsesCount ?? 0;
  const formResponseIds = (form.responses ?? []).map((response) => response.id);
  const hasResponses = formResponseIds.length > 0;
  const areAllResponsesSelected =
    hasResponses && formResponseIds.every((responseId) => selectedResponseIds.has(responseId));

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
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => onToggleExpand(form.id)}>
        <Stack direction="row-reverse" alignItems="center" gap={2}>
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
              flexDirection: "row-reverse",
              gap: 1.5,
            }}>
            {form.name}
            <Tooltip title="מזהה הטופס" arrow placement="top">
              <Typography
                component="span"
                sx={{ fontSize: "16px", color: "#020618", fontWeight: 400, cursor: "help" }}>
                {form.id}
              </Typography>
            </Tooltip>
            <Typography
              component="span"
              sx={{ fontSize: "18px", color: "#020618", fontWeight: 400 }}>
              ←
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: "18px",
                color: "#62748E",
                fontWeight: 400,
                direction: "ltr",
              }}>
              <Box component="span" sx={{ direction: "ltr", display: "inline-block" }}>
                {responsesCount}
              </Box>{" "}
              תגובות
            </Typography>
          </Typography>
        </Stack>

        <IconButton size="small" sx={{ color: "#62748E" }}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Box
          sx={{
            bgcolor: "rgba(241, 245, 249, 0.4)",
            px: 3,
            py: 2,
            borderTop: "1px solid #E2E8F0",
          }}>
          {form.responses?.length ? (
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", pb: 0.5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleSelectResponses(formResponseIds, !areAllResponsesSelected);
                  }}
                  sx={{
                    height: "30px",
                    borderRadius: "4px",
                    textTransform: "none",
                    fontWeight: 600,
                    bgcolor: "#ffffff",
                    borderColor: "#cbd5e1",
                    color: "#0f172a",
                    "&:hover": {
                      bgcolor: "#f8fafc",
                      borderColor: "#94a3b8",
                    },
                  }}>
                  <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                    <Box component="span">{areAllResponsesSelected ? "ביטול בחירה" : "בחירת כל התגובות"}</Box>
                    <Checkbox
                      checked={areAllResponsesSelected}
                      disableRipple
                      tabIndex={-1}
                      sx={{
                        p: 0,
                        pointerEvents: "none",
                        color: "#94a3b8",
                        "&.Mui-checked": {
                          color: "primary.main",
                        },
                      }}
                    />
                  </Box>
                </Button>
              </Box>
              {form.responses.map((resp) => (
                <RecycleBinResponseRow key={resp.id} response={resp} />
              ))}
            </Stack>
          ) : (
            <Typography
              variant="body2"
              sx={{ textAlign: "center", py: 2, color: "text.secondary" }}>
              אין תגובות שנמחקו
            </Typography>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

export default ActiveFormWithRecycleBinResponsesCard;
