import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";
import Grid from "@mui/material/Grid";
import { Box, IconButton, Tab, Tabs, Tooltip, Typography, useTheme } from "@mui/material";
import { useGetFormsData } from "../../hooks/useGetFormsData";
import { useActiveTabFilter } from "../../hooks/useActiveTabFilter";
import { FormsSortOption, SortDirection, formsSortOption, sortDirectionOption } from "../../types/enums/filtersAndSorts.enum";
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
import { AutoDelete } from "@mui/icons-material";
import MainSortSelect from "../../components/MainSortSelect/MainSortSelect";
import { useGetMyPersonal } from "../../api/usersApi";
import { RowBox, StyledTypography, GreetingBox, TabsBox, SortControlsBox } from "./styled";
import { FormOverviewDto } from "@src/types/shared";

function MainPage({
  user,
  searchValue,
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

  const handleTabValueChange = (event: React.SyntheticEvent, newValue: FormsTab) => {
    localStorage.setItem("tabValue", newValue.toString());
    setTabValue(newValue);
  };

  const handleSortChange = (newSortBy: FormsSortOption, newSortDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
  };

  return (
    <Box className="main-page-container" style={{ backgroundColor: theme.palette.white }}>
      <Box className="tabs-and-select-div">
        <RowBox>
          <GreetingBox>
            <StyledTypography id="greeting">{myPersonal?.name ? `היי ${myPersonal.name}` : "היי"}</StyledTypography>
            <img src={wavingHand} />
          </GreetingBox>

          <TabsBox>
            <Tabs
              className="form-tabs"
              value={tabValue}
              onChange={handleTabValueChange}
              aria-label="tabs for forms"
              sx={{ borderBottom: `1px solid ${theme.palette.white}` }}>
              <Tab label="הטפסים שאני יצרתי" sx={{ fontSize: "20px" }} data-testid="my-forms-button" />
              <Tab label="הטפסים ששותפו איתי" sx={{ fontSize: "20px" }} data-testid="shared-forms-button" />
              {isSuperAdmin && <Tab label="כל הטפסים" sx={{ fontSize: "20px" }} data-testid="all-forms-button" />}
            </Tabs>
          </TabsBox>

          <SortControlsBox>
            <MainSortSelect onSortChange={handleSortChange} dataTestId="sort-forms" />
            <Tooltip title="סל המיחזור">
              <IconButton
                sx={{ color: theme.palette.primary.main }}
                onClick={() => navigate("/deleted-forms")}
                data-testid="recycle-bin-button">
                <AutoDelete />
              </IconButton>
            </Tooltip>
          </SortControlsBox>
        </RowBox>
      </Box>

      {isLoading ? (
        <Box className="main-page-loading" style={{ backgroundColor: theme.palette.white }}>
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
        <Box className="no-data-div">
          <img src={noData} className="no-data-img" />
          <Typography className="no-data-lbl">אין טפסים להציג...</Typography>
          {tabValue === formsTabs.currentUserCreated && <CreateNew />}
        </Box>
      )}

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
