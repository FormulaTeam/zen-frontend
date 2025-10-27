import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";
import Grid from "@mui/material/Grid";
import { Box, IconButton, Tab, Tabs, Tooltip, Typography, useTheme } from "@mui/material";
import { useGetFormsData } from "../../hooks/useGetFormsData";
import { useActiveTabFilter } from "../../hooks/useActiveTabFilter";
import { Filter, FormsTab, Form } from "../../utils/interfaces";
import CreateNew from "../../components/MainPage/CreateNew";
import mGif from "../../images/m.gif";
import syncGif from "../../images/sync.gif";
import noData from "../../images/noData2.png";
import { formsTabs } from "../../utils/utils";
import MainSortSelect from "../../components/MainSortSelect/MainSortSelect";
import "react-toastify/dist/ReactToastify.css";
import UserPicker from "../../components/USerPicker/UserPicker";
import { useSuperAdmin } from "../../contexts/SuperAdminContext";
import FormCard from "../../components/FormCard/FormCard";
import wavingHand from "../../images/waving_hand.png";
import "./MainPage.scss";
import BasePopup from "../../components/BasePopup/BasePopup";
import { AutoDelete } from "@mui/icons-material";
import { RowBox, StyledTypography } from "./styled";
import { getSortedFilter } from "../../utils/filters";

