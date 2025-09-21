import "./toast.scss";
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import MainPage from "./pages/MainPage/MainPage";
import Login from "./pages/Login/Login";
import { useAuth } from "./contexts/AuthContext";
import ResponsesPage from "./pages/ResponsesPage/ResponsesPage";
import ProtectedRoute from "./components/ProrectedRoute/ProtectedRoute";
import Navbar from "./components/Navbar/Navbar";
import { ToastContainer } from "react-toastify";
import { SSOCallback } from "./pages/Login/SSOCallback";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import CreateForm from "./pages/CreateForm/CreateForm";
import EditForm from "./pages/EditForm/EditForm";
import LocalStorageUpdater from "./components/LocalStorageUpdater";
import Response from "./pages/Response/Response";
import { DownloadPage } from "./pages/DownloadPage/DownloadPage";
import DeletedForms from "./pages/DeletedForms/DeletedForms";
import { IPath } from "./types/enums/global.enums";
import Dashboard from "./pages/Dashboard/Dashboard";
import HelpBtn from "./components/HelpBtn/HelpBtn";
import HelpDiv from "./components/HelpBtn/HelpDiv";

const AppRouter = () => {
  const { user, roles } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [showHelpCard, setShowHelpCard] = useState(false);
  const [shouldRefreshPage, setShouldRefreshPage] = useState(false);

  function resetSearchValue() {
    setSearchValue("");
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LocalStorageUpdater />
      <Box
        sx={{
          display: "grid",
          gridTemplateRows: "auto 1fr",
          height: "100vh",
        }}>
        <Navbar searchValue={searchValue} handleSearch={(val) => setSearchValue(val)} />
        <Routes>
          <Route path={IPath.ERROR} element={<ErrorPage />} />
          <Route path={IPath.LOGIN} element={<Login />} />
          <Route path={IPath.SSO_CALLBACK} element={<SSOCallback />} />
          <Route path={IPath.DASHBOARD} element={<Dashboard />} />

          <Route element={<ProtectedRoute />}>
            <Route
              path={IPath.HOME}
              element={
                <MainPage
                  user={user}
                  searchValue={searchValue}
                  shouldRefreshPage={shouldRefreshPage}
                  setShouldRefreshPage={setShouldRefreshPage}
                  resetSearchValue={resetSearchValue}
                  roles={roles}
                />
              }
            />
            <Route
              path={IPath.FORM_CREATE}
              element={<CreateForm currentUser={user} formToEdit={null} />}
            />
            <Route path={IPath.FORM_EDIT} element={<EditForm user={user} />} />
            <Route
              path={IPath.RESPONSES}
              element={
                <ResponsesPage
                  user={user}
                  shouldRefreshPage={shouldRefreshPage}
                  setShouldRefreshPage={setShouldRefreshPage}
                  roles={roles}
                />
              }
            />
            <Route path={IPath.RESPONSE_CREATE} element={<Response roles={roles} user={user} />} />
            <Route
              path={IPath.RESPONSE_CREATE_COPY}
              element={<Response roles={roles} user={user} copyMode />}
            />
            <Route path={IPath.RESPONSE_EDIT} element={<Response roles={roles} user={user} />} />
            <Route
              path={IPath.RESPONSE_VIEW}
              element={<Response roles={roles} user={user} viewMode />}
            />
            <Route path={IPath.DOWNLOAD_FILE} element={<DownloadPage />} />
            <Route path={IPath.DELETED_FORMS} element={<DeletedForms user={user} />} />
          </Route>
        </Routes>
        <ToastContainer rtl />
        <HelpBtn showHelpCard={() => setShowHelpCard(true)} />
        {showHelpCard && <HelpDiv hideHelpCard={() => setShowHelpCard(false)} />}
      </Box>
    </BrowserRouter>
  );
};

export default AppRouter;
