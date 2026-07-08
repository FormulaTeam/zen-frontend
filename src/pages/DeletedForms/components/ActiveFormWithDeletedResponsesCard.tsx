import React from "react";
import {
  Box,
  Card,
  Typography,
  Tooltip,
  IconButton,
  Collapse,
  Stack,
} from "@mui/material";
import { ChevronUp, ChevronDown } from "lucide-react";
import { DeletedFormWithResponses } from "../types";
import DeletedResponseRow from "./DeletedResponseRow";

interface ActiveFormWithDeletedResponsesCardProps {
  form: DeletedFormWithResponses;
  isExpanded: boolean;
  selectedResponseIds: Set<string>;
  restoringResponseId: string | null;
  onToggleExpand: (id: number) => void;
  onToggleSelectResponse: (id: string) => void;
  onRestoreResponse: (formId: number, responseId: string) => void;
  getIconContent: (icon: string | null) => React.ReactNode;
}

const ActiveFormWithDeletedResponsesCard: React.FC<ActiveFormWithDeletedResponsesCardProps> = ({
  form,
  isExpanded,
  selectedResponseIds,
  restoringResponseId,
  onToggleExpand,
  onToggleSelectResponse,
  onRestoreResponse,
  getIconContent,
}) => {
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
      }}
    >
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
        onClick={() => onToggleExpand(form.id)}
      >
        <IconButton
          sx={{
            width: "32px",
            height: "32px",
            bgcolor: "#ffffff",
            border: "1px solid #E2E8F0",
            borderRadius: "4px",
            color: "#0F172B",
            boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.05)",
            "&:hover": { bgcolor: "#f8fafc" },
          }}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </IconButton>

        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
          {/* Layout Mandate: textAlign right for name and response count */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: "20px",
              color: "#020618",
              textAlign: "right",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1.5,
            }}
          >
            <Typography component="span" sx={{ fontSize: "18px", color: "#62748E", fontWeight: 400 }}>
              {responsesCount} תגובות
            </Typography>
            <Typography component="span" sx={{ fontSize: "18px", color: "#020618", fontWeight: 400 }}>
              →
            </Typography>
            <Tooltip title="מזהה הטופס" arrow placement="top">
              <Typography
                component="span"
                sx={{ fontSize: "16px", color: "#020618", fontWeight: 400, cursor: "help" }}
              >
                {form.id}
              </Typography>
            </Tooltip>
            {form.name}
          </Typography>

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
            }}
          >
            {getIconContent(form.icon)}
          </Box>
        </Box>
      </Box>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Box sx={{ bgcolor: "#ffffff", borderTop: "1px solid #E2E8F0" }}>
          {form.responses?.length ? (
            <Stack spacing={0}>
              {form.responses.map((response: any) => (
                <DeletedResponseRow
                  key={response.id}
                  response={response}
                  isSelected={selectedResponseIds.has(response.id)}
                  onToggleSelect={onToggleSelectResponse}
                />
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
