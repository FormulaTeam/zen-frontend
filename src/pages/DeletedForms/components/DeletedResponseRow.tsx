import React from "react";
import { Box, Stack, Typography, Tooltip, Checkbox, useTheme } from "@mui/material";
import { MessageSquare } from "lucide-react";

interface DeletedResponseRowProps {
  response: any;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  showCheckbox?: boolean;
  hideDeletionMetadata?: boolean;
}

const DeletedResponseRow: React.FC<DeletedResponseRowProps> = ({
  response,
  isSelected,
  onToggleSelect,
  showCheckbox = true,
  hideDeletionMetadata = false,
}) => {
  const theme = useTheme();

  const createdDateObj = new Date(response.createdAt);
  const fCreatedDate = createdDateObj.toLocaleDateString("he-IL");
  const fCreatedTime = createdDateObj.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const deletedDateObj = response.deletedResponse?.deletedAt ? new Date(response.deletedResponse.deletedAt) : null;
  const fDeletedDate = deletedDateObj ? deletedDateObj.toLocaleDateString("he-IL") : "N/A";
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
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid rgba(2, 6, 24, 0.05)",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Action area (currently empty or checkbox) moved to left for horizontal flip */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
         {showCheckbox && (
          <Checkbox
            checked={isSelected}
            onChange={() => onToggleSelect(response.id)}
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
        )}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "#020618" }}>
              תגובה מספר {response.index}
            </Typography>
          </Box>
          <MessageSquare size={18} color={theme.palette.primary.main} />
        </Stack>

        {/* Layout Mandate: textAlign right and pr: 4.5 maintained from original flip logic */}
        <Box sx={{ textAlign: "right", pr: 4.5 }}>
          <Typography sx={{ fontSize: "13px", color: "#62748E" }}>
            <Tooltip title={response.createdBy?.upn || "לא ידוע"} arrow placement="top">
              <Box
                component="span"
                sx={{
                  cursor: "help",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textDecorationColor: "#cbd5e1",
                }}
              >
                {response.createdBy?.name || "משתמש בזן"}
              </Box>
            </Tooltip>
            :נוצרה בתאריך {fCreatedDate} בשעה {fCreatedTime} על ידי
          </Typography>
          {!hideDeletionMetadata && response.deletedResponse && (
            <Typography sx={{ fontSize: "13px", color: "#62748E" }}>
              <Tooltip title={response.deletedResponse.deletedBy?.upn || "לא ידוע"} arrow placement="top">
                <Box
                  component="span"
                  sx={{
                    cursor: "help",
                    textDecoration: "underline",
                    textDecorationStyle: "dotted",
                    textDecorationColor: "#cbd5e1",
                  }}
                >
                  {response.deletedResponse.deletedBy?.name || "משתמש בזן"}
                </Box>
              </Tooltip>
              {" "}על ידי {fDeletedTime} בשעה {fDeletedDate} נמחק בתאריך
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DeletedResponseRow;
