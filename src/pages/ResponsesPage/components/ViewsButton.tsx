import React from "react";
import Tooltip from "@mui/material/Tooltip";
import { BackupTable } from "@mui/icons-material";
import { ViewManageButton } from "@components/Responses/styled";
import { UseResponsesViewsReturn } from "../hooks/useResponsesViews";

interface ViewsButtonProps
    extends Pick<UseResponsesViewsReturn, "isSidePanelOpen" | "setIsSidePanelOpen" | "hasUserCreatedViews"> { }

const MANAGE_VIEWS_LABEL = "ניהול תצוגות";

export const ViewsButton: React.FC<ViewsButtonProps> = ({ isSidePanelOpen, setIsSidePanelOpen, hasUserCreatedViews }) => (
    <Tooltip title={MANAGE_VIEWS_LABEL}>
        <span>
            <ViewManageButton
                variant="contained"
                onClick={() => setIsSidePanelOpen(true)}
                disabled={isSidePanelOpen}
                sx={hasUserCreatedViews ? { width: "39px", height: "39px", padding: "8px", minWidth: 0 } : {}}>
                <BackupTable />
                {!hasUserCreatedViews && <span>{MANAGE_VIEWS_LABEL}</span>}
            </ViewManageButton>
        </span>
    </Tooltip>
);
