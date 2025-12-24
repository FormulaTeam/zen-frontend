import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Button, Select, MenuItem, FormControl, InputLabel, Box, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { getFormById, getResponses, getResponsesCount } from "../../api";
import { Form } from "../../utils/interfaces";
import { showErrorNotification, showSuccessNotification } from "../../utils/utils";
import UserPicker from "../../components/USerPicker/UserPicker";
import ConfirmPopup from "../../popups/ConfirmPopup/ConfirmPopup";
import AlertMsg from "../../components/AlertMsg/AlertMsg";
import { MaterialReactTable } from "material-react-table";
import { useSuperAdmin } from "../../contexts/SuperAdminContext";
import deleteResponseImg from "../../images/delete_response.png";
import ResponseToolbar from "../../components/ResponseToolbar/ResponseToolbar";
import { useInitializeFormData } from "../../hooks/useInitializeFormData";
import { useViewManager } from "../../hooks/useViewManager";
import Loader from "../../components/Responses/Loader";
import {
  DetailsContainer,
  MainContentWrapper,
  TopSection,
  ContentContainer,
  MainContent,
  PageWrapper,
  QuickEditTableContainer,
} from "./styled";
import Header from "../../components/Responses/Header";
import SearchInfo from "../../components/Responses/SearchInfo";
import OperationsContainer from "../../components/Responses/OperationsContainer";
import { useResponsesTable } from "../../hooks/useResponsesTable";
import { useTableColumns } from "../../hooks/useTableColumns";
import { useResponsesList } from "../../hooks/useResponsesList";
import { ResponseCount } from "../../types/interfaces/responses.types";
import ResponseDetailsPanel from "../../components/ResponseDetailsPanel/ResponseDetailsPanel";
import SidePanel from "../../components/SidePanel/SidePanel";
import { TableView, ViewColumn } from "../../types/interfaces/tableViews.types";
import { useQuickEdit } from "../../hooks/useQuickEdit";
import { useConnectedFormOptions } from "../../hooks/useConnectedFormOptions";

