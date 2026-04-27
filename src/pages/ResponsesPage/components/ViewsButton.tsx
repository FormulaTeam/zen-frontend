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
        <Stack direction="row" spacing={1} alignItems="center">
            {hasSavedViews && !isSidePanelOpen && (
                <Select
                    value={activeViewId}
                    onChange={(e) => handleViewDropdownChange(e.target.value as string)}
                    size="small"
                    variant="outlined"
                    displayEmpty
                    sx={{
                        minWidth: 180,
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        "& .MuiSelect-select": {
                            padding: "8px 14px",
                            fontSize: "1.1rem",
                            fontWeight: 500,
                        }
                    }}
                >
                    <MenuItem value="" sx={{ fontStyle: "italic", color: "text.secondary", fontSize: "1.1rem" }}>
                        {SELECT_VIEW_LABEL}
                    </MenuItem>
                    {savedViews.map((view) => (
                        <MenuItem key={String(view.id)} value={String(view.id)} sx={{ fontSize: "1.1rem" }}>
                            {view.name}
                        </MenuItem>
                    ))}
                </Select>
            )}

            <Tooltip title={hasSavedViews ? MANAGE_VIEWS_LABEL : ""}>
                <span>
                    <ViewManageButton
                        variant="contained"
                        onClick={() => setIsSidePanelOpen(true)}
                        disabled={isSidePanelOpen}
                        sx={hasSavedViews ? { width: "39px", height: "39px", padding: "8px", minWidth: 0 } : {}}>
                        <BackupTable />
                        {!hasSavedViews && <span>{MANAGE_VIEWS_LABEL}</span>}
                    </ViewManageButton>
                </span>
            </Tooltip>
        </Stack>
    );
};
