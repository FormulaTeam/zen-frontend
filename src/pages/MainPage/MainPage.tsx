import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";
import Grid from "@mui/material/Grid";
import { Box, IconButton, Tab, Tabs, Tooltip, Typography, useTheme } from "@mui/material";
import { useGetFormsData } from "../../hooks/useGetFormsData";
import { useActiveTabFilter } from "../../hooks/useActiveTabFilter";
import { Filter, FormsTab } from "../../utils/interfaces";
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
import { useFormsSSE } from "../../hooks/useFormsSSE";

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
  const [currentFilter, setCurrentFilter] = useState<any>(null);
  const [showMetroPopup, setShowMetroPopup] = useState(false);
  const [formToEdit, setFormToEdit] = useState<any>(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const { isSuperAdmin } = useSuperAdmin();
  const navigate = useNavigate();
  const theme = useTheme();
  const { getFilter } = useActiveTabFilter({ isSuperAdmin: !!isSuperAdmin, tabValue, user });
  const { formsData, setFormsData, loading, setLoading, loadingBottom, setLoadingBottom, getData } =
    useGetFormsData([]);

  useFormsSSE(user.upn);

  /** when page first loads - get tab from storage */
  useEffect(() => {
    if (tabValue === null) {
      let tabValueFromStorage = localStorage.getItem("tabValue");

      if (tabValueFromStorage) {
        let tabValueInt = parseInt(tabValueFromStorage) as FormsTab;
        if (tabValueInt !== null && tabValueInt !== undefined) {
          setTabValue(tabValueInt);
        }
      } else {
        setTabValue(formsTabs.currentUserCreated);
      }
    }
  }, []);

  /** when tabValue changes - reset data and page and change CurrentFilter */
  useEffect(() => {
    if (isSuperAdmin === null) return;
    if (tabValue !== null) {
      localStorage.setItem("tabValue", tabValue + "");
      //reset forms data
      setFormsData([]);
      setPage(1);
      // At first load, fetch the forms created by the user
      let filter = getFilter({ query: {} });
      //add sort if had any
      if (currentFilter?.sortBy) {
        filter = {
          ...filter,
          orderBy: currentFilter.orderBy,
          sortBy: currentFilter.sortBy,
        };
      }
      //add search if had any
      if (searchValue !== "") {
        filter.query = {
          ...filter.query,
          $or: [
            { name: { $regex: searchValue } },
            { description: { $regex: searchValue } },
            { id: Number.isNaN(Number(searchValue)) ? null : Number(searchValue) },
          ],
        };
      }
      setCurrentFilter({ ...filter });
    }
  }, [tabValue, isSuperAdmin]);

  useEffect(() => {
    const abortController = new AbortController();

    const handleChangeFilter = () => {
      if (searchValue !== searchVal) {
        setLoading(true);
        setSearchVal(searchValue);
        setPage(1);

        const filter = {
          ...getFilter({ ...currentFilter }),
          signal: abortController.signal,
        };

        if (searchValue === "") {
          if (filter?.query) {
            delete filter.query.$or;
            delete currentFilter?.query?.$or;

            const users = filter.query.users;
            let createdBy = filter.query.created_by;
            if (createdBy?.$ne) {
              createdBy = filter.query.created_by.$ne?.toLowerCase();
            } else {
              createdBy = filter.query.created_by?.toLowerCase();
            }

            if (users) {
              filter.query = { users: { $in: [user.upn?.toLowerCase()] } };
              currentFilter.query = { users: { $in: [user.upn?.toLowerCase()] } };
            }

            if (isSuperAdmin) {
              delete filter.query.created_by;
            } else if (createdBy) {
              filter.query = { created_by: { $regex: createdBy, $options: "i" } };
              currentFilter.query = { created_by: { $regex: createdBy, $options: "i" } };
            }
          }
        } else {
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
      }
    };

    const handler = setTimeout(() => handleChangeFilter(), 200);

    return () => {
      clearTimeout(handler);
      abortController.abort();
    };
  }, [searchValue]);

  /** if shouldRefreshPage true - change CurrentFilter by tab */
  useEffect(() => {
    if (shouldRefreshPage) {
      setShouldRefreshPage(false);
      getData(1, "useEffect4 - currentFilter", currentFilter);
    }
  }, [shouldRefreshPage]);

  /** when currentFilter changes - filter forms by calling getData */
  useEffect(() => {
    if (currentFilter && Object.keys(currentFilter).length > 0) {
      getData(1, "useEffect5 - currentFilter", currentFilter);
    }
  }, [currentFilter]);

  /**  Determine the filter by tab and sort */
  const getSortFilter = (newValueInt: any, filter: Filter) => {
    const newFilter = getFilter(filter);
    setCurrentFilter(newFilter);
    return getSortedFilter(newValueInt, newFilter);
  };

  /** when tabValue changes - show loading and set tabValue - than useEffect will be called */
  const handleTabValueChange = (event: React.SyntheticEvent, newValue: FormsTab) => {
    setTabValue(newValue);
    setLoading(true);
  };

  /** when scroll forms grid and reach the bottom - fetch more forms */
  const handleScroll = async (e: React.UIEvent<HTMLElement>) => {
    const { offsetHeight, scrollTop, scrollHeight } = e.currentTarget;

    if (!loadingBottom) {
      const atBottom = offsetHeight + scrollTop + 10 >= scrollHeight;
      if (atBottom) {
        const nextPage = page + 1;
        setPage(nextPage);
        let filter: Filter | null = null;
        if (searchVal) {
          filter = {
            ...currentFilter,
            query: {
              ...currentFilter?.query,
              name: { $regex: searchVal },
            },
          };
        } else {
          filter = currentFilter;
        }
        setLoadingBottom(true);
        await getData(nextPage, "useEffect2 - handleScroll", filter ?? {});
      }
    }
  };

  return (
    <Box className="main-page-container" style={{ backgroundColor: theme.palette.white }}>
      <Box className="tabs-and-select-div">
        <RowBox>
          <StyledTypography>{`היי ${user.firstName}`}</StyledTypography>
          <img src={wavingHand} />
        </RowBox>

        <Box sx={{ borderBottom: "1px solid" + theme.palette.white }}>
          <Tabs
            className="form-tabs"
            value={tabValue}
            onChange={handleTabValueChange}
            aria-label="tabs for forms"
            sx={{
              borderBottom: "1px solid" + theme.palette.white,
              direction: "rtl",
            }}>
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
            setLoading={setLoading}
            setCurrentFilter={setCurrentFilter}
          />
          <Tooltip title="סל המיחזור">
            <div>
              <IconButton
                sx={{ color: theme.palette.primary.main }}
                onClick={() => navigate("/deleted-forms")}>
                <AutoDelete />
              </IconButton>
            </div>
          </Tooltip>
        </Box>
      </Box>

      {loading ? (
        <Box className="main-page-loading" style={{ backgroundColor: theme.palette.white }}>
          <ReactLoading type={"spinningBubbles"} color={theme.palette.primary.main} />
        </Box>
      ) : formsData?.length > 0 ? (
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
          }></BasePopup>
      )}

      {showSharePopup && (
        <UserPicker
          form={formToEdit}
          roles={roles}
          currentUser={user}
          closeSharePopupAndRefreshForm={(users, updatedForm) => {
            const formToUpdate = updatedForm || {
              ...formToEdit,
              users: users,
            };

            setFormToEdit(formToUpdate);
            setFormsData((prevForms) =>
              prevForms.map((form) => (form.id === formToEdit.id ? formToUpdate : form)),
            );
            setShowSharePopup(false);
          }}
        />
      )}

      {loadingBottom && (
        <Box
          className="bottom-grid-loading"
          style={{
            backgroundColor: theme.palette.white,
          }}>
          <ReactLoading type={"spinningBubbles"} color={theme.palette.primary.main} />
        </Box>
      )}
    </Box>
  );
}

export default MainPage;
