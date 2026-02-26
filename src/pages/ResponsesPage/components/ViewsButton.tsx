import React from "react";
import Tooltip from "@mui/material/Tooltip";
import { BackupTable } from "@mui/icons-material";
import { ViewManageButton } from "@components/Responses/styled";
import { UseResponsesViewsReturn } from "../hooks/useResponsesViews";

interface ViewsButtonProps
    extends Pick<UseResponsesViewsReturn, "isSidePanelOpen" | "setIsSidePanelOpen"> { }

const MANAGE_VIEWS_LABEL = "ניהול תצוגות";

export const ViewsButton: React.FC<ViewsButtonProps> = ({ isSidePanelOpen, setIsSidePanelOpen }) => (
    <Tooltip title={MANAGE_VIEWS_LABEL}>
        <span>
            <ViewManageButton
                variant="contained"
                onClick={() => setIsSidePanelOpen(true)}
                disabled={isSidePanelOpen}>
                <BackupTable />
                <span>{MANAGE_VIEWS_LABEL}</span>
            </ViewManageButton>
        </span>
    </Tooltip>
);
