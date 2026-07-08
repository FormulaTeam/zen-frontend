import { Box, Popover, Tooltip, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { useMemo, useState, type MouseEvent } from "react";

import { UnifiedButton } from "../styled";

const ACTION_BUTTON_BACKGROUND = "#DFECF9";
const ACTION_BUTTON_HOVER_BACKGROUND = "#D4E6F8";

export type ResponsesTableColorRuleColor =
  | "red"
  | "lightRed"
  | "orange"
  | "lightOrange"
  | "blue"
  | "lightBlue"
  | "green"
  | "lightGreen";

type ColorFilterOption = {
  value: ResponsesTableColorRuleColor;
  label: string;
  color: string;
};

export const RESPONSE_COLOR_FILTER_OPTIONS: ColorFilterOption[] = [
  { value: "red", label: "אדום", color: "#F7CACA" },
  { value: "lightRed", label: "אדום בהיר", color: "#FFE3E3" },
  { value: "orange", label: "כתום", color: "#FFD9A8" },
  { value: "lightOrange", label: "כתום בהיר", color: "#FFEBCB" },
  { value: "blue", label: "כחול", color: "#A8D6F8" },
  { value: "lightBlue", label: "כחול בהיר", color: "#D9EEFF" },
  { value: "green", label: "ירוק", color: "#B8F3CB" },
  { value: "lightGreen", label: "ירוק בהיר", color: "#DCFCE7" },
];

export const RESPONSE_COLOR_FILTER_VALUES: ResponsesTableColorRuleColor[] =
  RESPONSE_COLOR_FILTER_OPTIONS.map((option) => option.value);

interface ColorFilterButtonProps {
  selectedColors: ResponsesTableColorRuleColor[];
  onChange: (colors: ResponsesTableColorRuleColor[]) => void;
  disabled?: boolean;
}

export function ColorFilterButton({
  selectedColors,
  onChange,
  disabled = false,
}: ColorFilterButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);

  const selectedColorSet = useMemo(() => new Set(selectedColors), [selectedColors]);

  const isAllSelected = selectedColors.length === RESPONSE_COLOR_FILTER_VALUES.length;

  const isPartiallySelected =
    selectedColors.length > 0 && selectedColors.length < RESPONSE_COLOR_FILTER_VALUES.length;

  const buttonLabel = useMemo(() => {
    if (isAllSelected) {
      return "כל הצבעים";
    }

    if (selectedColors.length === 0) {
      return "לא נבחר צבע";
    }

    if (selectedColors.length === 1) {
      return (
        RESPONSE_COLOR_FILTER_OPTIONS.find((option) => option.value === selectedColors[0])?.label ??
        "צבע אחד"
      );
    }

    return `${selectedColors.length} צבעים`;
  }, [isAllSelected, selectedColors]);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleAll = () => {
    onChange(isAllSelected ? [] : RESPONSE_COLOR_FILTER_VALUES);
  };

  const handleToggleColor = (color: ResponsesTableColorRuleColor) => {
    const nextSelectedColorSet = new Set(selectedColors);

    if (nextSelectedColorSet.has(color)) {
      nextSelectedColorSet.delete(color);
    } else {
      nextSelectedColorSet.add(color);
    }

    onChange(RESPONSE_COLOR_FILTER_VALUES.filter((value) => nextSelectedColorSet.has(value)));
  };

  return (
    <Box sx={{ position: "relative", flexShrink: 0, overflow: "visible" }}>
      <Tooltip title="סינון לפי צבע" arrow>
        <span>
          <UnifiedButton
            aria-label="סינון לפי צבע"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={handleOpen}
            disabled={disabled}
            sx={{
              width: "220px",
              minWidth: "220px",
              maxWidth: "220px",
              height: "40px",
              px: 1.25,
              gap: 0.6,
              justifyContent: "space-between",
              flexShrink: 0,

              backgroundColor: `${ACTION_BUTTON_BACKGROUND} !important`,
              border: "none !important",
              borderColor: "transparent !important",
              boxShadow: "none !important",
              color: "#111827 !important",
              fontWeight: 700,

              "&:hover": {
                backgroundColor: `${ACTION_BUTTON_HOVER_BACKGROUND} !important`,
                border: "none !important",
                borderColor: "transparent !important",
                boxShadow: "none !important",
              },

              "&:focus, &:focus-visible": {
                outline: "none !important",
                backgroundColor: `${ACTION_BUTTON_BACKGROUND} !important`,
                border: "none !important",
                borderColor: "transparent !important",
                boxShadow: "none !important",
              },

              "&.Mui-disabled": {
                backgroundColor: "rgba(0, 0, 0, 0.04) !important",
                color: "rgba(0, 0, 0, 0.26) !important",
              },
            }}>
            <Typography
              component="span"
              sx={{
                flex: 1,
                minWidth: 0,
                fontFamily: "Heebo, assistant, sans-serif",
                fontSize: "18px !important",
                fontWeight: "600 !important",
                lineHeight: "24px !important",
                letterSpacing: "0.0075em !important",
                color: "#020618 !important",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textAlign: "left",
              }}>
              {buttonLabel}
            </Typography>

            <KeyboardArrowDownRoundedIcon
              sx={{
                fontSize: 21,
                flexShrink: 0,
                transform: open ? "rotate(180deg)" : "none",
                transition: "transform 0.15s ease",
              }}
            />
          </UnifiedButton>
        </span>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            mt: 0.8,
            borderRadius: "6px",
            overflow: "hidden",
            border: "1px solid #E5EAF0",
            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.14)",
          },
        }}>
        <Box
          dir="rtl"
          sx={{
            width: 220,
            backgroundColor: "#fff",
            py: 0.5,
          }}>
          <Box
            sx={{
              height: 38,
              px: 1.75,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              borderBottom: "1px solid #E5EAF0",
              backgroundColor: "#fff",
            }}>
            <AllCheckIndicator
              checked={isAllSelected}
              indeterminate={isPartiallySelected}
              onClick={handleToggleAll}
            />

            <Typography
              sx={{
                flex: 1,
                fontSize: 10,
                fontWeight: 500,
                color: "#111827",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
              תצוגת צבעים הכל
            </Typography>
          </Box>

          <Box sx={{ py: 0.5 }}>
            {RESPONSE_COLOR_FILTER_OPTIONS.map((option) => (
              <ColorFilterRow
                key={option.value}
                label={option.label}
                checked={selectedColorSet.has(option.value)}
                color={option.color}
                onClick={() => handleToggleColor(option.value)}
              />
            ))}
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}

interface ColorFilterRowProps {
  label: string;
  checked: boolean;
  color: string;
  onClick: () => void;
}

function ColorFilterRow({ label, checked, color, onClick }: ColorFilterRowProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        width: "100%",
        height: 36,
        border: 0,
        outline: 0,
        backgroundColor: "transparent",
        px: 1.75,
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        cursor: "pointer",
        textAlign: "left",
        font: "inherit",

        "&:hover": {
          backgroundColor: "#F8FBFF",
        },
      }}>
      <ColorCircle checked={checked} color={color} />

      <Typography
        sx={{
          flex: 1,
          fontSize: 10,
          fontWeight: 500,
          color: "#111827",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
        {label}
      </Typography>
    </Box>
  );
}

