import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Box,
  Button,
  Grid,
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ArrowBack as ArrowBackIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import { Eye, MessageSquare, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { getDeletedForms, getSoftDeletedResponsesGlobal, restoreForm } from "../../api/formsApi";
import { restoreResponse } from "../../api/responsesApi";
import { StyledCard, FormIconWrapper } from "../../components/FormCard/styled";
import { CustomIcon } from "../../theme/icons";
import { getFormIconByName } from "../../utils/utils";
import { DeletedFormOverviewDto, FormOverviewDto } from "../../types/shared";

const StyledFormControl = styled(Box)(({ theme }) => ({
  width: 220,
  position: "relative",
}));

const StyledSelect = styled(Select<string>)(({ theme }) => ({
  width: "100%",
  borderRadius: 12,
  height: 44,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(2, 6, 24, 0.1)",
    borderWidth: 1,
  },

  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(2, 6, 24, 0.2)",
  },

  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#020618",
    borderWidth: 2,
  },

  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: 600,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: "36px !important",
    paddingLeft: "12px !important",
    fontFamily: "Heebo, sans-serif",
  },

  "& .MuiSelect-icon": {
    right: "10px",
    left: "auto",
    fontSize: "24px",
    color: "#020618",
  },
}));

const MynaUiUndoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M7 10L3 14L7 18" />
    <path d="M3 14H15C18.3137 14 21 11.3137 21 8C21 4.68629 18.3137 2 15 2" />
  </svg>
);

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

  // Tab 1 state
  const [deletedForms, setDeletedForms] = useState<DeletedFormWithResponses[]>([]);
  const [isDeletedFormsLoading, setIsDeletedFormsLoading] = useState<boolean>(false);
  const [deletedFormsPage, setDeletedFormsPage] = useState<number>(1);
  const [deletedFormsHasNext, setDeletedFormsHasNext] = useState<boolean>(false);

  // Tab 2 state
  const [activeFormsWithDeleted, setActiveFormsWithDeleted] = useState<DeletedFormWithResponses[]>([]);
  const [isActiveFormsLoading, setIsActiveFormsLoading] = useState<boolean>(false);
  const [activeFormsPage, setActiveFormsPage] = useState<number>(1);
  const [activeFormsHasNext, setActiveFormsHasNext] = useState<boolean>(false);

  const [expandedForms, setExpandedForms] = useState<Record<number, boolean>>({});

  const pageSize = 20;

  // Fetch Deleted Forms (Tab 1)
  useEffect(() => {
    async function loadDeletedForms() {
      if (activeTab !== 0) return;
      setIsDeletedFormsLoading(true);

      try {
        const result = await getDeletedForms({
          pageSize: pageSize + 1,
          pageNumber: deletedFormsPage,
        });

        const items = result || [];
        const hasNext = items.length > pageSize;
        const pageItems = hasNext ? items.slice(0, pageSize) : items;

        setDeletedForms((prev) => (deletedFormsPage === 1 ? (pageItems as DeletedFormWithResponses[]) : [...prev, ...(pageItems as DeletedFormWithResponses[])]));
        setDeletedFormsHasNext(hasNext);
      } catch (error) {
        toast.error("טעינת הטפסים שנמחקו נכשלה");
      } finally {
        setIsDeletedFormsLoading(false);
      }
    }

    loadDeletedForms();
  }, [deletedFormsPage, activeTab]);

  // Fetch Active Forms with Deleted Responses (Tab 2)
  useEffect(() => {
    async function loadActiveForms() {
      if (activeTab !== 1) return;
      setIsActiveFormsLoading(true);

      try {
        const result = await getSoftDeletedResponsesGlobal({
          pageSize: pageSize + 1,
          pageNumber: activeFormsPage,
        });

        const items = result || [];
        const hasNext = items.length > pageSize;
        const pageItems = hasNext ? items.slice(0, pageSize) : items;

        setActiveFormsWithDeleted((prev) => (activeFormsPage === 1 ? (pageItems as DeletedFormWithResponses[]) : [...prev, ...(pageItems as DeletedFormWithResponses[])]));
        setActiveFormsHasNext(hasNext);
      } catch (error) {
        toast.error("טעינת הטפסים עם תגובות שנמחקו נכשלה");
      } finally {
        setIsActiveFormsLoading(false);
      }
    }

    loadActiveForms();
  }, [activeFormsPage, activeTab]);

  const toggleFormExpanded = (formId: number) => {
    setExpandedForms((prev) => ({
      ...prev,
      [formId]: !prev[formId],
    }));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (activeTab === 0 && deletedFormsHasNext && !isDeletedFormsLoading) {
        setDeletedFormsPage((prev) => prev + 1);
      } else if (activeTab === 1 && activeFormsHasNext && !isActiveFormsLoading) {
        setActiveFormsPage((prev) => prev + 1);
      }
    }
  };

  const handleDropdownChange = (event: SelectChangeEvent<string>) => {
    setSearchParams({ scope: event.target.value }, { replace: true });
    setExpandedForms({}); // Reset expansion state when switching tabs
  };

  const handleRestoreFormClick = async (formId: number) => {
    setRestoringFormId(formId);
    try {
      await restoreForm(formId);
      toast.success("הטופס שוחזר בהצלחה");
      setDeletedForms((prev) => prev.filter((form) => form.id !== formId));
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

      const setList = activeTab === 0 ? setDeletedForms : setActiveFormsWithDeleted;
      setList((prev) => prev.map(f => {
        if (f.id === formId && f.responses) {
          return { ...f, responses: f.responses.filter((r: any) => r.id !== responseId) };
        }
        return f;
      }));
    } catch (error) {
      toast.error("שחזור התגובה נכשל");
    } finally {
      setRestoringResponseId(null);
    }
  };

  const getIcon = (iconName: string | null, size: number = 24) => {
    const iconSrc = getFormIconByName(iconName ?? undefined);

    if (typeof iconSrc === "string") {
      return (
        <FormIconWrapper sx={{ width: size + 16, height: size + 16 }}>
          <img src={iconSrc} alt={iconName ?? "form icon"} style={{ width: size, height: size }} />
        </FormIconWrapper>
      );
    }

    if (iconSrc) {
      const IconComponent = iconSrc;
      return (
        <FormIconWrapper sx={{ width: size + 16, height: size + 16 }}>
          <IconComponent sx={{ color: "#020618", fontSize: size }} />
        </FormIconWrapper>
      );
    }

    return (
      <FormIconWrapper sx={{ width: size + 16, height: size + 16 }}>
        <KeyboardArrowDownIcon sx={{ color: "#020618", fontSize: size }} />
      </FormIconWrapper>
    );
  };

  return (
    <Box className="main-page-container">
      <Box
        className="tabs-and-select-div"
        sx={{
          px: 4,
          pt: 4,
          pb: 1,
          mt: 3,
          borderBottom: "1px solid rgba(2, 6, 24, 0.05)",
          backgroundColor: "#ffffff",
          borderRadius: "20px 20px 0 0",
        }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "#000000",
                  flexShrink: 0,
                }}>
                <Trash2 size={28} strokeWidth={2.4} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.7rem",
                  fontFamily: "Heebo, sans-serif",
                  color: "#020618",
                }}>
                סל המיחזור
              </Typography>
            </Box>

            <StyledFormControl>
              <StyledSelect
                id="trash-tab-select"
                value={scopeParam === "responses" ? "responses" : "forms"}
                onChange={handleDropdownChange}
                IconComponent={KeyboardArrowDownIcon}>
                <MenuItem
                  value="forms"
                  sx={{ fontSize: "16px", fontWeight: 600, fontFamily: "Heebo, sans-serif" }}>
                  טפסים שנמחקו
                </MenuItem>
                <MenuItem
                  value="responses"
                  sx={{ fontSize: "16px", fontWeight: 600, fontFamily: "Heebo, sans-serif" }}>
                  תגובות שנמחקו
                </MenuItem>
              </StyledSelect>
            </StyledFormControl>
          </Stack>

          <Tooltip title="חזרה" arrow placement="top">
            <Button onClick={() => navigate("/forms")} variant="customIcon">
              <CustomIcon iconName="arrowBack" forcePointer />
            </Button>
          </Tooltip>
        </Stack>
      </Box>

      <Box className="main-page-content-wrapper" sx={{ px: 4, pt: 3, overflowY: "auto" }} onScroll={handleScroll}>
        {activeTab === 0 ? (
          deletedForms.length > 0 ? (
            <Grid container spacing={2} columns={12}>
              {deletedForms.map((form: any) => {
                const deletedDateObj = form.deletedAt ? new Date(form.deletedAt) : null;
                const formattedDate = deletedDateObj ? deletedDateObj.toLocaleDateString("he-IL") : "N/A";
                const formattedTime = deletedDateObj ? deletedDateObj.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) : "";
                
                const isExpanded = !!expandedForms[form.id];
                const responsesCount = form.responsesCount ?? 0;

                return (
                  <Grid key={form.id} size={{ xs: 12 }}>
                    <StyledCard sx={{ minHeight: "auto", p: 0, overflow: "hidden" }}>
                      <Box sx={{ py: 2.5, px: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Stack direction="row" spacing={2.5} alignItems="center">
                          {getIcon(form.icon, 28)}
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#020618", mb: 0.2 }}>
                              {form.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#62748E", fontWeight: 500 }}>
                              נוצר על ידי {form.createdBy?.name || "משתמש בזן"}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#62748E" }}>
                              נמחק ב-{formattedDate} בשעה {formattedTime} על ידי {form.deletedBy?.name || "משתמש בזן"}
                            </Typography>
                          </Box>
                        </Stack>
                        
                        <Stack direction="row" spacing={2}>
                          {responsesCount > 0 && (
                            <Button
                              variant="outlined"
                              onClick={() => toggleFormExpanded(form.id)}
                              startIcon={<Eye size={18} />}
                              sx={{
                                borderRadius: "10px",
                                fontWeight: 600,
                                px: 2.5,
                                color: "#020618",
                                borderColor: "rgba(2, 6, 24, 0.1)",
                                "&:hover": { backgroundColor: "rgba(2, 6, 24, 0.04)", borderColor: "rgba(2, 6, 24, 0.2)" }
                              }}>
                              צפייה בתגובות ({responsesCount})
                            </Button>
                          )}
                          <Button
                            disabled={restoringFormId === form.id}
                            onClick={() => handleRestoreFormClick(form.id)}
                            variant="contained"
                            sx={{
                              backgroundColor: theme.palette.primary.main,
                              borderRadius: "10px",
                              fontWeight: 600,
                              px: 3,
                              gap: 1
                            }}>
                            {restoringFormId === form.id ? <CircularProgress size={20} color="inherit" /> : <MynaUiUndoIcon />}
                            שחזור טופס
                          </Button>
                        </Stack>
                      </Box>

                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Divider sx={{ mx: 3 }} />
                        <Box sx={{ p: 3, backgroundColor: "rgba(241, 245, 249, 0.4)" }}>
                          {form.responses?.length ? (
                            <Stack spacing={1.5}>
                              {form.responses.map((response: any) => (
                                <Box key={response.id} sx={{ p: 2, backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid rgba(2, 6, 24, 0.05)", boxShadow: "0px 1px 3px rgba(0,0,0,0.02)" }}>
                                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                                    <MessageSquare size={18} color={theme.palette.primary.main} />
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: "#020618" }}>
                                      תגובה מספר {response.index}
                                    </Typography>
                                  </Stack>
                                  <Typography variant="body2" sx={{ color: "#62748E", mr: 4.5 }}>
                                    נוצר על ידי {response.createdBy?.name || "משתמש בזן"}, בתאריך {new Date(response.createdAt).toLocaleDateString("he-IL")}
                                  </Typography>
                                </Box>
                              ))}
                            </Stack>
                          ) : <Typography variant="body2" sx={{ textAlign: "center", py: 1, color: "text.secondary" }}>אין תגובות שנמחקו עם הטופס</Typography>}
                        </Box>
                      </Collapse>
                    </StyledCard>
                  </Grid>
                );
              })}
            </Grid>
          ) : isDeletedFormsLoading ? (
            <Box className="main-page-loading" sx={{ py: 8 }} />
          ) : (
            <Typography variant="h6" sx={{ textAlign: "center", mt: 10, color: "text.secondary" }}>לא נמצאו טפסים שנמחקו</Typography>
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
                    <StyledCard sx={{ minHeight: "auto", p: 0, overflow: "hidden" }}>
                      <Box sx={{ py: 2, px: 3, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => toggleFormExpanded(form.id)}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          {getIcon(form.icon, 24)}
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#020618", display: "flex", alignItems: "center", gap: 1 }}>
                              {form.name}
                              <Typography component="span" sx={{ fontSize: "0.85rem", color: "#62748E", fontWeight: 500, bgcolor: "#f1f5f9", px: 1, py: 0.2, borderRadius: "6px" }}>
                                #{form.id}
                              </Typography>
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                              {responsesCount} תגובות שנמחקו
                            </Typography>
                          </Box>
                        </Stack>
                        <IconButton size="small" sx={{ color: "#020618" }}>
                          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </IconButton>
                      </Box>

                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Divider sx={{ mx: 3 }} />
                        <Box sx={{ p: 3, backgroundColor: "rgba(241, 245, 249, 0.4)" }}>
                          {form.responses?.length ? (
                            <Stack spacing={1.5}>
                              {form.responses.map((response: any) => {
                                const rDeletedDateObj = response.deletedResponse?.deletedAt ? new Date(response.deletedResponse.deletedAt) : null;
                                const rFormattedDate = rDeletedDateObj ? rDeletedDateObj.toLocaleDateString("he-IL") : "N/A";
                                const rFormattedTime = rDeletedDateObj ? rDeletedDateObj.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) : "";

                                return (
                                  <Box key={response.id} sx={{ p: 2.5, backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid rgba(2, 6, 24, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Box>
                                      <Typography variant="body1" sx={{ fontWeight: 700, color: "#020618", mb: 0.5 }}>
                                        תגובה מספר {response.index}
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: "#62748E", fontWeight: 500 }}>
                                        נוצר על ידי {response.createdBy?.name || "משתמש בזן"}
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: "#62748E" }}>
                                        נמחק ב-{rFormattedDate} בשעה {rFormattedTime} על ידי {response.deletedResponse?.deletedBy?.name || "משתמש בזן"}
                                      </Typography>
                                    </Box>
                                    <Button
                                      disabled={restoringResponseId === response.id}
                                      onClick={() => handleRestoreResponseClick(form.id, response.id)}
                                      variant="outlined"
                                      sx={{ borderRadius: "10px", fontWeight: 700, px: 2.5, gap: 1 }}>
                                      {restoringResponseId === response.id ? <CircularProgress size={16} color="inherit" /> : <MynaUiUndoIcon style={{ width: 16, height: 16 }} />}
                                      שחזור תגובה לטופס
                                    </Button>
                                  </Box>
                                );
                              })}
                            </Stack>
                          ) : <Typography variant="body2" sx={{ textAlign: "center", py: 1, color: "text.secondary" }}>אין תגובות שנמחקו</Typography>}
                        </Box>
                      </Collapse>
                    </StyledCard>
                  </Grid>
                );
              })}
            </Grid>
          ) : isActiveFormsLoading ? (
            <Box className="main-page-loading" sx={{ py: 8 }} />
          ) : (
            <Typography variant="h6" sx={{ textAlign: "center", mt: 10, color: "text.secondary" }}>לא נמצאו תגובות שנמחקו</Typography>
          )
        )}
      </Box>
    </Box>
  );
}

export default DeletedForms;
