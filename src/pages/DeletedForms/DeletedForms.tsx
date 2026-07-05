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
} from "@mui/material";
import { styled } from "@mui/material/styles";
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
} from "lucide-react";
import { useGetDeletedForms, useGetSoftDeletedResponsesGlobal, restoreForm } from "../../api/formsApi";
import { restoreResponse, restoreResponses } from "../../api/responsesApi";
import { StyledCard, FormIconWrapper } from "../../components/FormCard/styled";
import { CustomIcon } from "../../theme/icons";
import { getFormIconByName } from "../../utils/utils";
import { DeletedFormOverviewDto, FormOverviewDto } from "../../types/shared";
import queryClient from "../../api/queryClient";
import { IOrderBy } from "../../types/enums/filtersAndSorts.enum";
import { Filter } from "../../utils/interfaces";

const StyledFormControl = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: 220,
  position: "relative",
}));

const SearchInput = styled("input")(({ theme }) => ({
  width: "100%",
  height: "36px",
  borderRadius: "4px",
  border: "1px solid #E2E8F0",
  paddingRight: "40px",
  paddingLeft: "12px",
  fontSize: "14px",
  fontFamily: "Heebo, sans-serif",
  "&:focus": {
    outline: "none",
    borderColor: theme.palette.primary.main,
  },
  "&::placeholder": {
    color: "#94A3B8",
  },
}));

type DeletedFormWithResponses = (DeletedFormOverviewDto | FormOverviewDto) & {
  responses?: any[];
};

/**
 * Main Trash Page displaying soft-deleted forms and responses in tabs.
 *
 * Tab 1: Deleted Forms - Hierarchical view of forms and responses deleted with them.
 * Tab 2: Deleted Responses - Hierarchical view of active forms and their individually deleted responses.
 */
