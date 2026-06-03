import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";
import Grid from "@mui/material/Grid";
import { Box, IconButton, Tab, Tabs, Tooltip, Typography, useTheme } from "@mui/material";
import { useGetFormsData } from "../../hooks/useGetFormsData";
import { useActiveTabFilter } from "../../hooks/useActiveTabFilter";
import {
  FormsSortOption,
  SortDirection,
  formsSortOption,
  sortDirectionOption,
  formsScopeOption,
} from "../../types/enums/filtersAndSorts.enum";
import { FormsTab } from "../../utils/interfaces";
import CreateNew from "../../components/MainPage/CreateNew";
import mGif from "../../images/m.gif";
import syncGif from "../../images/sync.gif";
import noData from "../../images/noData2.png";
import { formsTabs } from "../../utils/utils";
import { useSuperAdmin } from "../../contexts/SuperAdminContext";
import FormCard from "../../components/FormCard/FormCard";
import wavingHand from "../../images/waving_hand.png";
import "./MainPage.scss";
import BasePopup from "../../components/BasePopup/BasePopup";
import { AutoDelete, Add as AddIcon } from "@mui/icons-material";
import MainSortSelect from "../../components/MainSortSelect/MainSortSelect";
import SearchAndFilter from "../../components/SearchAndFilter/SearchAndFilter";
import FormGroupSelect from "../../components/MainPage/FormGroupSelect";
import { useGetMyPersonal } from "../../api/usersApi";
import {
  RowBox,
  StyledTypography,
  GreetingBox,
  SortControlsBox,
  PrimaryBlueButton,
} from "./styled";
import { FormOverviewDto } from "@src/types/shared";
import { IPath } from "../../types/enums/global.enums";
import { EmptyState } from "../../components/MainPage/EmptyState";

function MainPage({
  user,
  searchValue,
  handleSearch,
  shouldRefreshPage,
  setShouldRefreshPage,
  resetSearchValue,
}) {
  const [tabValue, setTabValue] = useState<FormsTab | null>(formsTabs.currentUserCreated);
  const [sortBy, setSortBy] = useState<FormsSortOption>(formsSortOption.Name);
  const [sortDirection, setSortDirection] = useState<SortDirection>(sortDirectionOption.Ascending);

  const { isSuperAdmin } = useSuperAdmin();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: myPersonal } = useGetMyPersonal({ enabled: !!user });

  const { getScope } = useActiveTabFilter({ isSuperAdmin: !!isSuperAdmin, tabValue });

  const { formsData, isLoading } = useGetFormsData({
    scope: getScope(),
    searchQuery: searchValue || undefined,
    sortBy,
    sortDirection,
    enabled: !!user,
    includePermissions: !isSuperAdmin && tabValue !== formsTabs.currentUserCreated,
  });

  useEffect(() => {
    const tabFromStorage = localStorage.getItem("tabValue");
    if (tabFromStorage) {
      setTabValue(parseInt(tabFromStorage) as FormsTab);
    }
  }, []);

  const handleTabValueChange = (newValue: FormsTab) => {
    localStorage.setItem("tabValue", newValue.toString());
    setTabValue(newValue);
  };

  const handleSortChange = (newSortBy: FormsSortOption, newSortDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
  };

  // Queries to determine if the user has NO forms at all in any category
  const { formsData: myFormsCountData, isLoading: isMyFormsLoading } = useGetFormsData({
    scope: formsScopeOption.MyForms,
    enabled: !!user,
  });

  const { formsData: sharedFormsCountData, isLoading: isSharedFormsLoading } = useGetFormsData({
    scope: formsScopeOption.SharedWithMeForms,
    enabled: !!user,
  });

  const { formsData: allFormsCountData, isLoading: isAllFormsLoading } = useGetFormsData({
    scope: formsScopeOption.AllForms,
    enabled: !!user && !!isSuperAdmin,
  });

  const isFirstForm = useMemo(() => {
    if (isSuperAdmin) return !isAllFormsLoading && allFormsCountData.length === 0;

    return !isMyFormsLoading && myFormsCountData.length === 0;
  }, [
    isSuperAdmin,
    isAllFormsLoading,
    allFormsCountData.length,
    isMyFormsLoading,
    isSharedFormsLoading,
    myFormsCountData.length,
    sharedFormsCountData.length,
  ]);

  return (
    <Box className="main-page-container">
      <Box className="tabs-and-select-div">
        <RowBox sx={{ mb: 3, mt: 2 }}>
          <GreetingBox>
            <StyledTypography id="greeting">
              {myPersonal?.name ? `היי ${myPersonal.name.split(" ")[0]}` : "היי"}
            </StyledTypography>
          </GreetingBox>

          <SortControlsBox>
            <SearchAndFilter
              searchValue={searchValue}
              handleSearch={handleSearch}
              placeholder="חיפוש טופס"
              dataTestId="search-form-input"
            />
            <FormGroupSelect
              value={tabValue}
              onChange={handleTabValueChange}
              isSuperAdmin={!!isSuperAdmin}
            />
            <MainSortSelect onSortChange={handleSortChange} dataTestId="sort-forms" />
            <PrimaryBlueButton
              onClick={() => navigate(IPath.FORM_CREATE)}
              data-testid="create-form-button">
              <AddIcon sx={{ mr: 1, fontSize: "22px" }} />
              יצירת טופס חדש
            </PrimaryBlueButton>
          </SortControlsBox>
        </RowBox>
      </Box>

      <Box className="main-page-content-wrapper">
        {isLoading ? (
          <Box className="main-page-loading">
            <ReactLoading type="spinningBubbles" color={theme.palette.primary.main} />
          </Box>
        ) : formsData.length > 0 ? (
          <Grid
            container
            columns={{ xs: 4, sm: 8, md: 12 }}
            className="forms-grid"
            id="forms-grid"
            spacing={3}>
            {formsData.map((form: FormOverviewDto, index: number) => (
              <Grid key={form.id ?? index} size={{ xs: 4, sm: 4, md: 6, lg: 4, xl: 3 }}>
                <FormCard
                  form={form}
                  resetSearchValue={resetSearchValue}
                  isSuperAdmin={isSuperAdmin}
                  navigate={navigate}
                  isCreator={form.createdBy?.upn?.toLowerCase() === myPersonal?.upn?.toLowerCase()}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <EmptyState
            image={noData}
            title={searchValue ? "לא מצאנו את מה שחיפשת" : "אין טפסים להציג..."}
            subtitle={
              searchValue
                ? `לא מצאנו טפסים שתואמים את החיפוש "${searchValue}"`
                : tabValue === formsTabs.currentUserCreated
                  ? "נראה שטרם יצרת טפסים במערכת. זה הזמן להתחיל!"
                  : tabValue === formsTabs.sharedWithUser
                    ? "טרם שותפו איתך טפסים במערכת."
                    : "לא נמצאו טפסים במערכת."
            }
            actions={<CreateNew isFirstForm={isFirstForm} />}
          />
        )}
      </Box>

      <BasePopup
        open={false}
        onClose={() => {}}
        title="סנכרון נתונים למטרו"
        content={
          <Box className="gifs-div">
            <img src={mGif} className="m-gif" />
            <img src={syncGif} className="sync-gif" />
          </Box>
        }
      />
    </Box>
  );
}

export default MainPage;