interface ColorCircleProps {
  checked: boolean;
  color: string;
}

function ColorCircle({ checked, color }: ColorCircleProps) {
  return (
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `2px solid ${color}`,
        backgroundColor: checked ? `${color}55` : "transparent",
        boxSizing: "border-box",
      }}>
      {checked && (
        <CheckRoundedIcon
          sx={{
            fontSize: 13,
            color,
          }}
        />
      )}
    </Box>
  );
}

interface AllCheckIndicatorProps {
  checked: boolean;
  indeterminate: boolean;
  onClick: () => void;
}

function AllCheckIndicator({ checked, indeterminate, onClick }: AllCheckIndicatorProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        width: 20,
        height: 20,
        borderRadius: "5px",
        border: "none",
        backgroundColor: checked || indeterminate ? "#1E88E5" : "transparent",
        outline: checked || indeterminate ? "none" : "2px solid #BFD7F1",
        outlineOffset: "-2px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        p: 0,

        "&:hover": {
          backgroundColor: checked || indeterminate ? "#1976D2" : "#F8FBFF",
        },
      }}>
      {indeterminate ? (
        <RemoveRoundedIcon sx={{ fontSize: 15, color: "#fff" }} />
      ) : checked ? (
        <CheckRoundedIcon sx={{ fontSize: 15, color: "#fff" }} />
      ) : null}
    </Box>
  );
}
