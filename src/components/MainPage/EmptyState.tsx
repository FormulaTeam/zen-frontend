import React, { useState } from "react";
import { Box, Typography, Button, Paper, Fade, Popper } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { IPath } from "../../types/enums/global.enums";

const EmptyCard = styled(Button)(({ theme }) => ({
  width: "100%",
  minHeight: "220px",
  height: "100%",
  backgroundColor: "#ffffff",
  borderRadius: "15px", // Matching FormCard
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid transparent",
  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", // Bouncy transition
  textTransform: "none",
  color: "inherit",
  padding: "24px",
  "&:hover": {
    backgroundColor: "rgba(30, 136, 229, 0.02)", // Very subtle blue tint
    boxShadow: "0px 15px 35px rgba(30, 136, 229, 0.12)", // Blue-tinted shadow
    borderColor: "#1E88E5",
    "& .large-plus-icon": {
      transform: "scale(1.1) rotate(90deg)", // Scale and rotate icon
      opacity: 1,
    },
  },
}));

const LargePlusIcon = styled(AddIcon)(({ theme }) => ({
  fontSize: "80px", // Adjusted to fit card better
  color: "#1E88E5",
  fontWeight: 100,
  opacity: 0.6,
  transition: "all 0.4s ease-in-out",
}));

const TooltipPaper = styled(Paper)(({ theme }) => ({
  padding: "16px 20px",
  width: "fit-content",
  maxWidth: "450px",
  borderRadius: "16px",
  boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
  position: "relative",
  backgroundColor: "#ffffff",
  "&::after": {
    content: '""',
    position: "absolute",
    top: "30px", // Aligned with the top part of the tooltip
    left: "-8px", // Points to the card on the left (tooltip is on the right)
    transform: "rotate(45deg)",
    width: "16px",
    height: "16px",
    backgroundColor: "#ffffff",
    borderLeft: "1px solid rgba(0, 0, 0, 0.04)",
    borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
  },
}));

const DismissButton = styled(Button)(({ theme }) => ({
  marginTop: "12px",
  backgroundColor: "#f0f2f5",
  color: "#4a5568",
  borderRadius: "8px",
  fontSize: "14px",
  padding: "4px 16px",
  fontWeight: 600,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#e2e8f0",
  },
}));

export function EmptyState() {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const cardRef = (node: HTMLButtonElement | null) => {
    if (node) setAnchorEl(node);
  };

  const handleCreateClick = () => {
    navigate(IPath.FORM_CREATE);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <EmptyCard ref={cardRef} onClick={handleCreateClick} disableRipple className="empty-state-card">
        <LargePlusIcon className="large-plus-icon" />
      </EmptyCard>

      <Popper
        open={showTooltip && Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="right-start" // Aligns top of tooltip with top of card
        transition
        modifiers={[
          {
            name: "offset",
            options: {
              offset: [0, 40],
            },
          },
        ]}>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <TooltipPaper sx={{ direction: "rtl" }}>
              <Typography
                sx={{
                  fontSize: "15px",
                  lineHeight: "1.4",
                  color: "#2d3748",
                  textAlign: "left", 
                  fontWeight: 500,
                }}>
                <Box component="span" sx={{ whiteSpace: "nowrap", display: "block", fontWeight: 600 }}>
                  כאן תוכלו ליצור את הטופס הראשון שלכם
                </Box>

                טופס הוא כלי להזנת מידע שניתן ליצור בהתאמה אישית
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 1 }}>
                <DismissButton onClick={() => setShowTooltip(false)}>סגירה</DismissButton>
              </Box>

            </TooltipPaper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
}

export default EmptyState;
