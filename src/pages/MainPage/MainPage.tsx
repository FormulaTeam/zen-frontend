import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactLoading from "react-loading";
import Grid from "@mui/material/Grid";
import { Box, IconButton, Tab, Tabs, Tooltip, Typography, useTheme } from "@mui/material";
import { useGetFormsData } from "../../hooks/useGetFormsData";
import { useFormsScope } from "../../hooks/useFormsScope";
import {
  FormsSortOption,
  SortDirection,
  formsSortOption,
  sortDirectionOption,
  formsScopeOption,
} from "../../types/enums/filtersAndSorts.enum";
import CreateNew from "../../components/MainPage/CreateNew";
import mGif from "../../images/m.gif";
import syncGif from "../../images/sync.gif";
import noData from "../../images/noData2.png";
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
import { NoResultsState } from "../../components/MainPage/NoResultsState";
import { useDebounce } from "@src/hooks/utilsHooks/useDebounce";

function MainPage({
  user,
  searchValue,
  handleSearch,
  shouldRefreshPage,
  setShouldRefreshPage,
  resetSearchValue,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortByParam = searchParams.get("sortBy") as FormsSortOption | null;
  const sortDirectionParam = searchParams.get("sortDirection") as SortDirection | null;

  const getInitialSortBy = (): FormsSortOption => {
    if (sortByParam && Object.values(formsSortOption).includes(sortByParam)) {
      return sortByParam;
    }
    const stored = sessionStorage.getItem("formula-forms-sort-by") as FormsSortOption | null;
    if (stored && Object.values(formsSortOption).includes(stored)) {
      return stored;
    }
    return formsSortOption.CreatedAt;
  };

  const getInitialSortDirection = (): SortDirection => {
    if (sortDirectionParam && Object.values(sortDirectionOption).includes(sortDirectionParam)) {
      return sortDirectionParam;
    }
    const stored = sessionStorage.getItem("formula-forms-sort-direction") as SortDirection | null;
    if (stored && Object.values(sortDirectionOption).includes(stored)) {
      return stored;
    }
    return sortDirectionOption.Descending;
  };

  const [sortBy, setSortBy] = useState<FormsSortOption>(getInitialSortBy());
  const [sortDirection, setSortDirection] = useState<SortDirection>(getInitialSortDirection());

  const debouncedSearchValue = useDebounce(searchValue, 500);

  const { isSuperAdmin } = useSuperAdmin();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: myPersonal } = useGetMyPersonal({ enabled: !!user });

  const { scope, setScope } = useFormsScope({ isSuperAdmin: !!isSuperAdmin });

  useEffect(() => {
    let activeSortBy = sortByParam;
    let activeSortDirection = sortDirectionParam;

    if (!activeSortBy) {
      activeSortBy = sessionStorage.getItem("formula-forms-sort-by") as FormsSortOption | null;
    }
    if (!activeSortDirection) {
      activeSortDirection = sessionStorage.getItem("formula-forms-sort-direction") as SortDirection | null;
    }

    if (activeSortBy && Object.values(formsSortOption).includes(activeSortBy)) {
      setSortBy(activeSortBy);
    }
    if (activeSortDirection && Object.values(sortDirectionOption).includes(activeSortDirection)) {
      setSortDirection(activeSortDirection);
    }
  }, [sortByParam, sortDirectionParam]);

  const { formsData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetFormsData({
    scope: scope,
    searchQuery: debouncedSearchValue || undefined,
    sortBy,
    sortDirection,
    enabled: !!user,
    includePermissions: !isSuperAdmin && scope !== formsScopeOption.MyForms,
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 10 && hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  };

  const handleSortChange = (newSortBy: FormsSortOption, newSortDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);

    sessionStorage.setItem("formula-forms-sort-by", newSortBy);
    sessionStorage.setItem("formula-forms-sort-direction", newSortDirection);

    setSearchParams(
      (prev) => {
        const updated = new URLSearchParams(prev);
        updated.set("sortBy", newSortBy);
        updated.set("sortDirection", newSortDirection);
        return updated;
      },
      { replace: true }
    );
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
    scope: formsScopeOption.MyForms,
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

  const showNoResults = useMemo(() => {
    if (debouncedSearchValue && debouncedSearchValue.trim() !== "") {
      return true;
    }

    if (scope === formsScopeOption.SharedWithMeForms) {
      return true;
    }

    return false;
  }, [debouncedSearchValue, scope]);

  return (
    <Box className="main-page-container">
      <Box className="tabs-and-select-div">
        <RowBox sx={{ mb: 1, mt: 2 }}>
          <GreetingBox>
            <PrimaryBlueButton
              onClick={() => navigate(IPath.FORM_CREATE)}
              data-testid="create-form-button">
              <AddIcon sx={{ fontSize: "22px" }} />
              טופס חדש
            </PrimaryBlueButton>
          </GreetingBox>

          <SortControlsBox>
            <SearchAndFilter
              searchValue={searchValue}
              handleSearch={handleSearch}
              placeholder="חיפוש טופס"
              dataTestId="search-form-input"
            />
            <Box
              sx={{
                width: "1px",
                height: "24px",
                backgroundColor: "rgba(0, 0, 0, 0.12)",
                mx: 0.5,
              }}
            />
            <FormGroupSelect
              value={scope}
              onChange={setScope}
              isSuperAdmin={!!isSuperAdmin}
            />
            <MainSortSelect
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
              dataTestId="sort-forms"
            />
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
            onScroll={handleScroll}
            spacing={3}>
            {formsData.map((form: FormOverviewDto, index: number) => (
              <Grid key={form.id ?? index} size={{ xs: 4, sm: 4, md: 6, lg: 4, xl: 3 }}>
                <FormCard
                  form={form}
                  searchValue={searchValue}
                  resetSearchValue={resetSearchValue}
                  isSuperAdmin={isSuperAdmin}
                  navigate={navigate}
                  isCreator={form.createdBy?.upn?.toLowerCase() === myPersonal?.upn?.toLowerCase()}
                />
              </Grid>
            ))}
            {isFetchingNextPage && (
              <Box className="bottom-lbl" sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <ReactLoading type="spin" color={theme.palette.primary.main} height={30} width={30} />
              </Box>
            )}
          </Grid>
        ) : showNoResults ? (
          <Box sx={{ width: "100%", display: "flex", justifyContent: "center", mt: 6 }}>
            <NoResultsState
              onClearSearch={resetSearchValue}
              setScope={setScope}
              isSuperAdmin={!!isSuperAdmin}
            />
          </Box>
        ) : (
          <Grid
            container
            columns={{ xs: 4, sm: 8, md: 12 }}
            className="forms-grid"
            id="forms-grid"
            spacing={3}>
            <Grid size={{ xs: 4, sm: 4, md: 6, lg: 4, xl: 3 }}>
              <EmptyState />
            </Grid>
          </Grid>
        )}
      </Box>

      <BasePopup
        open={false}
        onClose={() => { }}
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
