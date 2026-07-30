import { Box, Popover, Tooltip, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { Eye, EyeOff, SwatchBook } from "lucide-react";
import { useMemo, useState, type MouseEvent } from "react";

import type { ResponsesTableColorRuleColor } from "../../../types/shared";
import { COLOR_RULE_PALETTE } from "../utils/colorRules";

import { UnifiedButton } from "../styled";

const ACTION_BUTTON_BACKGROUND = "#DFECF9";
const ACTION_BUTTON_HOVER_BACKGROUND = "#D4E6F8";
const COLOR_FILTER_BUTTON_WIDTH = 320;
const COLOR_FILTER_POPOVER_WIDTH = 340;
const COLOR_FILTER_RULE_FONT_SIZE = "18px !important";

export type ColorRuleFilterOption = {
  id: string;
  label: string;
  color: ResponsesTableColorRuleColor;
};

interface ColorFilterButtonProps {
  rules: ColorRuleFilterOption[];
  selectedRuleIds: string[];
  onChange: (ruleIds: string[]) => void;
  hiddenColorRuleIdSet: ReadonlySet<string>;
  onToggleRuleColor: (ruleId: string) => void;
  onToggleAllColors: () => void;
  showColorRulesIcon?: boolean;
  disabled?: boolean;
}

export function ColorFilterButton({
  rules,
  selectedRuleIds,
  onChange,
  hiddenColorRuleIdSet,
  onToggleRuleColor,
  onToggleAllColors,
  showColorRulesIcon = false,
  disabled = false,
}: ColorFilterButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);
  const allRuleIds = useMemo(() => rules.map((rule) => rule.id), [rules]);

  const selectedRuleIdSet = useMemo(() => new Set(selectedRuleIds), [selectedRuleIds]);
  const hasRules = rules.length > 0;
  const selectedRuleCount = allRuleIds.filter((ruleId) => selectedRuleIdSet.has(ruleId)).length;
  const isAllSelected = hasRules && selectedRuleCount === rules.length;
  const isPartiallySelected = selectedRuleCount > 0 && !isAllSelected;

  const isDisabled = disabled || !hasRules;
  const areAllColorsHidden =
    hasRules && allRuleIds.every((ruleId) => hiddenColorRuleIdSet.has(ruleId));

  const buttonLabel = useMemo(() => {
    if (!hasRules) {
      return "אין חוקי צבע";
    }

    if (isAllSelected) {
      return "כל חוקי הצבעים";
    }

    if (selectedRuleCount === 0) {
      return "לא נבחרו חוקים";
    }

    if (selectedRuleCount === 1) {
      return rules.find((rule) => selectedRuleIdSet.has(rule.id))?.label ?? "חוק אחד";
    }

    return `${selectedRuleCount} חוקים`;
  }, [hasRules, isAllSelected, rules, selectedRuleCount, selectedRuleIdSet]);

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
      <Tooltip title={buttonLabel} arrow>
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
            {showColorRulesIcon && (
              <SwatchBook
                size={21}
                strokeWidth={2}
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              />
            )}

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
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #DCE5EF",
            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.16)",
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
              height: 44,
              px: 1.75,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              borderBottom: "1px solid #EDF1F5",
              backgroundColor: "#fff",
            }}>
            <AllCheckIndicator
              checked={isAllSelected}
              indeterminate={isPartiallySelected}
              onClick={handleToggleAll}
              label={isAllSelected ? "בטל בחירת כל חוקי הצבע" : "בחר את כל חוקי הצבע"}
            />

            <Typography
              sx={{
                flex: 1,
                fontSize: COLOR_FILTER_RULE_FONT_SIZE,
                fontWeight: 500,
                color: "#334155",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
              כל חוקי הצבע
            </Typography>

            <ColorVisibilityButton
              visible={!areAllColorsHidden}
              label={areAllColorsHidden ? "הצג את כל הצבעים" : "הסתר את כל הצבעים"}
              onClick={onToggleAllColors}
              showTooltip
            />
          </Box>

          <Box sx={{ py: 0.5, maxHeight: 280, overflowY: "auto" }}>
            {rules.map((rule) => (
              <ColorRuleFilterRow
                key={rule.id}
                label={rule.label}
                checked={selectedRuleIdSet.has(rule.id)}
                color={COLOR_RULE_PALETTE[rule.color].swatch}
                onClick={() => handleToggleRule(rule.id)}
                colorVisible={!hiddenColorRuleIdSet.has(rule.id)}
                onToggleColor={() => onToggleRuleColor(rule.id)}
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
  colorVisible: boolean;
  onToggleColor: () => void;
}

function ColorRuleFilterRow({
  label,
  checked,
  color,
  onClick,
  colorVisible,
  onToggleColor,
}: ColorRuleFilterRowProps) {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: 44,
        px: 1.75,
        display: "flex",
        alignItems: "center",
        gap: 0.75,

        "&:hover": {
          backgroundColor: "#F6FAFE",
        },
      }}>
      <Box
        component="button"
        type="button"
        aria-label={checked ? `בטל בחירת חוק: ${label}` : `בחר חוק: ${label}`}
        aria-pressed={checked}
        onClick={onClick}
        sx={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          p: 0,
          border: 0,
          outline: 0,
          backgroundColor: "transparent",
          display: "flex",
          alignItems: "center",
          gap: 1.1,
          cursor: "pointer",
          textAlign: "left",
          font: "inherit",
        }}>
        <ColorCircle checked={checked} color={color} />

        <Typography
          title={label}
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: COLOR_FILTER_RULE_FONT_SIZE,
            fontWeight: 500,
            color: "#111827",
            lineHeight: 1.35,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
          {label}
        </Typography>
      </Box>

      <ColorVisibilityButton
        visible={colorVisible}
        label={colorVisible ? `הסתר צבע: ${label}` : `הצג צבע: ${label}`}
        onClick={onToggleColor}
      />
    </Box>
  );
}

