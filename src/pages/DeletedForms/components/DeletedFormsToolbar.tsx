import React, { useState } from "react";
import {
  Box,
  Stack,
  Select,
  MenuItem,
  Typography,
  Button,
  Menu,
  SelectChangeEvent,
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

interface DeletedFormsToolbarProps {
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
  fontSize: 14,
  fontWeight: 500,
  fontFamily: "Heebo, sans-serif",
  color: "#0F172B",
};

const ToolbarInput = ({
  icon,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <Box
    sx={{
      position: "relative",
      width: 210,
      height: 36,
    }}>
    <Box
      sx={{
        position: "absolute",
        left: 10,
        top: "50%",
        transform: "translateY(-50%)",
        color: "#94A3B8",
        display: "flex",
        pointerEvents: "none",
      }}>
      {icon}
    </Box>

    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        borderRadius: 4,
        border: "1px solid #E2E8F0",
        paddingRight: 38,
        paddingLeft: 12,
        fontSize: 17,
        fontWeight: 500,
        fontFamily: "Heebo, sans-serif",
        backgroundColor: "#fff",
        outline: "none",
        direction: "rtl",
      }}
    />
  </Box>
);

const DeletedFormsToolbar: React.FC<DeletedFormsToolbarProps> = ({
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

  const handleScopeChange = (event: SelectChangeEvent<string>) => {
    onScopeChange(event.target.value);
  };

  const handleSortSelect = (newSortBy: string, direction: "asc" | "desc") => {
    onSortChange(newSortBy, direction);
    setSortAnchorEl(null);
  };
const renderScopeOption = (value: "forms" | "responses", showChevron = false) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    sx={{ width: "100%", gap: 1 }}>
    <Stack direction="row" alignItems="center" spacing={1}>
      {value === "forms" ? <FileText size={18} /> : <MessageSquare size={18} />}

      <Typography sx={controlTextSx}>
        {value === "forms" ? "טפסים שנמחקו" : "תגובות שנמחקו"}
      </Typography>
    </Stack>

    {showChevron && <ChevronDown size={18} />}
  </Stack>
);

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
          <Button
            onClick={onToggleHasResponses}
            variant="outlined"
            startIcon={
              hasResponsesFilter ? (
                <CheckSquare size={18} color={theme.palette.primary.main} />
              ) : (
                <Square size={18} />
              )
            }
            sx={{
              width: 210,
              height: 36,
              bgcolor: "#fff",
              borderColor: "#E2E8F0",
              textTransform: "none",
              gap: 1.5,
              ...controlTextSx,
            }}>
            טפסים עם תגובות
          </Button>
        )}

        <Box sx={{ width: 235 }}>
          <Select
            value={scopeParam === "responses" ? "responses" : "forms"}
            onChange={handleScopeChange}
            IconComponent={() => null}
            renderValue={(value) => renderScopeOption(value as "forms" | "responses", true)}
            sx={{
              width: "100%",
              height: 36,
              bgcolor: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: 1,
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            }}>
            <MenuItem value="responses">{renderScopeOption("responses")}</MenuItem>

            <MenuItem value="forms">{renderScopeOption("forms")}</MenuItem>
          </Select>
        </Box>

        <Box>
          <Button
            onClick={(event) => setSortAnchorEl(event.currentTarget)}
            endIcon={<ChevronDown size={18} />}
            sx={{
              width: 220,
              height: 36,
              justifyContent: "space-between",
              bgcolor: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: 1,
              textTransform: "none",
              ...controlTextSx,
            }}>
            {sortOptions.find(
              (option) => option.sortBy === sortBy && option.direction === sortDirection,
            )?.label ?? "מיין לפי"}
          </Button>

          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={() => setSortAnchorEl(null)}>
            {sortOptions.map((option) => (
              <MenuItem
                key={`${option.sortBy}-${option.direction}`}
                onClick={() => handleSortSelect(option.sortBy, option.direction as "asc" | "desc")}
                sx={controlTextSx}>
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Stack>
    </Box>
  );
};

export default DeletedFormsToolbar;
