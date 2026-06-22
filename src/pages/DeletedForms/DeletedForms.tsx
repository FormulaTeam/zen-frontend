import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Box, Button, Grid, Tab, Tabs, Typography, useTheme, Stack } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { getDeletedForms, restoreForm } from "../../api/formsApi";
import { getSoftDeletedResponsesGlobal, restoreResponse } from "../../api/responsesApi";
import { StyledCard } from "../../components/FormCard/styled";

/**
 * Main Trash Page displaying soft-deleted forms and responses in tabs.
 * Uses infinite scroll pagination and displays items as list rows (lines).
 * Responses are categorized by parent form.
 *
 * @param props - Component properties containing user information.
 */
function DeletedForms({ user }: { user: any }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState<number>(0);

  // Soft-deleted forms state
  const [forms, setForms] = useState<any[]>([]);
  const [isFormsLoading, setIsFormsLoading] = useState<boolean>(false);
  const [formsPage, setFormsPage] = useState<number>(1);
  const [formsHasNext, setFormsHasNext] = useState<boolean>(false);

  // Soft-deleted responses state
  const [responses, setResponses] = useState<any[]>([]);
  const [isResponsesLoading, setIsResponsesLoading] = useState<boolean>(false);
  const [responsesPage, setResponsesPage] = useState<number>(1);
  const [responsesHasNext, setResponsesHasNext] = useState<boolean>(false);

  const pageSize = 20;

  // Infinite scroll forms fetch
  useEffect(() => {
    async function loadDeletedForms() {
      if (activeTab !== 0) {
        return;
      }

      setIsFormsLoading(true);

      try {
        const deletedFormsResult = await getDeletedForms({
          pageSize: pageSize + 1,
          pageNumber: formsPage,
        });

        const items = deletedFormsResult || [];
        const hasNext = items.length > pageSize;
        const pageItems = hasNext ? items.slice(0, pageSize) : items;

        setForms((prevForms) => (formsPage === 1 ? pageItems : [...prevForms, ...pageItems]));
        setFormsHasNext(hasNext);
      } catch (error) {
        toast.error("טעינת הטפסים שנמחקו נכשלה");
      } finally {
        setIsFormsLoading(false);
      }
    }

    loadDeletedForms();
  }, [formsPage, activeTab]);

  // Infinite scroll responses fetch
  useEffect(() => {
    async function loadDeletedResponses() {
      if (activeTab !== 1) {
        return;
      }

      setIsResponsesLoading(true);

      try {
        const deletedResponsesResult = await getSoftDeletedResponsesGlobal({
          pageSize: pageSize + 1,
          pageNumber: responsesPage,
        });

        const items = deletedResponsesResult || [];
        const hasNext = items.length > pageSize;
        const pageItems = hasNext ? items.slice(0, pageSize) : items;

        setResponses((prevResponses) =>
          responsesPage === 1 ? pageItems : [...prevResponses, ...pageItems],
        );
        setResponsesHasNext(hasNext);
      } catch (error) {
        toast.error("טעינת התגובות שנמחקו נכשלה");
      } finally {
        setIsResponsesLoading(false);
      }
    }

    loadDeletedResponses();
  }, [responsesPage, activeTab]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (activeTab === 0 && formsHasNext && !isFormsLoading) {
        setFormsPage((prevPage) => prevPage + 1);
      } else if (activeTab === 1 && responsesHasNext && !isResponsesLoading) {
        setResponsesPage((prevPage) => prevPage + 1);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRestoreFormClick = async (formId: number) => {
    try {
      await restoreForm(formId);
      toast.success("הטופס שוחזר בהצלחה");

      setForms((prevForms) => prevForms.filter((form) => form.id !== formId));
    } catch (error) {
      toast.error("שחזור הטופס נכשל");
    }
  };

  const handleRestoreResponseClick = async (formId: number, responseId: string) => {
    try {
      await restoreResponse(formId, responseId);
      toast.success("התגובה שוחזרה בהצלחה");

      setResponses((prevResponses) => prevResponses.filter((item) => item.id !== responseId));
    } catch (error) {
      toast.error("שחזור התגובה נכשל");
    }
  };

  // Group responses by parent form name/id
  const groupedResponses = responses.reduce(
    (acc: Record<string, { formName: string; formId: number; items: any[] }>, response: any) => {
      const formId = response.formId;
      const formName = response.form?.name || "טופס ללא שם";

      if (!acc[formId]) {
        acc[formId] = {
          formName,
          formId,
          items: [],
        };
      }

      acc[formId].items.push(response);
      return acc;
    },
    {},
  );

  return (
    <Box className="main-page-container">
      <Box className="tabs-and-select-div" sx={{ py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#020618" }}>
            סל המיחזור
          </Typography>

          <Button
            onClick={() => navigate("/forms")}
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{
              borderColor: "rgba(2, 6, 24, 0.15)",
              color: "#020618",
              textTransform: "none",
              borderRadius: "10px",
              fontFamily: "Heebo, sans-serif",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "rgba(2, 6, 24, 0.04)",
                borderColor: "rgba(2, 6, 24, 0.25)",
              },
            }}>
            חזרה לטפסים שלי
          </Button>
        </Stack>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            mt: 2,
            borderBottom: "1px solid rgba(2, 6, 24, 0.08)",
            "& .MuiTabs-indicator": {
              backgroundColor: theme.palette.primary.main,
            },
            "& .MuiTab-root": {
              fontFamily: "Heebo, sans-serif",
              fontWeight: 500,
              fontSize: "1rem",
              color: "#62748E",
              "&.Mui-selected": {
                color: theme.palette.primary.main,
              },
            },
          }}>
          <Tab label="טפסים שנמחקו" />
          <Tab label="תגובות שנמחקו" />
        </Tabs>
      </Box>

      <Box className="main-page-content-wrapper" sx={{ px: 4, pt: 2 }}>
        {activeTab === 0 ? (
          forms.length > 0 ? (
            <>
              <Grid container className="forms-grid" onScroll={handleScroll} spacing={2} columns={12}>
                {forms.map((form: any) => {
                  const deletedDateObj = form.deletedAt ? new Date(form.deletedAt) : null;
                  const formattedDate = deletedDateObj
                    ? deletedDateObj.toLocaleDateString("he-IL")
                    : "N/A";

                  return (
                    <Grid key={form.id} size={{ xs: 12 }}>
                      <StyledCard
                        sx={{
                          minHeight: "auto",
                          py: 2,
                          px: 3,
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}>
                        <Stack direction="row" spacing={4} alignItems="center" sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              fontFamily: "Heebo, sans-serif",
                              color: "#020618",
                              minWidth: "250px",
                            }}>
                            {form.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#62748E",
                              fontFamily: "Heebo, sans-serif",
                              display: "flex",
                              gap: 1,
                            }}>
                            נמחק ב:
                            <span style={{ color: "#020618", fontWeight: 500 }}>
                              {formattedDate}
                            </span>
                          </Typography>
                        </Stack>
                        <Button
                          onClick={() => handleRestoreFormClick(form.id)}
                          variant="contained"
                          sx={{
                            backgroundColor: theme.palette.primary.main,
                            color: "white",
                            borderRadius: "10px",
                            px: 4,
                            py: 0.75,
                            fontFamily: "Heebo, sans-serif",
                            fontWeight: 500,
                            minWidth: "120px",
                            "&:hover": {
                              backgroundColor: theme.palette.primary.dark,
                            },
                          }}>
                          שחזור
                        </Button>
                      </StyledCard>
                    </Grid>
                  );
                })}
              </Grid>

              {isFormsLoading && (
                <Box className="main-page-loading" sx={{ py: 4 }}>
                  <Typography sx={{ color: "text.secondary", fontFamily: "Heebo, sans-serif" }}>
                    טוען עוד טפסים...
                  </Typography>
                </Box>
              )}
            </>
          ) : isFormsLoading ? (
            <Box className="main-page-loading" sx={{ py: 8 }}>
              <Typography sx={{ color: "text.secondary", fontFamily: "Heebo, sans-serif" }}>
                טוען טפסים...
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
              }}>
              <Typography
                variant="h6"
                sx={{ color: "text.secondary", fontFamily: "Heebo, sans-serif", mb: 1 }}>
                סל המיחזור ריק
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontFamily: "Heebo, sans-serif" }}>
                לא נמצאו טפסים שנמחקו.
              </Typography>
            </Box>
          )
        ) : responses.length > 0 ? (
          <Box className="forms-grid" onScroll={handleScroll} sx={{ margin: 0, padding: 0 }}>
            {Object.values(groupedResponses).map((group: any) => (
              <Box key={group.formId} sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#62748E",
                    mb: 1.5,
                    fontFamily: "Heebo, sans-serif",
                    borderBottom: "2px solid rgba(2, 6, 24, 0.05)",
                    pb: 1,
                  }}>
                  {group.formName} ({group.items.length})
                </Typography>

                <Grid container spacing={1.5} columns={12}>
                  {group.items.map((item: any) => {
                    const deletedDateObj = item.deletedResponse?.deletedAt
                      ? new Date(item.deletedResponse.deletedAt)
                      : null;
                    const formattedDate = deletedDateObj
                      ? deletedDateObj.toLocaleDateString("he-IL")
                      : "N/A";

                    return (
                      <Grid key={item.id} size={{ xs: 12 }}>
                        <StyledCard
                          sx={{
                            minHeight: "auto",
                            py: 1.5,
                            px: 3,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}>
                          <Stack direction="row" spacing={4} alignItems="center" sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                fontFamily: "Heebo, sans-serif",
                                color: "#020618",
                                minWidth: "150px",
                              }}>
                              תגובה #{item.index}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#62748E",
                                fontFamily: "Heebo, sans-serif",
                                display: "flex",
                                gap: 1,
                              }}>
                              נמחק ב:
                              <span style={{ color: "#020618", fontWeight: 500 }}>
                                {formattedDate}
                              </span>
                            </Typography>
                          </Stack>
                          <Button
                            onClick={() => handleRestoreResponseClick(item.formId, item.id)}
                            variant="contained"
                            sx={{
                              backgroundColor: theme.palette.primary.main,
                              color: "white",
                              borderRadius: "10px",
                              px: 4,
                              py: 0.75,
                              fontFamily: "Heebo, sans-serif",
                              fontWeight: 500,
                              minWidth: "120px",
                              "&:hover": {
                                backgroundColor: theme.palette.primary.dark,
                              },
                            }}>
                            שחזור
                          </Button>
                        </StyledCard>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            ))}

            {isResponsesLoading && (
              <Box className="main-page-loading" sx={{ py: 4 }}>
                <Typography sx={{ color: "text.secondary", fontFamily: "Heebo, sans-serif" }}>
                  טוען עוד תגובות...
                </Typography>
              </Box>
            )}
          </Box>
        ) : isResponsesLoading ? (
          <Box className="main-page-loading" sx={{ py: 8 }}>
            <Typography sx={{ color: "text.secondary", fontFamily: "Heebo, sans-serif" }}>
              טוען תגובות...
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
            }}>
            <Typography
              variant="h6"
              sx={{ color: "text.secondary", fontFamily: "Heebo, sans-serif" }}>
              לא נמצאו תגובות שנמחקו.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default DeletedForms;
