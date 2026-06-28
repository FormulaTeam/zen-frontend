import React from "react";
import { Tooltip, Stack, Select, MenuItem } from "@mui/material";
import { Layers2 } from "lucide-react";

import { UseResponsesViewsReturn } from "../hooks/useResponsesViews";
import { UnifiedButton } from "../styled";

interface ViewsButtonProps extends Pick<
  UseResponsesViewsReturn,
  | "isSidePanelOpen"
  | "setIsSidePanelOpen"
  | "hasSavedViews"
  | "savedViews"
  | "selectedViewId"
  | "defaultViewId"
  | "handleViewDropdownChange"
> {}

const MANAGE_VIEWS_LABEL = "ניהול תצוגות";
const SELECT_VIEW_LABEL = "בחר תצוגה";

const viewIconOnlyButtonSx = {
  minWidth: "40px",
  width: "40px",
  height: "40px",
  p: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",

  "& .MuiButton-startIcon, & .MuiButton-endIcon": {
    m: 0,
  },

  "& svg": {
    width: 21,
    height: 21,
  },
};

export const ViewsButton: React.FC<ViewsButtonProps> = ({
  isSidePanelOpen,
  setIsSidePanelOpen,
  hasSavedViews,
  savedViews,
  selectedViewId,
  handleViewDropdownChange,
}) => {
  const activeViewId = selectedViewId || "";

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      {hasSavedViews && !isSidePanelOpen && (
        <Select
          value={activeViewId}
          onChange={(e) => handleViewDropdownChange(e.target.value as string)}
          size="small"
          variant="outlined"
          displayEmpty
          sx={{
            minWidth: 200,
            height: "40px",
            backgroundColor: "rgba(30, 136, 229, 0.04)",
            borderRadius: "10px",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(30, 136, 229, 0.15)",
            },
            "& .MuiSelect-select": {
              padding: "8px 14px",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#020618",
              display: "flex",
              alignItems: "center",
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                "& .MuiMenuItem-root": {
                  color: "#020618",
                  fontSize: "0.95rem",
                },
              },
            },
          }}>
          <MenuItem value="" sx={{ fontStyle: "italic", color: "text.secondary" }}>
            {SELECT_VIEW_LABEL}
          </MenuItem>

          {savedViews.map((view) => (
            <MenuItem key={String(view.id)} value={String(view.id)}>
              {view.name}
            </MenuItem>
          ))}
        </Select>
      )}

      <Tooltip title={hasSavedViews ? MANAGE_VIEWS_LABEL : ""} placement="top">
        <span>
          {hasSavedViews ? (
            <UnifiedButton
              onClick={() => setIsSidePanelOpen(true)}
              disabled={isSidePanelOpen}
              sx={viewIconOnlyButtonSx}
              aria-label={MANAGE_VIEWS_LABEL}>
              <Layers2 strokeWidth={2.2} />
            </UnifiedButton>
          ) : (
            <UnifiedButton
              onClick={() => setIsSidePanelOpen(true)}
              disabled={isSidePanelOpen}
              startIcon={<Layers2 size={21} strokeWidth={2.2} />}>
              {MANAGE_VIEWS_LABEL}
            </UnifiedButton>
          )}
        </span>
      </Tooltip>
    </Stack>
  );
};
