import { Box, Portal, Snackbar, Stack } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useExcel } from "../../hooks/useExcel";
import { useMetro } from "../../hooks/useMetro";
import ImportFromExcelPopup from "./Popups/ImportFromExcelPopup";
import ManualMetroSource from "./Popups/ManualMetroSource";
import MetroSyncingPopup from "./Popups/MetroSyncingPopup";
import MenusContainer from "./Menus/MenusContainer";
import "./ResponseToolbar.scss";
import styled from "styled-components";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { IPath } from "../../types/enums/global.enums";
import { Button } from "@mui/material";

export const HiddenInput = styled("input")`
  display: none !important;
`;

function ResponseToolbar({
  form,
  getResponsesForCurrentPage,
  setShowSharePopup,
  responsesCount,
  permissionTypes,
  deleteAllResponsesConfirmation,
  deleteFormFromBtn,
  setShouldRefreshPage,
}) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [anchorElMoreActions, setAnchorElMoreActions] = useState<null | HTMLElement>(null);
  const [anchorElSourceType, setAnchorElSourceType] = useState<null | HTMLElement>(null);

  const {
    showMetroPopup,
    setShowMetroPopup,
    showMetroInputsPopup,
    setShowMetroInputsPopup,
    theForm,
    pushToMetro,
    syncSourceToMetro,
    editSource,
    copied,
    setCopied,
    metroInputsPopupLoading,
    sourceKey,
    setSourceKey,
    appKey,
    setAppKey,
    clusterURL,
    setClusterURL,
    saveMetroData,
    copySchemaToClipboard,
  } = useMetro({
    form,
    getResponsesForCurrentPage,
  });

  const {
    showImportFromExcelPopup,
    setShowImportFromExcelPopup,
    onChangeFile,
    showErrorsFromExcelPopup,
    setShowErrorsFromExcelPopup,
    showErrorFileTooBig,
    excelErrorPopupLoading,
    setExcelErrorPopupLoading,
    errorFromExcel,
    setErrorsFromExcel,
    createExcelMold,
  } = useExcel({
    form: theForm,
    setShouldRefreshPage,
  });
  const handleCloseMoreActions = () => {
    setAnchorElMoreActions(null);
    setAnchorElSourceType(null);
  };

  const handleAutomaticSource = () => {
    if (theForm?.metro_access_url) {
      editSource();
    } else {
      syncSourceToMetro();
    }
    handleCloseMoreActions();
  };

  const handleManualSource = () => {
    setShowMetroInputsPopup(true);
    handleCloseMoreActions();
  };

  return (
    <Stack gap={1}>
      <MenusContainer
        deleteAllResponsesConfirmation={deleteAllResponsesConfirmation}
        deleteFormFromBtn={deleteFormFromBtn}
        permissionTypes={permissionTypes}
        form={theForm}
        setAnchorElMoreActions={setAnchorElMoreActions}
        setShowSharePopup={setShowSharePopup}
        responsesCount={responsesCount}
        setShowImportFromExcelPopup={setShowImportFromExcelPopup}
        pushToMetro={pushToMetro}
        anchorElMoreActions={anchorElMoreActions}
        anchorElSourceType={anchorElSourceType}
        setAnchorElSourceType={setAnchorElSourceType}
      />
      <HiddenInput
        type="file"
        id="fileInput"
        ref={uploadRef}
        onChange={onChangeFile}
        hidden
        multiple={false}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      />
      {showMetroPopup && <MetroSyncingPopup setShowMetroPopup={setShowMetroPopup} />}
      {showMetroInputsPopup && (
        <ManualMetroSource
          getResponsesForCurrentPage={getResponsesForCurrentPage}
          form={form}
          setShowMetroInputsPopup={setShowMetroInputsPopup}
          metroInputsPopupLoading={metroInputsPopupLoading}
          sourceKey={sourceKey}
          setSourceKey={setSourceKey}
          appKey={appKey}
          setAppKey={setAppKey}
          clusterURL={clusterURL}
          setClusterURL={setClusterURL}
          saveMetroData={saveMetroData}
          copySchemaToClipboard={copySchemaToClipboard}
        />
      )}
      {showImportFromExcelPopup && (
        <ImportFromExcelPopup
          form={theForm}
          setShouldRefreshPage={setShouldRefreshPage}
          ref={uploadRef}
          setShowImportFromExcelPopup={setShowImportFromExcelPopup}
          showErrorsFromExcelPopup={showErrorsFromExcelPopup}
          setShowErrorsFromExcelPopup={setShowErrorsFromExcelPopup}
          showErrorFileTooBig={showErrorFileTooBig}
          excelErrorPopupLoading={excelErrorPopupLoading}
          setExcelErrorPopupLoading={setExcelErrorPopupLoading}
          errorFromExcel={errorFromExcel}
          setErrorsFromExcel={setErrorsFromExcel}
          createExcelMold={createExcelMold}
        />
      )}
      <Portal>
        <Snackbar
          open={copied}
          autoHideDuration={1500}
          onClose={() => setCopied(false)}
          message="הסכמה הועתקה בהצלחה"
        />
      </Portal>
      <Box>
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            navigate(IPath.RESPONSE_CREATE.replace(":formId", form.id));
          }}
          startIcon={<Add />}>
          הוספת תגובה חדשה
        </Button>
      </Box>
    </Stack>
  );
}

export default ResponseToolbar;
