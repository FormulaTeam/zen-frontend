import React, { useState, useCallback } from "react";
import {
  Box,
  Stack,
  MenuItem,
  Typography,
  Menu,
  useTheme,
} from "@mui/material";
import {
  Search,
  UserCircle,
  ChevronDown,
  FileText,
  MessageSquare,
  CheckSquare,
  Square,
} from "lucide-react";
import { sortOptions } from "../types";
import { StyledToolbarInput, FilterButton } from "../styled";

interface RecycleBinToolbarProps {
  activeTab: number;
  scopeParam: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
  hasResponsesFilter: boolean | undefined;
  searchTerm: string;
  createdBySearch: string;
  deletedBySearch: string;
  onSearchChange: (value: string) => void;
  onCreatedByChange: (value: string) => void;
  onDeletedByChange: (value: string) => void;
  onScopeChange: (scope: string) => void;
  onSortChange: (sortBy: string, direction: "asc" | "desc") => void;
  onToggleHasResponses: () => void;
}

const controlTextSx = {
  fontSize: 13,
  fontWeight: 500,
  fontFamily: "Heebo, sans-serif",
};

const ScopeOption: React.FC<{ value: string; isSelected?: boolean }> = ({ value }) => {
  const isForms = value === "forms";
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ width: "100%" }}>
      {isForms ? <FileText size={18} /> : <MessageSquare size={18} />}
      <Typography sx={{ ...controlTextSx, color: "inherit" }}>
        {isForms ? "טפסים שנמחקו" : "תגובות שנמחקו"}
      </Typography>
    </Stack>
  );
};

const ToolbarInput: React.FC<{
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ icon, placeholder, value, onChange }) => (
  <Box sx={{ position: "relative", width: 192, height: 36 }}>
    <Box
      sx={{
        position: "absolute",
        left: 10,
        top: "50%",
        transform: "translateY(-50%)",
        color: "text.disabled",
        display: "flex",
        pointerEvents: "none",
      }}>
      {icon}
    </Box>
    <StyledToolbarInput
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </Box>
);

const RecycleBinToolbar: React.FC<RecycleBinToolbarProps> = ({
  activeTab,
  scopeParam,
  sortBy,
  sortDirection,
  hasResponsesFilter,
  searchTerm,
  createdBySearch,
  deletedBySearch,
  onSearchChange,
  onCreatedByChange,
  onDeletedByChange,
  onScopeChange,
  onSortChange,
  onToggleHasResponses,
}) => {
  const theme = useTheme();
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [scopeAnchorEl, setScopeAnchorEl] = useState<null | HTMLElement>(null);

  const handleScopeClick = useCallback((scope: string) => {
    onScopeChange(scope);
    setScopeAnchorEl(null);
  }, [onScopeChange]);

  const handleSortClick = useCallback((newSortBy: string, direction: "asc" | "desc") => {
    onSortChange(newSortBy, direction);
    setSortAnchorEl(null);
  }, [onSortChange]);

  return (
    <Box
      sx={{
        pt: 3,
        pb: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
      }}>
      <Stack direction="row" spacing={1}>
        <ToolbarInput
          icon={<Search size={18} />}
          placeholder="חיפוש טופס"
          value={searchTerm}
          onChange={onSearchChange}
        />
        <ToolbarInput
          icon={<UserCircle size={18} />}
          placeholder="נוצר ע״י"
          value={createdBySearch}
          onChange={onCreatedByChange}
        />
        <ToolbarInput
          icon={<UserCircle size={18} />}
          placeholder="נמחק ע״י"
          value={deletedBySearch}
          onChange={onDeletedByChange}
        />
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        {activeTab === 0 && (
          <FilterButton
            onClick={onToggleHasResponses}
            variant="outlined"
            startIcon={
              hasResponsesFilter ? (
                <CheckSquare size={18} color={theme.palette.primary.main} />
              ) : (
                <Square size={18} />
              )
            }
            sx={{ width: 235, gap: 1.5 }}>
            <Typography sx={controlTextSx}>טפסים עם תגובות</Typography>
          </FilterButton>
        )}

        <Box>
          <FilterButton
            onClick={(e) => setScopeAnchorEl(e.currentTarget)}
            variant="outlined"
            endIcon={<ChevronDown size={18} />}
            sx={{ width: 220, justifyContent: "space-between" }}>
            <ScopeOption value={scopeParam === "responses" ? "responses" : "forms"} />
          </FilterButton>
          <Menu
            anchorEl={scopeAnchorEl}
            open={Boolean(scopeAnchorEl)}
            onClose={() => setScopeAnchorEl(null)}>
            <MenuItem onClick={() => handleScopeClick("responses")}>
              <ScopeOption value="responses" />
            </MenuItem>
            <MenuItem onClick={() => handleScopeClick("forms")}>
              <ScopeOption value="forms" />
            </MenuItem>
          </Menu>
        </Box>

        <Box>
          <FilterButton
            onClick={(e) => setSortAnchorEl(e.currentTarget)}
            variant="outlined"
            endIcon={<ChevronDown size={18} />}
            sx={{ width: 265, justifyContent: "space-between" }}>
            <Typography
              sx={{
                ...controlTextSx,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textAlign: "left",
              }}>
              {sortOptions.find((opt) => opt.sortBy === sortBy && opt.direction === sortDirection)
                ?.label ?? "מיין לפי"}
            </Typography>
          </FilterButton>
          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={() => setSortAnchorEl(null)}>
            {sortOptions.map((option) => (
              <MenuItem
                key={`${option.sortBy}-${option.direction}`}
                onClick={() => handleSortClick(option.sortBy, option.direction as "asc" | "desc")}>
                <Typography sx={controlTextSx}>{option.label}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Stack>
    </Box>
  );
};

export default RecycleBinToolbar;
