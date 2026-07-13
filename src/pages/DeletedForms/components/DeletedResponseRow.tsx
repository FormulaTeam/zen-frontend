import React from "react";
import { Box, Stack, Typography, Tooltip, Checkbox, useTheme } from "@mui/material";
import { MessageSquare } from "lucide-react";
import { useTrash } from "../context/TrashContext";

interface DeletedResponseRowProps {
  response: any;
  hideCheckbox?: boolean;
}

const DeletedResponseRow: React.FC<DeletedResponseRowProps> = ({ response, hideCheckbox }) => {
  const theme = useTheme();
  const {
    selectedResponseIds,
    onToggleSelectResponse,
    restoringResponseId,
    onRestoreResponse,
    hasFilters,
  } = useTrash();

  const isSelected = selectedResponseIds.has(response.id);
  const isRestoring = restoringResponseId === response.id;
  const hideDeletionMetadata = !response.deletedResponse;

  const createdDateObj = new Date(response.createdAt);
  const fCreatedDate = createdDateObj.toLocaleDateString("he-IL");
  const fCreatedTime = createdDateObj.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const deletedDateObj = response.deletedResponse ? new Date(response.deletedResponse.deletedAt) : null;
  const fDeletedDate = deletedDateObj ? deletedDateObj.toLocaleDateString("he-IL") : "";
  const fDeletedTime = deletedDateObj
    ? deletedDateObj.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid rgba(2, 6, 24, 0.05)",
      }}>
      <Stack direction="row-reverse" spacing={4} sx={{ gap: 2 }}>
        {!hideCheckbox && (
          <Checkbox
            checked={isSelected}
            onChange={() => onToggleSelectResponse(response.id)}
            sx={{
              p: 0,
              width: 16,
              height: 16,
              border: "1px solid #62748E",
              borderRadius: "4px",
              color: "transparent",
              alignSelf: "center",
              "&.Mui-checked": { color: theme.palette.primary.main, border: "none" },
              "& .MuiSvgIcon-root": { fontSize: 20 },
            }}
          />
        )}

        <Stack flex={1} spacing={1}>
          <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ gap: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#020618" }}>
              תגובה מספר {response.index}
            </Typography>
            <MessageSquare size={18} color={theme.palette.primary.main} />
          </Stack>

          <Stack spacing={0.5} alignItems="flex-end">
            <Typography sx={{ fontSize: 13, color: "#62748E", textAlign: "right" }}>
              נוצר בתאריך {fCreatedDate} בשעה {fCreatedTime} על ידי{" "}
              <Tooltip title={response.createdBy?.upn || "לא ידוע"} arrow placement="top">
                <Box
                  component="span"
                  sx={{
                    cursor: "help",
                    textDecoration: "underline",
                    textDecorationStyle: "dotted",
                    textDecorationColor: "#cbd5e1",
                  }}>
                  {response.createdBy?.name || "משתמש בזן"}
                </Box>
              </Tooltip>
            </Typography>

            {!hideDeletionMetadata && response.deletedResponse && (
              <Typography sx={{ fontSize: 13, color: "#62748E", textAlign: "right" }}>
                נמחק בתאריך {fDeletedDate} בשעה {fDeletedTime} על ידי{" "}
                <Tooltip
                  title={response.deletedResponse.deletedBy?.upn || "לא ידוע"}
                  arrow
                  placement="top">
                  <Box
                    component="span"
                    sx={{
                      cursor: "help",
                      textDecoration: "underline",
                      textDecorationStyle: "dotted",
                      textDecorationColor: "#cbd5e1",
                    }}>
                    {response.deletedResponse.deletedBy?.name || "משתמש בזן"}
                  </Box>
                </Tooltip>
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default DeletedResponseRow;
