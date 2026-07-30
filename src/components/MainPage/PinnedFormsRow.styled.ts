import { Box, Typography } from "@mui/material";
import styled from "styled-components";

/** Shared palette for the pinned-forms "empty slot" visuals. */
export const PIN_BADGE_COLORS = {
  icon: "#1E88E5",
  background: "#E3F2FD",
  border: "#BBDEFB",
} as const;

export const PinnedRowContainer = styled(Box)`
  width: 100%;
  margin-bottom: 24px;
`;

export const PinnedRowHeader = styled(Box)`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 12px;
`;

export const PinnedRowTitleWrapper = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PinnedRowTitle = styled(Typography)`
  font-size: 16px;
  font-weight: 600;
  color: #020618;
`;

export const PinnedRowCounter = styled(Typography)`
  font-size: 14px;
  font-weight: 600;
  color: #62748e;
`;

export const PinBadgeBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${PIN_BADGE_COLORS.background};
  border: 1px solid ${PIN_BADGE_COLORS.border};
`;

/** Dashed border color for the empty pinned slots (Figma). */
const PLACEHOLDER_BORDER_COLOR = "#62748E";

/**
 * Accurate 9,9 dashed border (Figma spec) rendered as an SVG background so we
 * can control the dash length/gap, which plain `border-style: dashed` can't do.
 */
const dashedBorder = (color: string) =>
  `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='15' ry='15' stroke='${encodeURIComponent(
    color,
  )}' stroke-width='1' stroke-dasharray='9%2c 9'/%3e%3c/svg%3e")`;

export const PlaceholderCard = styled(Box) <{ $filled?: boolean }>`
  position: relative;
  width: 100%;
  max-width: 440px;
  min-height: 220px;
  height: 100%;
  border-radius: 15px;
  background-image: ${({ $filled }) =>
    $filled ? "none" : dashedBorder(PLACEHOLDER_BORDER_COLOR)};
  background-color: ${({ $filled }) => ($filled ? "#FFFFFF" : "transparent")};
  border: ${({ $filled }) => ($filled ? "1px solid transparent" : "none")};
  box-shadow: ${({ $filled }) =>
    $filled ? "0px 2px 8px rgba(0, 0, 0, 0.08)" : "none"};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 16px 72px 16px;
  text-align: center;
`;

export const PlaceholderHintWrapper = styled(Box)`
  position: absolute;
  left: 16px;
  right: 16px;
  top: 50%;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

export const PlaceholderHintTitle = styled(Typography)`
  font-size: 21px !important;
  font-weight: 600 !important;
  color: #020618;
  font-weight: 600;
`;

export const PlaceholderHintSubtitle = styled(Typography)`
  font-size: 17px !important;
  color: #020618;
`;
