import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Stack, Tabs, Tooltip, Typography, useTheme } from "@mui/material";
import { CustomIcon } from "../../theme/icons";
import { CustomTab, Header, PageContainer } from "./styled";
import { useDeletedForms, DeletedFormsFilters } from "../../hooks/useDeletedForms";
import DeletedResponsesTabContent from "../../components/DeletedForms/DeletedResponsesTabContent";
import DeletedFormsTabContent from "../../components/DeletedForms/DeletedFormsTabContent";
import type { FormDto } from "../../types/shared";
import { DELETED_TABS } from "../../utils/recycleBin";
import { useDebounce } from "../../hooks/utilsHooks/useDebounce";
import { Info } from "@mui/icons-material";

function DeletedForms({ user }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(DELETED_TABS.FORMS);
  const [currentDeletedForm, setCurrentDeletedForm] = useState<FormDto | null>(null);

  const [filters, setFilters] = useState<DeletedFormsFilters>({
    deletedBy: "",
    createdBy: "",
    sortValue: 7,
  });

  const handleTabChange = (_event, newValue) => {
    setCurrentDeletedForm(null);
    setTabValue(newValue);
  };

  const debouncedFilters = useDebounce(filters, 400);

  const {
    forms,
    loading: loadingForms,
    handleRestoreForm,
  } = useDeletedForms(user, handleTabChange, debouncedFilters);

  useEffect(() => {
    if (currentDeletedForm) {
      setTabValue(DELETED_TABS.RESPONSES);
    } else {
      setTabValue(DELETED_TABS.FORMS);
    }
  }, [currentDeletedForm]);

  return (
    <PageContainer $bgColor={theme.palette.background.default}>
      <Header>
        <Stack direction="row" alignItems="baseline" gap={1}>
          <Typography variant="h4" gutterBottom>
            סל המיחזור
          </Typography>
          <Tooltip title="הפריטים שמוצגים בסל המיחזור הן לפי ההרשאות הגישה של כל משתמש. הנתונים שמוצגים לשחזור לכל משתמש הם פריטים שנוצרו/נמחקו ע”י אותו משתמש. כמו כן לבעלי שליטה מלאה לטפסים, יוצגו כל הנתונים של אותם טפסים שנמחקו.">
            <Info color="disabled" />
          </Tooltip>
        </Stack>
        <Box>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="deleted content tabs">
            <CustomTab label="טפסים שנמחקו" />
            <CustomTab label="תגובות שנמחקו" />
          </Tabs>
        </Box>
        <Tooltip title="חזרה">
          <Button onClick={() => navigate("/")} variant="customIcon">
            <CustomIcon iconName="arrowBack" forcePointer />
          </Button>
        </Tooltip>
      </Header>

      {tabValue === DELETED_TABS.FORMS ? (
        <DeletedFormsTabContent
          forms={forms}
          loadingForms={loadingForms}
          handleRestoreForm={handleRestoreForm}
          setCurrentDeletedForm={setCurrentDeletedForm}
          filters={filters}
          setFilters={setFilters}
        />
      ) : (
        <DeletedResponsesTabContent
          user={user}
          currentDeletedForm={currentDeletedForm}
          handleRestoreForm={handleRestoreForm}
        />
      )}
    </PageContainer>
  );
}

export default DeletedForms;
