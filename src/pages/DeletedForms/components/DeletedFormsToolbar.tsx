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
  const isSortMenuOpen = Boolean(sortAnchorEl);

  const handleSortClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortSelect = (newSortBy: string, newDirection: "asc" | "desc") => {
    onSortChange(newSortBy, newDirection);
    handleSortClose();
  };

  const handleDropdownChange = (event: SelectChangeEvent<string>) => {
    onScopeChange(event.target.value);
  };

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
      {/* Left Group: Search Inputs */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ position: "relative", width: "210px", height: "36px" }}>
          <Box
            sx={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94A3B8",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}>
            <Search size={18} />
          </Box>
          <input
            placeholder="חיפוש טופס"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "4px",
              border: "1px solid #E2E8F0",
              paddingLeft: "34px",
              paddingRight: "10px",
              fontSize: "10px",
              fontWeight: 500,
              fontFamily: "Heebo, sans-serif",
              backgroundColor: "#ffffff",
              outline: "none",
              textAlign: "left",
            }}
          />
        </Box>

        <Box sx={{ position: "relative", width: "210px", height: "36px" }}>
          <Box
            sx={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94A3B8",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}>
            <UserCircle size={18} />
          </Box>
          <input
            placeholder="נוצר ע״י"
            value={createdBySearch}
            onChange={(e) => onCreatedByChange(e.target.value)}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "4px",
              border: "1px solid #E2E8F0",
              paddingLeft: "34px",
              paddingRight: "10px",
              fontSize: "10px",
              fontWeight: 500,
              fontFamily: "Heebo, sans-serif",
              backgroundColor: "#ffffff",
              outline: "none",
              textAlign: "left",
            }}
          />
        </Box>

        <Box sx={{ position: "relative", width: "210px", height: "36px" }}>
          <Box
            sx={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94A3B8",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}>
            <UserCircle size={18} />
          </Box>
          <input
            placeholder="נמחק ע״י"
            value={deletedBySearch}
            onChange={(e) => onDeletedByChange(e.target.value)}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "4px",
              border: "1px solid #E2E8F0",
              paddingLeft: "34px",
              paddingRight: "10px",
              fontSize: "10px",
              fontWeight: 500,
              fontFamily: "Heebo, sans-serif",
              backgroundColor: "#ffffff",
              outline: "none",
              textAlign: "left",
            }}
          />
        </Box>
      </Stack>

      {/* Right Group: Sort & Scope */}
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
              height: "36px",
              bgcolor: "#ffffff",
              color: "#0F172B",
              border: "1px solid #E2E8F0",
              borderRadius: "4px",
              textTransform: "none",
              boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.05)",
              gap: 1,
              direction: "ltr",
              "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
            }}>
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: "10px",
                fontFamily: "Heebo, sans-serif",
                color: "#0F172B",
              }}>
              טפסים עם תגובות
            </Typography>
          </Button>
        )}

        <Box sx={{ width: "200px" }}>
          <Select
            id="trash-tab-select"
            value={scopeParam === "responses" ? "responses" : "forms"}
            onChange={handleDropdownChange}
            IconComponent={() => null}
            renderValue={(selected) => (
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                {selected === "forms" ? (
                  <FileText size={18} color="#0F172B" />
                ) : (
                  <MessageSquare size={18} color="#0F172B" />
                )}
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: "10px",
                    fontFamily: "Heebo, sans-serif",
                    color: "#0F172B",
                    flex: 1,
                    textAlign: "left",
                    ml: 0.5,
                  }}>
                  {selected === "forms" ? "טפסים שנמחקו" : "תגובות שנמחקו"}
                </Typography>
                <ChevronDown size={18} color="#0F172B" />
              </Stack>
            )}
            sx={{
              width: "100%",
              height: "36px",
              borderRadius: "4px",
              bgcolor: "#ffffff",
              border: "1px solid #E2E8F0",
              boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.05)",
              "& .MuiSelect-select": {
                py: 0.5,
                px: 1.5,
                display: "flex",
                alignItems: "center",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "&:hover": {
                bgcolor: "#f8fafc",
                borderColor: "#cbd5e1",
              },
            }}>
            {/* Figma-inspired Inverted Order: Responses on top */}
            <MenuItem value="responses" sx={{ minHeight: "32px", py: 0.5 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ width: "100%", direction: "ltr" }}>
                <MessageSquare size={18} color="#0F172B" />
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: "10px",
                    fontFamily: "Heebo, sans-serif",
                    flex: 1,
                    textAlign: "left",
                    ml: 1,
                  }}>
                  תגובות שנמחקו
                </Typography>
              </Stack>
            </MenuItem>
            <MenuItem value="forms" sx={{ minHeight: "32px", py: 0.5 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ width: "100%", direction: "ltr" }}>
                <FileText size={18} color="#0F172B" />
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: "10px",
                    fontFamily: "Heebo, sans-serif",
                    flex: 1,
                    textAlign: "left",
                    ml: 1,
                  }}>
                  טפסים שנמחקו
                </Typography>
              </Stack>
            </MenuItem>
          </Select>
        </Box>

        <Box>
          <Button
            onClick={handleSortClick}
            sx={{
              height: "36px",
              width: "265px",
              justifyContent: "flex-start",
              bgcolor: "#ffffff",
              color: "#0F172B",
              border: "1px solid #E2E8F0",
              borderRadius: "4px",
              px: 1.5,
              gap: 1,
              textTransform: "none",
              boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.05)",
              direction: "ltr",
              "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
            }}
            endIcon={<ChevronDown size={18} />}>
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: "10px",
                fontFamily: "Heebo, sans-serif",
                color: "#0F172B",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                textAlign: "left",
              }}>
              {sortOptions.find((opt) => opt.sortBy === sortBy && opt.direction === sortDirection)
                ?.label || "מיין לפי"}
            </Typography>
          </Button>
          <Menu
            anchorEl={sortAnchorEl}
            open={isSortMenuOpen}
            onClose={handleSortClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            sx={{
              "& .MuiPaper-root": {
                mt: 1,
                minWidth: 180,
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
                border: "1px solid #E2E8F0",
              },
            }}>
            {sortOptions.map((option) => (
              <MenuItem
                key={`${option.sortBy}-${option.direction}`}
                onClick={() => handleSortSelect(option.sortBy, option.direction as "asc" | "desc")}
                selected={sortBy === option.sortBy && sortDirection === option.direction}
                sx={{
                  fontSize: "14px",
                  fontFamily: "Heebo",
                  justifyContent: "flex-start",
                  "&.Mui-selected": {
                    bgcolor: "rgba(25, 118, 210, 0.08)",
                    fontWeight: 600,
                  },
                }}>
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
