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
                        }
                    }}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                "& .MuiMenuItem-root": {
                                    color: "#020618",
                                    fontSize: "0.95rem",
                                }
                            }
                        }
                    }}
                >
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

            <Tooltip title={hasSavedViews ? MANAGE_VIEWS_LABEL : ""} placement="top" arrow>
                <span>
                    <UnifiedButton
                        onClick={() => setIsSidePanelOpen(true)}
                        disabled={isSidePanelOpen}
                        startIcon={<BackupTable />}
                        sx={hasSavedViews ? { minWidth: "40px", width: "40px", padding: 0 } : {}}
                    >
                        {!hasSavedViews && MANAGE_VIEWS_LABEL}
                    </UnifiedButton>
                </span>
            </Tooltip>
        </Stack>
    );
};