function MainPage({
  user,
  searchValue,
  shouldRefreshPage,
  setShouldRefreshPage,
  roles,
  resetSearchValue,
}) {
  const [tabValue, setTabValue] = useState<FormsTab | null>(formsTabs.currentUserCreated);
  const [page, setPage] = useState(1);
  const [searchVal, setSearchVal] = useState("");
  const [currentFilter, setCurrentFilter] = useState<Filter | null>(null);
  const [showMetroPopup, setShowMetroPopup] = useState(false);
  const [formToEdit, setFormToEdit] = useState<Form | null>(null);
  const [showSharePopup, setShowSharePopup] = useState(false);

  const { isSuperAdmin } = useSuperAdmin();
  const navigate = useNavigate();
  const theme = useTheme();

  const { getFilter } = useActiveTabFilter({ isSuperAdmin: !!isSuperAdmin, tabValue, user });
  const { formsData, setFormsData, loadingBottom, getData, isLoading } = useGetFormsData([]);

  useEffect(() => {
    const tabFromStorage = localStorage.getItem("tabValue");
    if (tabFromStorage) setTabValue(parseInt(tabFromStorage) as FormsTab);
  }, []);

  useEffect(() => {
    if (tabValue === null || isSuperAdmin === null) return;

    localStorage.setItem("tabValue", tabValue.toString());
    setFormsData([]);
    setPage(1);

    let filter = getFilter({ query: {} });
    if (currentFilter?.sortBy) {
      filter = { ...filter, sortBy: currentFilter.sortBy, orderBy: currentFilter.orderBy };
    }

    if (searchValue) {
      filter.query = {
        ...filter.query,
        $or: [
          { name: { $regex: searchValue } },
          { description: { $regex: searchValue } },
          { id: Number.isNaN(Number(searchValue)) ? null : Number(searchValue) },
        ],
      };
    }

    setCurrentFilter(filter);
  }, [tabValue, isSuperAdmin, getFilter, user.upn]);

  useEffect(() => {
    const abortController = new AbortController();
    const handler = setTimeout(() => {
      if (searchValue !== searchVal) {
        setSearchVal(searchValue);
        setPage(1);

        const filter = {
          ...(currentFilter ?? {}),
          signal: abortController.signal,
        };

        if (searchValue) {
          filter.query = {
            ...filter.query,
            $or: [
              { name: { $regex: searchValue } },
              { description: { $regex: searchValue } },
              { id: Number.isNaN(Number(searchValue)) ? null : Number(searchValue) },
            ],
          };
        }

        setCurrentFilter(filter as Filter);
      }
    }, 200);

    return () => {
      clearTimeout(handler);
      abortController.abort();
    };
  }, [searchValue]);

  useEffect(() => {
    if (shouldRefreshPage && currentFilter) {
      setShouldRefreshPage(false);
      getData(1, currentFilter);
    }
  }, [shouldRefreshPage, currentFilter]);

  useEffect(() => {
    if (currentFilter && !isLoading) {
      getData(1, currentFilter);
    }
  }, [currentFilter, isLoading]);

  const handleTabValueChange = (event: React.SyntheticEvent, newValue: FormsTab) => {
    setTabValue(newValue);
  };

  const handleScroll = async (e: React.UIEvent<HTMLElement>) => {
    const { offsetHeight, scrollTop, scrollHeight } = e.currentTarget;
    if (!loadingBottom) {
      const atBottom = offsetHeight + scrollTop + 10 >= scrollHeight;
      if (atBottom) {
        const nextPage = page + 1;
        setPage(nextPage);
        const filter: Filter = (currentFilter ?? {}) as Filter;
        await getData(nextPage, filter);
      }
    }
  };

  const getSortFilter = (newValueInt: number, filter: Filter) => {
    const newFilter = getFilter(filter);
    setCurrentFilter(newFilter);
    return getSortedFilter(newValueInt, newFilter);
  };

  return (
    <Box className="main-page-container" style={{ backgroundColor: theme.palette.white }}>
      <Box className="tabs-and-select-div">
        <RowBox>
          <StyledTypography>{`היי ${user.firstName}`}</StyledTypography>
          <img src={wavingHand} />
        </RowBox>

        <Box sx={{ borderBottom: `1px solid ${theme.palette.white}` }}>
          <Tabs
            className="form-tabs"
            value={tabValue}
            onChange={handleTabValueChange}
            aria-label="tabs for forms"
            sx={{ borderBottom: `1px solid ${theme.palette.white}`, direction: "rtl" }}>
            <Tab label="הטפסים שאני יצרתי" sx={{ fontSize: "20px" }} />
            <Tab label="הטפסים ששותפו איתי" sx={{ fontSize: "20px" }} />
            {isSuperAdmin && <Tab label="כל הטפסים" sx={{ fontSize: "20px" }} />}
          </Tabs>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}>
          <MainSortSelect
            setFormsData={setFormsData}
            setPage={setPage}
            getSortFilter={getSortFilter}
            setCurrentFilter={setCurrentFilter}
          />
          <Tooltip title="סל המיחזור">
            <IconButton
              sx={{ color: theme.palette.primary.main }}
              onClick={() => navigate("/deleted-forms")}>
              <AutoDelete />
            </IconButton>
          </Tooltip>
        </Box>
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
          spacing={3}
          onScroll={handleScroll}>
          {formsData?.map(
            (form: any, index: number) =>
              form && (
                <Grid key={index} size={{ xs: 4, sm: 4, md: 6, lg: 4, xl: 3 }}>
                  <FormCard
                    form={form}
                    roles={roles}
                    user={user}
                    resetSearchValue={resetSearchValue}
                    isSuperAdmin={isSuperAdmin}
                    navigate={navigate}
                    setShowMetroPopup={setShowMetroPopup}
                    setFormToEdit={setFormToEdit}
                    setShowSharePopup={setShowSharePopup}
                  />
                </Grid>
              ),
          )}
        </Grid>
      ) : (
        <Box className="no-data-div">
          <img src={noData} className="no-data-img" />
          <Typography className="no-data-lbl">אין טפסים להציג...</Typography>
          {tabValue === formsTabs.currentUserCreated && <CreateNew />}
        </Box>
      )}

      {showMetroPopup && (
        <BasePopup
          open
          onClose={() => setShowMetroPopup(false)}
          title="סנכרון נתונים למטרו"
          content={
            <Box className="gifs-div">
              <img src={mGif} className="m-gif" />
              <img src={syncGif} className="sync-gif" />
            </Box>
          }
        />
      )}

      {showSharePopup && formToEdit && (
        <UserPicker
          form={formToEdit}
          roles={roles}
          currentUser={user}
          closeSharePopupAndRefreshForm={(users, updatedForm) => {
            const formToUpdate = updatedForm ?? { ...formToEdit, users };
            setFormToEdit(formToUpdate);
            setFormsData((prevForms) =>
              prevForms.map((f) => (f.id === formToEdit.id ? formToUpdate : f)),
            );
            setShowSharePopup(false);
          }}
        />
      )}

      {loadingBottom && (
        <Box className="bottom-grid-loading" style={{ backgroundColor: theme.palette.white }}>
          <ReactLoading type="spinningBubbles" color={theme.palette.primary.main} />
        </Box>
      )}
    </Box>
  );
};

export default MainPage;