function ResponsesPage({ user, shouldRefreshPage, setShouldRefreshPage, roles }) {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [currentViewConfig, setCurrentViewConfig] = useState<ViewColumn[] | undefined>();

  const {
    loading,
    setLoading,
    loadingInsideTable,
    loadingTable,
    setLoadingTable,
    form,
    setForm,
    columns,
    setColumns,
    allFilteredResponses,
    setAllFilteredResponses,
    search,
    setSearch,
    allResponsesCount,
    setAllResponsesCount,
    firstRun,
    setFirstRun,
    searchCount,
    setSearchCount,
    showSharePopup,
    setShowSharePopup,
    showDeleteAllConfirmPopup,
    setShowDeleteAllConfirmPopup,
    searchByColumn,
    showConfirmMsg,
    setShowConfirmMsg,
    confirmMsg,
    confirmOkFunc,
    currentFilter,
    setCurrentFilter,
    setRowSelection,
    setLoadingInsideTable,
    rowSelection,
    changePageSizeAndRefreshTable,
    sorting,
    setSorting,
    doSearch,
    isSynchedToMetro,
    fileOnClickHandler,
    deleteAllResponsesConfirmation,
    searchBySorting,
    deleteAllSelectedResponses,
    editResponse,
    viewResponse,
    columnFilters,
    setColumnFilters,
    pagination,
    setPagination,
    mainSearch,
    setMainSearch,
    permissionTypes,
    setPermissionTypes,
    deleteFormFromBtn,
    confirmBtnText,
  } = useResponsesList({ setShouldRefreshPage, user, currentViewConfig });

  // Quick Edit hook
  const {
    isQuickEditMode,
    updatedData,
    validationErrors,
    hasUnsavedChanges,
    forceRenderCounter,
    handleCellValueChange,
    toggleQuickEdit,
    saveAndExit,
    cancelAndExit,
    addNewResponse,
    getCombinedResponses,
    handleRowSelectionChange,
    isRowInEditMode,
    isEditButtonDisabled,
    editButtonDisabledReason,
  } = useQuickEdit({
    form,
    allFilteredResponses,
    rowSelection,
    user,
    setShouldRefreshPage,
  });

  const { id } = useParams();
  const { isSuperAdmin } = useSuperAdmin();
  const {
    initializeFormData,
    responsesHaveParents,
    setResponsesHaveParents,
    responsesWithChildren,
    childrenForms,
  } = useInitializeFormData();
  const { fieldOptions, isLoading: loadingConnections } = useConnectedFormOptions({
    formFields: form?.fields,
  });

  // Initialize table columns with Quick Edit support
  const { createTableColumns } = useTableColumns(
    setColumns,
    fileOnClickHandler,
    isSynchedToMetro,
    sorting,
    setLoadingInsideTable,
    responsesHaveParents,
    isQuickEditMode,
    handleCellValueChange,
    validationErrors,
    rowSelection,
    updatedData,
    isRowInEditMode,
    forceRenderCounter,
    fieldOptions,
  );
  const {
    currentView,
    savedViews: allViews,
    selectedViewId,
    handleSaveView,
    handleLoadView,
    handleViewDropdownChange,
    handleApplyView,
    handleDeleteView,
  } = useViewManager({
    form,
    user,
    onViewConfigChange: setCurrentViewConfig,
    setSorting, // Pass sorting setter to apply view-based sorting
    tableColumns: columns, // Pass table columns for proper ID mapping
  });

  useEffect(() => {
    initializeFormData(
      id,
      roles,
      user,
      isSuperAdmin as boolean,
      setForm,
      setPermissionTypes,
      setCurrentFilter,
      getResponsesForCurrentPage,
      setFirstRun,
      setLoading,
    );
  }, [roles]);

  useEffect(() => {
    if (form && permissionTypes.length > 0) {
      createTableColumns(form, permissionTypes, currentViewConfig);
    }
  }, [responsesHaveParents, currentViewConfig, form, permissionTypes, fieldOptions]);

  useEffect(() => {
    setResponsesHaveParents(allFilteredResponses.some((response) => response.parentResponse));
  }, [allFilteredResponses]);

  useEffect(() => {
    if (sorting.length > 0) {
      searchBySorting(sorting);
    }
  }, [sorting]);

  /** pagination.pageIndex, pagination.pageSize changed pagination btns */
  useEffect(() => {
    if (form) {
      changePageSizeAndRefreshTable(pagination.pageSize, pagination.pageIndex);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  /** columnFilters changed */
  useEffect(() => {
    searchByColumn(
      (form, permissionTypes) => createTableColumns(form, permissionTypes, currentViewConfig),
      columnFilters,
      mainSearch,
    );
  }, [columnFilters, currentViewConfig, fieldOptions]);

  /** Quick Edit mode changed - recreate columns */
  useEffect(() => {
    if (form) {
      createTableColumns(form, permissionTypes, currentViewConfig);
    }
  }, [isQuickEditMode, fieldOptions]);

  /** Row selection changed while in quick edit mode - handle edit mode changes and recreate columns */
  useEffect(() => {
    if (form && isQuickEditMode) {
      handleRowSelectionChange(rowSelection);
      createTableColumns(form, permissionTypes, currentViewConfig);
    }
  }, [rowSelection, isQuickEditMode, handleRowSelectionChange, fieldOptions]);

  /** Force re-render when forceRenderCounter changes */
  useEffect(() => {
    if (form && isQuickEditMode) {
      createTableColumns(form, permissionTypes, currentViewConfig);
    }
  }, [forceRenderCounter, fieldOptions]);

  /** if shouldRefreshPage true - get data in page again */
  // useEffect(() => {
  //   if (shouldRefreshPage) {
  //     setShouldRefreshPage(false);

  //     let formId: any = id;
  //     if (formId && typeof formId === "string") {
  //       formId = parseInt(formId);
  //     }
  //     setLoadingTable(true);

  //     getFormById(formId)
  //       .then((form: any) => {
  //         setForm(form);
  //         setRowSelection({});
  //         getResponsesForCurrentPage(form, permissionTypes);
  //       })
  //       .catch((e) => {
  //         setLoadingTable(false);
  //         showErrorNotification("שליפת הטופס לא הצליחה");
  //       });
  //   }
  // }, [shouldRefreshPage]);

  /** when search value changes */
  useEffect(() => {
    const abortController = new AbortController();
    if (firstRun === false) {
      setPagination({ ...pagination, pageIndex: 0 });
      if (search && search !== "") {
        let foundMainSearch = false;
        let arr: any[] = [...columnFilters];
        arr.forEach((element: any) => {
          if (element.searchField === "") {
            foundMainSearch = true;
            element.searchText = search;
          }
        });
        if (foundMainSearch === false) {
          arr = [...columnFilters];
          arr.push({ searchField: "", searchText: search });
          setMainSearch(search);
        }
        doSearch(
          (form, permissionTypes) => createTableColumns(form, permissionTypes, currentViewConfig),
          arr,
          abortController,
        );
      } else if (form) {
        let searchWithoutMain = [...columnFilters];
        if (search === "") {
          searchWithoutMain.map((e: any) => {
            if (e.searchField === "") {
              e.searchText = "";
            }
          });
        }
        setMainSearch("");
        searchByColumn(
          (form, permissionTypes) => createTableColumns(form, permissionTypes, currentViewConfig),
          [...searchWithoutMain],
          "",
        );
      }
    }
    return () => {
      abortController.abort();
    };
  }, [search]);

  const getResponseDetails = (responseId: number) => {
    const responseChildren = responsesWithChildren.filter((response) => {
      const parentResponse = response.parentResponse?.split(";") || []; // parentResponse = "formId;responseId"
      if (!parentResponse || parentResponse.length === 0) {
        return [];
      }
      return parentResponse[1] === responseId.toString();
    });

    if (responseChildren.length === 0) {
      return undefined; // if we return undefined, the details arrow will be disabled and we won't display empty tables
    }
    return (
      <DetailsContainer key={responseId}>
        {childrenForms?.map((childForm, index) => {
          const childResponses = responseChildren.filter(
            (response) => response.form_id === childForm.id,
          );
          const responseTitle =
            form?.fields?.find(
              (field) =>
                field.connectedFormId && field.connectedFormId === childResponses[0]?.form_id,
            )?.displayName || "תגובה";
          return (
            <ResponseDetailsPanel
              responses={childResponses}
              form={childForm}
              key={index}
              parentFormId={form.id}
              title={responseTitle}
            />
          );
        })}
      </DetailsContainer>
    );
  };

  /** get Responses by Form id */
  const getResponsesForCurrentPage = async (form: Form, permissionTypes1: number[]) => {
    try {
      let responses: ResponseCount = await getResponsesCount(form.id);
      let responsesCount: number = responses?.count || 0;
      setAllResponsesCount(responsesCount);
      setSearchCount(responsesCount);
      let filter: any = {
        form_id: form.id,
        pageSize: pagination.pageSize,
        pageNumber: pagination.pageIndex + 1,
        searchFilters: [],
      };
      try {
        let responses: any[] = await getResponses(filter);
        if (responses) {
          // Add debugging to see what we're getting from the database
          // Check for any malformed responses
          const validResponses = responses.filter((response, index) => {
            if (!response || typeof response !== "object") {
              console.error(`Invalid response at index ${index}:`, response);
              return false;
            }
            if (!response.id) {
              console.error(`Response missing ID at index ${index}:`, response);
              return false;
            }
            return true;
          });

          if (validResponses.length !== responses.length) {
            console.warn(
              `Filtered out ${responses.length - validResponses.length} invalid responses`,
            );
          }

          setAllFilteredResponses(validResponses);
          setLoadingTable(false);
          setLoadingInsideTable(false);
        }
      } catch (error) {
        console.error("Error getting responses:", error);
        showErrorNotification("שליפת התגובות לעמוד זה נכשלה"); //Failed get responses for current page:" + error);
        setLoadingTable(false);
        setLoadingInsideTable(false);
      } finally {
        setLoadingTable(false);
        setLoadingInsideTable(false);
      }
    } catch (error) {
      showErrorNotification("שליפת כמות התגובות נכשלה"); //Failed to fetch responses count:" + error);
      setLoadingTable(false);
      setLoadingInsideTable(false);
    } finally {
      setLoadingTable(false);
      setLoadingInsideTable(false);
    }
  };

  // Get the data to display in the table (combined responses in edit mode)
  const tableData = isQuickEditMode ? getCombinedResponses() : allFilteredResponses;

  const responsesTable = useResponsesTable({
    columns: columns,
    data: tableData,
    searchCount,
    sorting,
    setSorting,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    loadingInsideTable: loadingInsideTable || loadingConnections,
    rowSelection,
    setRowSelection: (newSelection) => {
      setRowSelection(newSelection);
      // Handle row selection changes for edit mode toggling
      if (isQuickEditMode) {
        handleRowSelectionChange(newSelection);
      }
    },
    getResponseDetails,
    responsesWithChildren,
    responsesHaveParents,
    currentViewConfig,
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <PageWrapper>
      <MainContentWrapper>
        <TopSection>
          <Header form={form} />
          <ResponseToolbar
            deleteAllResponsesConfirmation={deleteAllResponsesConfirmation}
            deleteFormFromBtn={deleteFormFromBtn}
            form={form}
            responsesCount={allResponsesCount}
            getResponsesForCurrentPage={getResponsesForCurrentPage}
            setShowSharePopup={setShowSharePopup}
            permissionTypes={permissionTypes}
            setShouldRefreshPage={setShouldRefreshPage}
          />
        </TopSection>
        <SearchInfo search={search} setSearch={setSearch} allResponsesCount={allResponsesCount} />
        {/* <OperationsContainer
          user={user}
          form={form}
          allResponsesCount={allResponsesCount}
          deleteAllResponsesConfirmation={deleteAllResponsesConfirmation}
          currentFilter={currentFilter}
          viewResponse={viewResponse}
          editResponse={editResponse}
          deleteAllSelectedResponses={deleteAllSelectedResponses}
          rowSelection={rowSelection}
          permissionTypes={permissionTypes}
          // View management props
          allViews={allViews}
          selectedViewId={selectedViewId}
          handleViewDropdownChange={handleViewDropdownChange}
          setIsSidePanelOpen={setIsSidePanelOpen}
          isSidePanelOpen={isSidePanelOpen}
          isQuickEditMode={isQuickEditMode}
          onToggleQuickEdit={toggleQuickEdit}
          onSaveChanges={saveAndExit}
          onCancelChanges={cancelAndExit}
          onAddNewResponse={addNewResponse}
          hasUnsavedChanges={hasUnsavedChanges}
          isEditButtonDisabled={isEditButtonDisabled}
          editButtonDisabledReason={editButtonDisabledReason}
        /> */}
        <ContentContainer>
          <MainContent $sidePanelOpen={isSidePanelOpen}>
            {loadingTable ? <Loader /> : <MaterialReactTable table={responsesTable} />}
          </MainContent>
        </ContentContainer>

        {showSharePopup && (
          <UserPicker
            form={form}
            roles={roles}
            currentUser={user}
            closeSharePopupAndRefreshForm={(users, updatedForm) => {
              // if we got updated form from UserPicker, use it to update the form state, otherwise use existing form and just update users
              const formToUpdate = updatedForm || { ...form, users };

              setForm(formToUpdate);
              setShowSharePopup(false);
            }}
          />
        )}
        {showConfirmMsg && (
          <ConfirmPopup
            image={deleteResponseImg}
            msg={confirmMsg}
            okFunc={confirmOkFunc}
            closePopup={() => setShowConfirmMsg(false)}
            okBtnText={confirmBtnText ? confirmBtnText : "מחק תגובה"}
          />
        )}
        {showDeleteAllConfirmPopup && (
          <ConfirmPopup
            messageType="error"
            msg={confirmMsg}
            okBtnText="מחק את כל התגובות"
            okFunc={confirmOkFunc}
            closePopup={() => setShowDeleteAllConfirmPopup(false)}
          />
        )}
      </MainContentWrapper>
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        title="תצוגת טבלה"
        form={form}
        user={user}
        onSaveView={handleSaveView}
        onLoadView={handleLoadView}
        onDeleteView={handleDeleteView}
        onApplyView={handleApplyView}
        currentView={currentView}
        savedViews={allViews}
        permissionTypes={permissionTypes}
      />
    </PageWrapper>
  );
}

export default ResponsesPage;
