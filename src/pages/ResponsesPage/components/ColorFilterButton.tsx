import { Box, Popover, Tooltip, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { useMemo, useState, type MouseEvent } from "react";

import type { ResponsesTableColorRuleColor } from "../../../types/shared";
import { COLOR_RULE_PALETTE } from "../utils/colorRules";

import { UnifiedButton } from "../styled";

const ACTION_BUTTON_BACKGROUND = "#DFECF9";
const ACTION_BUTTON_HOVER_BACKGROUND = "#D4E6F8";
const COLOR_FILTER_BUTTON_WIDTH = 320;
const COLOR_FILTER_POPOVER_WIDTH = 320;
const COLOR_FILTER_RULE_FONT_SIZE = 9;

export type ColorRuleFilterOption = {
  id: string;
  label: string;
  color: ResponsesTableColorRuleColor;
};

interface ColorFilterButtonProps {
  rules: ColorRuleFilterOption[];
  selectedRuleIds: string[];
  onChange: (ruleIds: string[]) => void;
  disabled?: boolean;
}

export function ColorFilterButton({
  rules,
  selectedRuleIds,
  onChange,
  disabled = false,
}: ColorFilterButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);
  const allRuleIds = useMemo(() => rules.map((rule) => rule.id), [rules]);

  const selectedRuleIdSet = useMemo(() => new Set(selectedRuleIds), [selectedRuleIds]);

  const hasRules = rules.length > 0;
  const isAllSelected = hasRules && selectedRuleIds.length === rules.length;

  const isPartiallySelected = selectedRuleIds.length > 0 && selectedRuleIds.length < rules.length;

  const isDisabled = disabled || !hasRules;

  const buttonLabel = useMemo(() => {
    if (!hasRules) {
      return "אין חוקי צבע";
    }

    if (isAllSelected) {
      return "כל חוקי הצבעים";
    }

    if (selectedRuleIds.length === 0) {
      return "לא נבחרו חוקים";
    }

    if (selectedRuleIds.length === 1) {
      return rules.find((rule) => rule.id === selectedRuleIds[0])?.label ?? "חוק אחד";
    }

    return `${selectedRuleIds.length} חוקים`;
  }, [hasRules, isAllSelected, selectedRuleIds, rules]);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    if (isDisabled) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleAll = () => {
    onChange(isAllSelected ? [] : allRuleIds);
  };

  const handleToggleRule = (ruleId: string) => {
    const nextSelectedRuleIdSet = new Set(selectedRuleIds);

    if (nextSelectedRuleIdSet.has(ruleId)) {
      nextSelectedRuleIdSet.delete(ruleId);
    } else {
      nextSelectedRuleIdSet.add(ruleId);
    }

    onChange(allRuleIds.filter((id) => nextSelectedRuleIdSet.has(id)));
  };

  return (
    <Box sx={{ position: "relative", flexShrink: 0, overflow: "visible" }}>
      <Tooltip title={hasRules ? "סינון לפי חוקי צבע" : "אין חוקי צבע פעילים"} arrow>
        <span>
          <UnifiedButton
            aria-label="סינון לפי חוקי צבע"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={handleOpen}
            disabled={isDisabled}
            sx={{
              width: `${COLOR_FILTER_BUTTON_WIDTH}px`,
              minWidth: `${COLOR_FILTER_BUTTON_WIDTH}px`,
              maxWidth: `${COLOR_FILTER_BUTTON_WIDTH}px`,
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
            width: COLOR_FILTER_POPOVER_WIDTH,
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
                fontSize: COLOR_FILTER_RULE_FONT_SIZE,
                fontWeight: 500,
                color: "#111827",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
              כל חוקי הצבע
            </Typography>
          </Box>

          <Box sx={{ py: 0.5 }}>
            {rules.map((rule) => (
              <ColorRuleFilterRow
                key={rule.id}
                label={rule.label}
                checked={selectedRuleIdSet.has(rule.id)}
                color={COLOR_RULE_PALETTE[rule.color].swatch}
                onClick={() => handleToggleRule(rule.id)}
              />
            ))}
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}

interface ColorRuleFilterRowProps {
  label: string;
  checked: boolean;
  color: string;
  onClick: () => void;
}

function ColorRuleFilterRow({ label, checked, color, onClick }: ColorRuleFilterRowProps) {
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
        title={label}
        sx={{
          flex: 1,
          fontSize: COLOR_FILTER_RULE_FONT_SIZE,
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
