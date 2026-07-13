import React from "react";
import {
  Box,
  Card,
  Checkbox,
  Typography,
  Tooltip,
  Stack,
  Button,
  CircularProgress,
  Collapse,
  useTheme,
} from "@mui/material";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { DeletedFormWithResponses } from "../types";
import { useTrash } from "../context/TrashContext";
import DeletedResponseRow from "./DeletedResponseRow";

interface DeletedFormCardProps {
  form: DeletedFormWithResponses;
}

const DeletedFormCard: React.FC<DeletedFormCardProps> = ({ form }) => {
  const theme = useTheme();
  const {
    selectedFormIds,
    onToggleSelectForm,
    expandedForms,
    onToggleExpand,
    restoringFormId,
    onRestoreForm,
    getIconContent,
  } = useTrash();

  const isSelected = selectedFormIds.has(form.id);
  const isExpanded = !!expandedForms[form.id];
  const isRestoring = restoringFormId === form.id;
  const responsesCount = form.responsesCount ?? 0;

  const deletedDateObj = (form as any).deletedAt ? new Date((form as any).deletedAt) : null;
  const formattedDate = deletedDateObj ? deletedDateObj.toLocaleDateString("he-IL") : "N/A";
  const formattedTime = deletedDateObj
    ? deletedDateObj.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  return (
    <Card
      sx={{
        p: 2,
        border: "1px solid #E2E8F0",
        borderRadius: "4px",
        boxShadow: "none",
        bgcolor: "#ffffff",
      }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}>
        <Stack direction="row" gap={2} alignItems="center">
          <Button
            disabled={isRestoring}
            onClick={() => onRestoreForm(form.id)}
            variant="contained"
            endIcon={
              isRestoring ? <CircularProgress size={14} color="inherit" /> : <RotateCcw size={16} />
            }
            sx={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: "4px",
              fontWeight: 700,
              fontSize: "14px",
              height: "32px",
              px: 1.5,
              boxShadow: "none",
              textTransform: "none",
              flexShrink: 0,
              gap: 1,
              "&:hover": { backgroundColor: theme.palette.primary.dark, boxShadow: "none" },
            }}>
            שחזור טופס
          </Button>

          {responsesCount > 0 && (
            <Button
              onClick={() => onToggleExpand(form.id)}
              endIcon={isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
              sx={{
                bgcolor: "#ffffff",
                color: "#0F172B",
                border: "1px solid #E2E8F0",
                borderRadius: "4px",
                fontWeight: 500,
                fontSize: "14px",
                height: "32px",
                px: 1.5,
                boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.05)",
                textTransform: "none",
                gap: 1,
                "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
              }}>
              {isExpanded ? `הסתרת תגובות (${responsesCount})` : `הצגת תגובות (${responsesCount})`}
            </Button>
          )}
        </Stack>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 2,
            }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, justifyContent: "flex-end" }}>
              <Tooltip title="מזהה הטופס" arrow placement="top">
                <Typography
                  component="span"
                  sx={{ fontSize: "14px", color: "#62748E", fontWeight: 500, cursor: "help" }}>
                  {form.id}
                </Typography>
              </Tooltip>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, fontSize: "20px", color: "#020618", textAlign: "right" }}>
                {form.name}
              </Typography>
              <Box
                sx={{
                  width: "36px",
                  height: "36px",
                  bgcolor: "rgba(25, 118, 210, 0.08)",
                  color: "primary.main",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  "& img": { width: "18px", height: "18px" },
                  "& .MuiSvgIcon-root": { fontSize: "18px" },
                }}>
                {getIconContent(form.icon)}
              </Box>
            </Box>

            <Checkbox
              checked={isSelected}
              onChange={() => onToggleSelectForm(form.id)}
              sx={{
                p: 0,
                width: "16px",
                height: "16px",
                border: "1px solid #62748E",
                borderRadius: "4px",
                color: "transparent",
                "&.Mui-checked": { color: theme.palette.primary.main, border: "none" },
                "& .MuiSvgIcon-root": { fontSize: 20 },
              }}
            />
          </Box>

          <Box sx={{ textAlign: "left", pl: 4 }}>
            <Typography variant="body2" sx={{ color: "#62748E", fontSize: "14px", mb: 0.2 }}>
              נוצר על ידי:{" "}
              <Tooltip title={form.createdBy?.upn || "לא ידוע"} arrow placement="top">
                <Box
                  component="span"
                  sx={{
                    cursor: "help",
                    textDecoration: "underline",
                    textDecorationStyle: "dotted",
                    textDecorationColor: "#cbd5e1",
                  }}>
                  {form.createdBy?.name || "משתמש בזן"}
                </Box>
              </Tooltip>
            </Typography>
            <Typography variant="body2" sx={{ color: "#62748E", fontSize: "14px" }}>
              נמחק בתאריך {formattedDate} בשעה {formattedTime} על ידי{" "}
              <Tooltip title={(form as any).deletedBy?.upn || "לא ידוע"} arrow placement="top">
                <Box
                  component="span"
                  sx={{
                    cursor: "help",
                    textDecoration: "underline",
                    textDecorationStyle: "dotted",
                    textDecorationColor: "#cbd5e1",
                  }}>
                  {(form as any).deletedBy?.name || "משתמש בזן"}
                </Box>
              </Tooltip>
            </Typography>
          </Box>
        </Box>
      </Box>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Box sx={{ bgcolor: "rgba(241, 245, 249, 0.4)", p: 2, borderRadius: "4px", mt: 1 }}>
          {form.responses?.length ? (
            <Stack spacing={1}>
              {form.responses.map((resp) => (
                <DeletedResponseRow key={resp.id} response={resp} hideCheckbox />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary" }}>
              אין תגובות שנמחקו עם הטופס
            </Typography>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

export default DeletedFormCard;
