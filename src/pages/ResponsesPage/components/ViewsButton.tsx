import React from "react";
import { Tooltip, Stack, Select, MenuItem } from "@mui/material";
import { BackupTable } from "@mui/icons-material";
import { ViewManageButton } from "@components/Responses/styled";
import { UseResponsesViewsReturn } from "../hooks/useResponsesViews";

interface ViewsButtonProps
    extends Pick<UseResponsesViewsReturn,
        "isSidePanelOpen" |
        "setIsSidePanelOpen" |
        "hasSavedViews" |
        "savedViews" |
        "selectedViewId" |
        "defaultViewId" |
        "handleViewDropdownChange"
    > { }

import { UnifiedButton } from "../styled";

const MANAGE_VIEWS_LABEL = "ניהול תצוגות";
const SELECT_VIEW_LABEL = "בחר תצוגה";

export const ViewsButton: React.FC<ViewsButtonProps> = ({
    isSidePanelOpen,
    setIsSidePanelOpen,
    hasSavedViews,
    savedViews,
    selectedViewId,
    defaultViewId,
    handleViewDropdownChange
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
                        backgroundColor: "rgba(30, 136, 229, 0.04)",
                        borderRadius: "10px",
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(30, 136, 229, 0.15)",
                        },
                        "& .MuiSelect-select": {
                            padding: "9px 14px",
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "#1E88E5",
                        }
                    }}
                >
                    <MenuItem value="" sx={{ fontStyle: "italic", color: "text.secondary", fontSize: "1rem" }}>
                        {SELECT_VIEW_LABEL}
                    </MenuItem>
                    {savedViews.map((view) => (
                        <MenuItem key={String(view.id)} value={String(view.id)} sx={{ fontSize: "1rem" }}>
                            {view.name}
                        </MenuItem>
                    ))}
                </Select>
            )}

            <UnifiedButton
                onClick={() => setIsSidePanelOpen(true)}
                disabled={isSidePanelOpen}
                startIcon={<BackupTable />}
            >
                {MANAGE_VIEWS_LABEL}
            </UnifiedButton>
        </Stack>
    );
};