function DeletedForms({ user }: { user: any }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const [searchParams, setSearchParams] = useSearchParams();
  const scopeParam = searchParams.get("scope") || "forms";
  const activeTab = scopeParam === "responses" ? 1 : 0;

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

  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("deleted_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch Deleted Forms (Tab 1) via React Query
  const {
    data: deletedFormsData,
    isLoading: isDeletedFormsLoading,
    fetchNextPage: fetchNextDeletedForms,
    hasNextPage: hasNextDeletedForms,
    isFetchingNextPage: isFetchingNextDeletedForms,
  } = useGetDeletedForms({
    query: searchTerm || undefined,
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
    query: searchTerm || undefined,
    sortBy: sortBy === "deleted_at" ? "created_at" : sortBy,
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
    setSearchParams({ scope: event.target.value }, { replace: true });
    setExpandedForms({}); // Reset expansion state when switching tabs
    setSelectedFormIds(new Set()); // Clear selections when switching tabs
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
        // Bulk restore forms
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
        // Bulk restore responses
        // Group by formId
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", bgcolor: "#F8FAFC", minHeight: "100%" }}>
      {/* Top Header - Restored to Previous State (Title Right, Exit Left) */}
      <Box sx={{ px: 4, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#F8FAFC" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ color: "#0F172B" }}>
            <Trash2 size={24} strokeWidth={2.5} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172B", fontFamily: "Heebo, sans-serif" }}>
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

      {/* Scope Selector / Tabs - Aligned Left for LTR Flow */}
      <Box sx={{ px: 4, pt: 3, pb: 1, display: "flex", justifyContent: "flex-start" }}>
        <Box sx={{ width: "auto", minWidth: 200 }}>
          <Select
            id="trash-tab-select"
            value={scopeParam === "responses" ? "responses" : "forms"}
            onChange={handleDropdownChange}
            IconComponent={() => null} // Hide default icon
            renderValue={(selected) => (
              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
                <ChevronDown size={18} color="#0F172B" />
                <Typography sx={{ fontWeight: 500, fontSize: "14px", color: "#0F172B", mx: 0.5 }}>
                  {selected === "forms" ? "טפסים שנמחקו" : "תגובות שנמחקו"}
                </Typography>
                {selected === "forms" ? <FileText size={18} color="#0F172B" /> : <MessageSquare size={18} color="#0F172B" />}
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
      </Box>

      <Box className="main-page-content-wrapper" sx={{ px: 4, pt: 2, flex: 1, overflowY: "auto" }} onScroll={handleScroll}>
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
                      {/* Form Header - Left to Right Visual Flow */}
                      <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                        {/* Content & Identity on Left */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
                          {/* Row 1: Checkbox + [Icon] [Name] [ID] */}
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
                          
                          {/* Row 2: Metadata (Aligned with text after checkbox) */}
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

                        {/* Actions on Right */}
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
                                      {/* Response Header: [Icon] [Title] */}
                                      <Stack direction="row" spacing={2} alignItems="center">
                                        <MessageSquare size={18} color={theme.palette.primary.main} />
                                        <Box sx={{ textAlign: "left" }}>
                                          <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "#020618" }}>
                                            תגובה מספר {response.index}
                                          </Typography>
                                        </Box>
                                      </Stack>
                                      {/* Response Metadata: Below Title, Left Aligned */}
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
            <Typography variant="h6" sx={{ textAlign: "center", mt: 10, color: "text.secondary" }}>לא נמצאו טפסים שנמחקו</Typography>
          )
        ) : (
          /* Tab 2: Deleted Responses - Left to Right Visual Flow */
          activeFormsWithDeleted.length > 0 ? (
            <Grid container spacing={2} columns={12}>
              {activeFormsWithDeleted.map((form: any) => {
                const isExpanded = !!expandedForms[form.id];
                const responsesCount = form.responsesCount ?? 0;

                return (
                  <Grid key={form.id} size={{ xs: 12 }}>
                    <Card sx={{ p: 0, overflow: "hidden", border: "1px solid #E2E8F0", borderRadius: "4px", boxShadow: "none", bgcolor: "#ffffff" }}>
                      {/* Active Form Header - Left to Right Visual Flow */}
                      <Box 
                        sx={{ py: 2, px: 3, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} 
                        onClick={() => toggleFormExpanded(form.id)}
                      >
                        {/* Identity on Left: [Icon] [Name] [ID] [Arrow] [Count] */}
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

                        {/* Expand Trigger on Right */}
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
                                
                                const createdDateObj = new Date(response.createdAt);
                                const fCreatedDate = createdDateObj.toLocaleDateString("he-IL");
                                const fCreatedTime = createdDateObj.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

                                return (
                                  <Box key={response.id} sx={{ p: 2, borderBottom: "1px solid #E2E8F0", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    {/* Identity & Metadata on Left */}
                                    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start", flex: 1 }}>
                                      <Checkbox
                                        checked={selectedResponseIds.has(response.id)}
                                        onChange={() => handleToggleSelectResponse(response.id)}
                                        sx={{
                                          p: 0,
                                          mt: 0.6,
                                          width: "16px",
                                          height: "16px",
                                          border: "1px solid #62748E",
                                          borderRadius: "4px",
                                          color: "transparent",
                                          mr: 2,
                                          "&.Mui-checked": { color: theme.palette.primary.main, border: "none" },
                                          "& .MuiSvgIcon-root": { fontSize: 20 }
                                        }}
                                      />
                                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
                                        {/* Line 1: [Icon] [Title] */}
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 1.5 }}>
                                          <MessageSquare size={24} color={theme.palette.primary.main} />
                                          <Typography variant="body1" sx={{ fontWeight: 600, color: "#0F172B", fontSize: "16px", textAlign: "left" }}>
                                            תגובה מספר {response.index}
                                          </Typography>
                                        </Box>
                                        {/* Line 2: Metadata (Left Aligned) */}
                                        <Box sx={{ textAlign: "left" }}>
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
                                    </Box>

                                    {/* Action on Right */}
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
            <Typography variant="h6" sx={{ textAlign: "center", mt: 10, color: "text.secondary" }}>לא נמצאו תגובות שנמחקו</Typography>
          )
        )}
      </Box>

      {/* Floating Selection Bar - Left to Right Visual Flow */}
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
          {/* Count on Left */}
          <Typography sx={{ color: "#020618", fontWeight: 500, fontSize: "14px", mr: 4 }}>
            {activeTab === 0 ? selectedFormIds.size : selectedResponseIds.size} פריטים נבחרו
          </Typography>

          {/* Buttons on Right */}
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
  );
}

export default DeletedForms;
