import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Grid from "@mui/material/Grid";
import {
  Box,
  Button,
  Typography,
  useTheme,
  Stack,
  Tooltip,
  IconButton,
  CircularProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
  Collapse,
  Divider,
  Card,
  Checkbox,
  Menu,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import {
  Eye,
  MessageSquare,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  UserCircle,
  RotateCcw,
  FileText,
  CheckSquare,
  EyeOff,
  LogOut,
  XCircle,
  SearchX,
} from "lucide-react";
import { useGetDeletedForms, useGetSoftDeletedResponsesGlobal, restoreForm } from "../../api/formsApi";
import { restoreResponse, restoreResponses } from "../../api/responsesApi";
import { StyledCard, FormIconWrapper } from "../../components/FormCard/styled";
import { CustomIcon } from "../../theme/icons";
import { getFormIconByName } from "../../utils/utils";
import { DeletedFormOverviewDto, FormOverviewDto } from "../../types/shared";
import queryClient from "../../api/queryClient";
import { IOrderBy, formsSortOption } from "../../types/enums/filtersAndSorts.enum";
import { Filter } from "../../utils/interfaces";
import { useDebounce } from "../../hooks/utilsHooks/useDebounce";

type DeletedFormWithResponses = (DeletedFormOverviewDto | FormOverviewDto) & {
  responses?: any[];
};

const sortOptions = [
  { label: "מועד מחיקה (חדש-ישן)", sortBy: formsSortOption.DeletedAt, direction: "desc" },
  { label: "מועד מחיקה (ישן-חדש)", sortBy: formsSortOption.DeletedAt, direction: "asc" },
  { label: "שם הטופס (א-ת)", sortBy: formsSortOption.Name, direction: "asc" },
  { label: "שם הטופס (ת-א)", sortBy: formsSortOption.Name, direction: "desc" },
];

/**
 * Main Trash Page displaying soft-deleted forms and responses in tabs.
 */
function DeletedForms({ user }: { user: any }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const [searchParams, setSearchParams] = useSearchParams();
  const scopeParam = searchParams.get("scope") || "forms";
  const activeTab = scopeParam === "responses" ? 1 : 0;

  // Sorting from query params
  const sortBy = searchParams.get("sortBy") || formsSortOption.DeletedAt;
  const sortDirection = (searchParams.get("sortDirection") as "asc" | "desc") || "desc";

  const [restoringFormId, setRestoringFormId] = useState<number | null>(null);
  const [restoringResponseId, setRestoringResponseId] = useState<string | null>(null);
  const [isBulkRestoring, setIsBulkRestoring] = useState(false);

  const [expandedForms, setExpandedForms] = useState<Record<number, boolean>>({});

  // Multi-select state
  const [selectedFormIds, setSelectedFormIds] = useState<Set<number>>(new Set());
  const [selectedResponseIds, setSelectedResponseIds] = useState<Set<string>>(new Set());

  const handleToggleSelectForm = (formId: number) => {
    setSelectedFormIds((prev) => {
      const next = new Set(prev);
      if (next.has(formId)) {
        next.delete(formId);
      } else {
        next.add(formId);
      }
      return next;
    });
  };

  const handleToggleSelectResponse = (responseId: string) => {
    setSelectedResponseIds((prev) => {
      const next = new Set(prev);
      if (next.has(responseId)) {
        next.delete(responseId);
      } else {
        next.add(responseId);
      }
      return next;
    });
  };

  // Filtering states (local only, per request)
  const [searchTerm, setSearchTerm] = useState("");
  const [createdBySearch, setCreatedBySearch] = useState("");
  const [deletedBySearch, setDeletedBySearch] = useState("");

  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const isSortMenuOpen = Boolean(sortAnchorEl);

  const handleSortClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortSelect = (newSortBy: string, newDirection: "asc" | "desc") => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sortBy", newSortBy);
    newParams.set("sortDirection", newDirection);
    setSearchParams(newParams, { replace: true });
    handleSortClose();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCreatedBySearch("");
    setDeletedBySearch("");
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedCreatedBy = useDebounce(createdBySearch, 300);
  const debouncedDeletedBy = useDebounce(deletedBySearch, 300);

  // Fetch Deleted Forms (Tab 1) via React Query
  const {
    data: deletedFormsData,
    isLoading: isDeletedFormsLoading,
    fetchNextPage: fetchNextDeletedForms,
    hasNextPage: hasNextDeletedForms,
    isFetchingNextPage: isFetchingNextDeletedForms,
  } = useGetDeletedForms({
    query: debouncedSearchTerm || undefined,
    createdBy: debouncedCreatedBy || undefined,
    deletedBy: debouncedDeletedBy || undefined,
    sortBy,
    orderBy: sortDirection === "desc" ? IOrderBy.DESC : IOrderBy.ASC,
  });

  const deletedForms = useMemo(() => (deletedFormsData?.pages.flat() as DeletedFormWithResponses[]) || [], [deletedFormsData]);

  // Fetch Active Forms with Deleted Responses (Tab 2) via React Query
  const {
    data: activeFormsData,
    isLoading: isActiveFormsLoading,
    fetchNextPage: fetchNextActiveForms,
    hasNextPage: hasNextActiveForms,
    isFetchingNextPage: isFetchingNextActiveForms,
  } = useGetSoftDeletedResponsesGlobal({
    query: debouncedSearchTerm || undefined,
    createdBy: debouncedCreatedBy || undefined,
    deletedBy: debouncedDeletedBy || undefined,
    sortBy: sortBy === formsSortOption.DeletedAt ? formsSortOption.CreatedAt : sortBy,
    orderBy: sortDirection === "desc" ? IOrderBy.DESC : IOrderBy.ASC,
  });

  const activeFormsWithDeleted = useMemo(() => (activeFormsData?.pages.flat() as DeletedFormWithResponses[]) || [], [activeFormsData]);

  const toggleFormExpanded = (formId: number) => {
    setExpandedForms((prev) => ({
      ...prev,
      [formId]: !prev[formId],
    }));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (activeTab === 0 && hasNextDeletedForms && !isFetchingNextDeletedForms) {
        fetchNextDeletedForms();
      } else if (activeTab === 1 && hasNextActiveForms && !isFetchingNextActiveForms) {
        fetchNextActiveForms();
      }
    }
  };

  const handleDropdownChange = (event: SelectChangeEvent<string>) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("scope", event.target.value);
    setSearchParams(newParams, { replace: true });
    setExpandedForms({});
    setSelectedFormIds(new Set());
    setSelectedResponseIds(new Set());
  };

  const handleRestoreFormClick = async (formId: number) => {
    setRestoringFormId(formId);
    try {
      await restoreForm(formId);
      toast.success("הטופס שוחזר בהצלחה");
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    } catch (error) {
      toast.error("שחזור הטופס נכשל");
    } finally {
      setRestoringFormId(null);
    }
  };

  const handleRestoreResponseClick = async (formId: number, responseId: string) => {
    setRestoringResponseId(responseId);
    try {
      await restoreResponse(formId, responseId);
      toast.success("התגובה שוחזרה בהצלחה");
      queryClient.invalidateQueries({ queryKey: ["forms", "responses", "soft-deleted"] });
      queryClient.invalidateQueries({ queryKey: ["forms", "soft-deleted"] });
    } catch (error) {
      toast.error("שחזור התגובה נכשל");
    } finally {
      setRestoringResponseId(null);
    }
  };

  const handleBulkRestore = async () => {
    setIsBulkRestoring(true);
    let successCount = 0;

    try {
      if (activeTab === 0) {
        const ids = Array.from(selectedFormIds);
        for (const id of ids) {
          try {
            await restoreForm(id);
            successCount++;
          } catch (e) {
            console.error(`Failed to restore form ${id}`, e);
          }
        }
        
        if (successCount > 0) {
          toast.success(`${successCount} טפסים שוחזרו בהצלחה`);
          setSelectedFormIds(new Set());
          queryClient.invalidateQueries({ queryKey: ["forms", "soft-deleted"] });
        }
      } else {
        const formResponseMap: Record<number, string[]> = {};
        
        activeFormsWithDeleted.forEach(form => {
          form.responses?.forEach(resp => {
            if (selectedResponseIds.has(resp.id)) {
              if (!formResponseMap[form.id]) formResponseMap[form.id] = [];
              formResponseMap[form.id].push(resp.id);
            }
          });
        });

        const formIds = Object.keys(formResponseMap).map(Number);
        for (const fId of formIds) {
          try {
            const respIds = formResponseMap[fId];
            await restoreResponses(fId, respIds);
            successCount += respIds.length;
          } catch (e) {
            console.error(`Failed to restore responses for form ${fId}`, e);
          }
        }

        if (successCount > 0) {
          toast.success(`${successCount} תגובות שוחזרו בהצלחה`);
          setSelectedResponseIds(new Set());
          queryClient.invalidateQueries({ queryKey: ["forms", "responses", "soft-deleted"] });
          queryClient.invalidateQueries({ queryKey: ["forms", "soft-deleted"] });
        }
      }
    } catch (error) {
      toast.error("שחזור המוני נכשל");
    } finally {
      setIsBulkRestoring(false);
    }
  };

  const getIconContent = (iconName: string | null) => {
    const iconSrc = getFormIconByName(iconName ?? undefined);

    if (typeof iconSrc === "string") {
      return <img src={iconSrc} alt={iconName ?? "form icon"} />;
    }

    if (iconSrc) {
      const IconComponent = iconSrc;
      return <IconComponent />;
    }

    return <KeyboardArrowDownIcon />;
  };

  const EmptyState = () => (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 8,
      textAlign: "center",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      border: "1px dashed #E2E8F0",
      marginTop: 4,
    }}>
      <Box sx={{ color: "#94A3B8", mb: 2 }}>
        <SearchX size={48} strokeWidth={1.5} />
      </Box>
      <Typography sx={{ fontWeight: 700, color: "#0F172B", mb: 1, fontFamily: "Heebo" }}>
        לא נמצאו פריטים תואמים
      </Typography>
      <Typography sx={{ color: "#62748E", mb: 3, maxWidth: "320px", fontFamily: "Heebo" }}>
        נסו לשנות את מילות החיפוש או לנקות את המסננים כדי לראות עוד תוצאות.
      </Typography>
      <Button
        variant="outlined"
        onClick={clearFilters}
        sx={{
          borderColor: "#E2E8F0",
          color: "#0F172B",
          borderRadius: "4px",
          px: 3,
          fontWeight: 600,
          "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" }
        }}
      >
        ניקוי מסננים
      </Button>
    </Box>
  );

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", bgcolor: "#F8FAFC", overflow: "hidden" }}>
      <Box sx={{ display: "flex", flexDirection: "column", width: "85%", minWidth: "900px", height: "100%" }}>
        {/* Top Header - Flipped positions and improved alignment */}
        <Box sx={{ py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ color: "#0F172B", display: "flex", alignItems: "center" }}>
              <Trash2 size={24} strokeWidth={2.5} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172B", fontFamily: "Heebo, sans-serif", lineHeight: 1 }}>
              סל מחזור
            </Typography>
          </Stack>

          <IconButton
            onClick={() => navigate("/forms")}
            sx={{
              width: "50px",
              height: "50px",
              bgcolor: "#ffffff",
              borderRadius: "10px",
              color: "#1a1a24",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
              "&:hover": { bgcolor: "#ffffff", boxShadow: "0 6px 12px rgba(15, 23, 42, 0.08)" }
            }}
          >
            <LogOut size={24} strokeWidth={2.4} />
          </IconButton>
        </Box>

        {/* Scope Selector and Filters Tool Bar */}
        <Box sx={{ pt: 3, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          {/* Left Group: Search Inputs - Aligned left with icons next to text */}
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Form Search Input */}
            <Box sx={{ position: "relative", width: "192px", height: "36px" }}>
              <Box sx={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex", alignItems: "center", pointerEvents: "none" }}>
                <Search size={18} />
              </Box>
              <input
                placeholder="חיפוש טופס"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "4px",
                  border: "1px solid #E2E8F0",
                  paddingLeft: "36px",
                  paddingRight: "12px",
                  fontSize: "14px",
                  fontFamily: "Heebo, sans-serif",
                  backgroundColor: "#ffffff",
                  outline: "none",
                  textAlign: "left",
                }}
              />
            </Box>

            {/* Created By Search Input */}
            <Box sx={{ position: "relative", width: "192px", height: "36px" }}>
              <Box sx={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex", alignItems: "center", pointerEvents: "none" }}>
                <UserCircle size={18} />
              </Box>
              <input
                placeholder="נוצר ע״י"
                value={createdBySearch}
                onChange={(e) => setCreatedBySearch(e.target.value)}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "4px",
                  border: "1px solid #E2E8F0",
                  paddingLeft: "36px",
                  paddingRight: "12px",
                  fontSize: "14px",
                  fontFamily: "Heebo, sans-serif",
                  backgroundColor: "#ffffff",
                  outline: "none",
                  textAlign: "left",
                }}
              />
            </Box>

            {/* Deleted By Search Input */}
            <Box sx={{ position: "relative", width: "192px", height: "36px" }}>
              <Box sx={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex", alignItems: "center", pointerEvents: "none" }}>
                <UserCircle size={18} />
              </Box>
              <input
                placeholder="נמחק ע״י"
                value={deletedBySearch}
                onChange={(e) => setDeletedBySearch(e.target.value)}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "4px",
                  border: "1px solid #E2E8F0",
                  paddingLeft: "36px",
                  paddingRight: "12px",
                  fontSize: "14px",
                  fontFamily: "Heebo, sans-serif",
                  backgroundColor: "#ffffff",
                  outline: "none",
                  textAlign: "left",
                }}
              />
            </Box>
          </Stack>

          {/* Right Group: Sort & Scope */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: "auto", minWidth: 200 }}>
              <Select
                id="trash-tab-select"
                value={scopeParam === "responses" ? "responses" : "forms"}
                onChange={handleDropdownChange}
                IconComponent={() => null} 
                renderValue={(selected) => (
                  <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
                    {selected === "forms" ? <FileText size={18} color="#0F172B" /> : <MessageSquare size={18} color="#0F172B" />}
                    <Typography sx={{ fontWeight: 500, fontSize: "14px", color: "#0F172B", mx: 0.5 }}>
                      {selected === "forms" ? "טפסים שנמחקו" : "תגובות שנמחקו"}
                    </Typography>
                    <ChevronDown size={18} color="#0F172B" />
                  </Stack>
                )}
                sx={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "4px",
                  bgcolor: "#ffffff",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.05)",
                  "& .MuiSelect-select": {
                    py: 1,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "&:hover": {
                    bgcolor: "#f8fafc",
                    borderColor: "#cbd5e1"
                  }
                }}
              >
                <MenuItem value="forms">
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%", justifyContent: "flex-end" }}>
                    <Typography sx={{ fontWeight: 600 }}>טפסים שנמחקו</Typography>
                    <CheckSquare size={18} />
                  </Stack>
                </MenuItem>
                <MenuItem value="responses">
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%", justifyContent: "flex-end" }}>
                    <Typography sx={{ fontWeight: 600 }}>תגובות שנמחקו</Typography>
                    <MessageSquare size={18} />
                  </Stack>
                </MenuItem>
              </Select>
            </Box>

            <Box>
              <Button
                onClick={handleSortClick}
                sx={{
                  height: "40px",
                  bgcolor: "#ffffff",
                  color: "#0F172B",
                  border: "1px solid #E2E8F0",
                  borderRadius: "4px",
                  px: 2,
                  gap: 1.5,
                  fontWeight: 500,
                  fontSize: "14px",
                  textTransform: "none",
                  boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.05)",
                  "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" }
                }}
                endIcon={<ChevronDown size={18} />}
              >
                {sortOptions.find(opt => opt.sortBy === sortBy && opt.direction === sortDirection)?.label || "מיין לפי"}
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
                    border: "1px solid #E2E8F0"
                  }
                }}
              >
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
                        fontWeight: 600
                      }
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Stack>
        </Box>

        <Box className="main-page-content-wrapper deleted-forms-scroll-container" sx={{ pt: 0, flex: 1, overflowY: "auto" }} onScroll={handleScroll}>
          {activeTab === 0 ? (
            deletedForms.length > 0 ? (
              <Grid container spacing={2} columns={12}>
                {deletedForms.map((form: any) => {
                  const deletedDateObj = form.deletedAt ? new Date(form.deletedAt) : null;
                  const formattedDate = deletedDateObj ? deletedDateObj.toLocaleDateString("he-IL") : "N/A";
                  const formattedTime = deletedDateObj ? deletedDateObj.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "";
                  const isExpanded = !!expandedForms[form.id];
                  const responsesCount = form.responsesCount ?? 0;

                  return (
                    <Grid key={form.id} size={{ xs: 12 }}>
                      <Card sx={{ p: 2, border: "1px solid #E2E8F0", borderRadius: "4px", boxShadow: "none", bgcolor: "#ffffff" }}>
                        <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
                            <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}>
                              <Checkbox
                                checked={selectedFormIds.has(form.id)}
                                onChange={() => handleToggleSelectForm(form.id)}
                                sx={{
                                  p: 0,
                                  width: "16px",
                                  height: "16px",
                                  border: "1px solid #62748E",
                                  borderRadius: "4px",
                                  color: "transparent",
                                  "&.Mui-checked": { color: theme.palette.primary.main, border: "none" },
                                  "& .MuiSvgIcon-root": { fontSize: 20 }
                                }}
                              />

                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Box
                                  sx={{ 
                                    width: "36px",
                                    height: "36px",
                                    bgcolor: "rgba(25, 118, 210, 0.08)", 
                                    color: "primary.main",
                                    borderRadius: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    "& img": { width: "18px", height: "18px" },
                                    "& .MuiSvgIcon-root": { fontSize: "18px" }
                                  }}>
                                  {getIconContent(form.icon)}
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "20px", color: "#020618", textAlign: "left" }}>
                                  {form.name}
                                </Typography>
                                <Tooltip title="מזהה הטופס" arrow placement="top">
                                  <Typography component="span" sx={{ fontSize: "14px", color: "#62748E", fontWeight: 500, cursor: "help" }}>
                                    {form.id}
                                  </Typography>
                                </Tooltip>
                              </Box>
                            </Box>
                            
                            <Box sx={{ textAlign: "left", pl: 4 }}>
                              <Typography variant="body2" sx={{ color: "#62748E", fontSize: "14px", mb: 0.2 }}>
                                נוצר על ידי:{" "}
                                <Tooltip title={form.createdBy?.upn || "לא ידוע"} arrow placement="top">
                                  <Box component="span" sx={{ cursor: "help", textDecoration: "underline", textDecorationStyle: "dotted", textDecorationColor: "#cbd5e1" }}>
                                    {form.createdBy?.name || "משתמש בזן"}
                                  </Box>
                                </Tooltip>
                              </Typography>
                              <Typography variant="body2" sx={{ color: "#62748E", fontSize: "14px" }}>
                                נמחק בתאריך {formattedDate} בשעה {formattedTime} על ידי{" "}
                                <Tooltip title={form.deletedBy?.upn || "לא ידוע"} arrow placement="top">
                                  <Box component="span" sx={{ cursor: "help", textDecoration: "underline", textDecorationStyle: "dotted", textDecorationColor: "#cbd5e1" }}>
                                    {form.deletedBy?.name || "משתמש בזן"}
                                  </Box>
                                </Tooltip>
                              </Typography>
                            </Box>
                          </Box>

                          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
                            {responsesCount > 0 && (
                              <Button
                                onClick={() => toggleFormExpanded(form.id)}
                                startIcon={isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
                                sx={{ 
                                  bgcolor: "#ffffff", 
                                  color: "#0F172B",
                                  border: "1px solid #E2E8F0",
                                  borderRadius: "4px",
                                  fontWeight: 500,
                                  fontSize: "14px",
                                  height: "32px",
                                  px: 1.5,
                                  boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.05)",
                                  textTransform: "none",
                                  gap: 1,
                                  "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" }
                                }}>
                                {isExpanded ? `הסתרת תגובות (${responsesCount})` : `הצגת תגובות (${responsesCount})`}
                              </Button>
                            )}

                            <Button
                              disabled={restoringFormId === form.id}
                              onClick={() => handleRestoreFormClick(form.id)}
                              variant="contained"
                              startIcon={restoringFormId === form.id ? <CircularProgress size={14} color="inherit" /> : <RotateCcw size={16} />}
                              sx={{
                                backgroundColor: theme.palette.primary.main,
                                borderRadius: "4px",
                                fontWeight: 700,
                                fontSize: "14px",
                                height: "32px",
                                px: 1.5,
                                boxShadow: "none",
                                textTransform: "none",
                                flexShrink: 0,
                                gap: 1,
                                "&:hover": { backgroundColor: theme.palette.primary.dark, boxShadow: "none" }
                              }}>
                              שחזור טופס
                            </Button>
                          </Stack>
                        </Box>

                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ bgcolor: "rgba(241, 245, 249, 0.4)", p: 2, borderRadius: "4px", mt: 1 }}>
                            {form.responses?.length ? (
                              <Stack spacing={1}>
                                {form.responses.map((response: any) => {
                                  const createdDateObj = new Date(response.createdAt);
                                  const fCreatedDate = createdDateObj.toLocaleDateString("he-IL");
                                  const fCreatedTime = createdDateObj.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

                                  return (
                                    <Box key={response.id} sx={{ p: 2, backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid rgba(2, 6, 24, 0.05)", display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
                                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                          <MessageSquare size={18} color={theme.palette.primary.main} />
                                          <Box sx={{ textAlign: "left" }}>
                                            <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "#020618" }}>
                                              תגובה מספר {response.index}
                                            </Typography>
                                          </Box>
                                        </Stack>
                                        <Box sx={{ textAlign: "left", pl: 4.5 }}>
                                          <Typography sx={{ fontSize: "13px", color: "#62748E" }}>
                                            נוצרה בתאריך {fCreatedDate} בשעה {fCreatedTime} על ידי{" "}
                                            <Tooltip title={response.createdBy?.upn || "לא ידוע"} arrow placement="top">
                                              <Box component="span" sx={{ cursor: "help", textDecoration: "underline", textDecorationStyle: "dotted", textDecorationColor: "#cbd5e1" }}>
                                                {response.createdBy?.name || "משתמש בזן"}
                                              </Box>
                                            </Tooltip>
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Box>
                                  );
                                })}
                              </Stack>
                            ) : <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary" }}>אין תגובות שנמחקו עם הטופס</Typography>}
                          </Box>
                        </Collapse>
                      </Card>
                    </Grid>
                  );
                })}
                {isFetchingNextDeletedForms && (
                  <Grid size={{ xs: 12 }} sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <CircularProgress size={24} />
                  </Grid>
                )}
              </Grid>
            ) : isDeletedFormsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <EmptyState />
            )
          ) : (
            /* Tab 2: Deleted Responses */
            activeFormsWithDeleted.length > 0 ? (
              <Grid container spacing={2} columns={12}>
                {activeFormsWithDeleted.map((form: any) => {
                  const isExpanded = !!expandedForms[form.id];
                  const responsesCount = form.responsesCount ?? 0;

                  return (
                    <Grid key={form.id} size={{ xs: 12 }}>
                      <Card sx={{ p: 0, overflow: "hidden", border: "1px solid #E2E8F0", borderRadius: "4px", boxShadow: "none", bgcolor: "#ffffff" }}>
                        <Box 
                          sx={{ py: 2, px: 3, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} 
                          onClick={() => toggleFormExpanded(form.id)}
                        >
                          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}>
                            <Box
                              sx={{ 
                                width: "40px",
                                height: "40px",
                                bgcolor: "rgba(25, 118, 210, 0.08)", 
                                color: "primary.main",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                "& img": { width: "20px", height: "20px" },
                                "& .MuiSvgIcon-root": { fontSize: "20px" }
                              }}>
                              {getIconContent(form.icon)}
                            </Box>

                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "20px", color: "#020618", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 1.5 }}>
                              {form.name}
                              <Tooltip title="מזהה הטופס" arrow placement="top">
                                <Typography component="span" sx={{ fontSize: "16px", color: "#020618", fontWeight: 400, cursor: "help" }}>
                                  {form.id}
                                </Typography>
                              </Tooltip>
                              <Typography component="span" sx={{ fontSize: "18px", color: "#020618", fontWeight: 400 }}>
                                ←
                              </Typography>
                              <Typography component="span" sx={{ fontSize: "18px", color: "#62748E", fontWeight: 400 }}>
                                {responsesCount} תגובות
                              </Typography>
                            </Typography>
                          </Box>

                          <IconButton
                            sx={{ 
                              width: "32px",
                              height: "32px",
                              bgcolor: "#ffffff",
                              border: "1px solid #E2E8F0",
                              borderRadius: "4px",
                              color: "#0F172B",
                              boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.05)",
                              "&:hover": { bgcolor: "#f8fafc" }
                            }}>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </IconButton>
                        </Box>

                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ bgcolor: "#ffffff", borderTop: "1px solid #E2E8F0" }}>
                            {form.responses?.length ? (
                              <Stack spacing={0}>
                                {form.responses.map((response: any) => {
                                  const rDeletedDateObj = response.deletedResponse?.deletedAt ? new Date(response.deletedResponse.deletedAt) : null;
                                  const rFormattedDate = rDeletedDateObj ? rDeletedDateObj.toLocaleDateString("he-IL") : "N/A";
                                  const rFormattedTime = rDeletedDateObj ? rDeletedDateObj.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "";
                                  
                                  return (
                                    <Box key={response.id} sx={{ p: 2, borderBottom: "1px solid #E2E8F0", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
                                        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}>
                                          <Checkbox
                                            checked={selectedResponseIds.has(response.id)}
                                            onChange={() => handleToggleSelectResponse(response.id)}
                                            sx={{
                                              p: 0,
                                              width: "16px",
                                              height: "16px",
                                              border: "1px solid #62748E",
                                              borderRadius: "4px",
                                              color: "transparent",
                                              "&.Mui-checked": { color: theme.palette.primary.main, border: "none" },
                                              "& .MuiSvgIcon-root": { fontSize: 20 }
                                            }}
                                          />
                                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 1.5 }}>
                                            <MessageSquare size={24} color={theme.palette.primary.main} />
                                            <Typography variant="body1" sx={{ fontWeight: 600, color: "#0F172B", fontSize: "16px", textAlign: "left" }}>
                                              תגובה מספר {response.index}
                                            </Typography>
                                          </Box>
                                        </Box>
                                        
                                        <Box sx={{ textAlign: "left", pl: 4 }}>
                                          <Typography variant="body2" sx={{ color: "#62748E", fontSize: "14px", mb: 0.5 }}>
                                            נוצר על ידי:{" "}
                                            <Tooltip title={response.createdBy?.upn || "לא ידוע"} arrow placement="top">
                                              <Box component="span" sx={{ cursor: "help", textDecoration: "underline", textDecorationStyle: "dotted", textDecorationColor: "#cbd5e1" }}>
                                                {response.createdBy?.name || "משתמש בזן"}
                                              </Box>
                                            </Tooltip>
                                          </Typography>
                                          <Typography variant="body2" sx={{ color: "#62748E", fontSize: "14px" }}>
                                            נמחק בתאריך {rFormattedDate} בשעה {rFormattedTime} על ידי{" "}
                                            <Tooltip title={response.deletedResponse?.deletedBy?.upn || "לא ידוע"} arrow placement="top">
                                              <Box component="span" sx={{ cursor: "help", textDecoration: "underline", textDecorationStyle: "dotted", textDecorationColor: "#cbd5e1" }}>
                                                {response.deletedResponse?.deletedBy?.name || "משתמש בזן"}
                                              </Box>
                                            </Tooltip>
                                          </Typography>
                                        </Box>
                                      </Box>

                                      <Button
                                        disabled={restoringResponseId === response.id}
                                        onClick={() => handleRestoreResponseClick(form.id, response.id)}
                                        variant="contained"
                                        startIcon={restoringResponseId === response.id ? <CircularProgress size={16} color="inherit" /> : <RotateCcw size={16} />}
                                        sx={{ 
                                          bgcolor: "primary.main", 
                                          borderRadius: "4px", 
                                          fontWeight: 500, 
                                          height: "32px",
                                          px: 1.5, 
                                          gap: 1,
                                          fontSize: "14px",
                                          textTransform: "none",
                                          boxShadow: "none",
                                          flexShrink: 0,
                                          "&:hover": { bgcolor: "primary.dark", boxShadow: "none" }
                                        }}>
                                        שחזור תגובה לטופס
                                      </Button>
                                    </Box>
                                  );
                                })}
                              </Stack>
                            ) : <Typography variant="body2" sx={{ textAlign: "center", py: 2, color: "text.secondary" }}>אין תגובות שנמחקו</Typography>}
                          </Box>
                        </Collapse>
                      </Card>
                    </Grid>
                  );
                })}
                {isFetchingNextActiveForms && (
                  <Grid size={{ xs: 12 }} sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <CircularProgress size={24} />
                  </Grid>
                )}
              </Grid>
            ) : isActiveFormsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <EmptyState />
            )
          )}
        </Box>

        {/* Floating Selection Bar */}
        {(selectedFormIds.size > 0 || selectedResponseIds.size > 0) && (
          <Box
            sx={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              width: "auto",
              minWidth: 500,
              bgcolor: "#F1F5F9",
              border: "1px solid #E2E8F0",
              borderRadius: "4px",
              p: 1.5,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
              zIndex: 1000,
            }}
          >
            <Typography sx={{ color: "#020618", fontWeight: 500, fontSize: "14px", mr: 4 }}>
              {activeTab === 0 ? selectedFormIds.size : selectedResponseIds.size} פריטים נבחרו
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="text"
                onClick={() => {
                  setSelectedFormIds(new Set());
                  setSelectedResponseIds(new Set());
                }}
                startIcon={<XCircle size={18} />}
                sx={{
                  bgcolor: "#ffffff",
                  color: "#0F172B",
                  border: "1px solid #E2E8F0",
                  borderRadius: "4px",
                  height: "32px",
                  fontWeight: 500,
                  fontSize: "14px",
                  textTransform: "none",
                  gap: 1,
                  boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.05)",
                  "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" }
                }}
              >
                ביטול בחירה
              </Button>

              <Button
                variant="contained"
                disabled={isBulkRestoring}
                onClick={handleBulkRestore}
                startIcon={isBulkRestoring ? <CircularProgress size={18} color="inherit" /> : <RotateCcw size={18} />}
                sx={{
                  bgcolor: "primary.main",
                  borderRadius: "4px",
                  height: "32px",
                  fontWeight: 500,
                  fontSize: "14px",
                  textTransform: "none",
                  gap: 1,
                  "&:hover": { bgcolor: "primary.dark" }
                }}
              >
                שחזור {activeTab === 0 ? "טפסים" : "תגובות"}
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default DeletedForms;