interface ColorVisibilityButtonProps {
  visible: boolean;
  label: string;
  onClick: () => void;
  showTooltip?: boolean;
}

function ColorVisibilityButton({
  visible,
  label,
  onClick,
  showTooltip = false,
}: ColorVisibilityButtonProps) {
  const button = (
    <Box
      component="button"
      type="button"
      aria-label={label}
      aria-pressed={visible}
      onClick={onClick}
      sx={{
        width: 30,
        height: 30,
        p: 0,
        border: 0,
        borderRadius: "8px",
        backgroundColor: visible ? "#EEF6FF" : "#F1F5F9",
        color: visible ? "#1E78C8" : "#94A3B8",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,

        "&:hover": {
          backgroundColor: visible ? "#DCEEFF" : "#E2E8F0",
        },
      }}>
      {visible ? <Eye size={17} aria-hidden="true" /> : <EyeOff size={17} aria-hidden="true" />}
    </Box>
  );

  return showTooltip ? (
    <Tooltip title={label} arrow>
      {button}
    </Tooltip>
  ) : (
    button
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
        width: 16,
        height: 16,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1.5px solid ${color}`,
        backgroundColor: checked ? `${color}40` : "#fff",
        boxShadow: checked ? `0 0 0 2px ${color}18` : "none",
        boxSizing: "border-box",
      }}>
      {checked && (
        <CheckRoundedIcon
          sx={{
            fontSize: 12,
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
  label: string;
}

function AllCheckIndicator({ checked, indeterminate, onClick, label }: AllCheckIndicatorProps) {
  return (
    <Box
      component="button"
      type="button"
      aria-label={label}
      aria-pressed={checked}
      onClick={onClick}
      sx={{
        width: 16,
        height: 16,
        borderRadius: "4px",
        border: "none",
        backgroundColor: checked || indeterminate ? "#1E88E5" : "transparent",
        outline: checked || indeterminate ? "none" : "1.5px solid #BFD7F1",
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
        <RemoveRoundedIcon sx={{ fontSize: 12, color: "#fff" }} />
      ) : checked ? (
        <CheckRoundedIcon sx={{ fontSize: 12, color: "#fff" }} />
      ) : null}
    </Box>
  );
}
