import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { MaterialReactTable } from "material-react-table";
import { useSuperAdmin } from "../../contexts/SuperAdminContext";
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
import { useResponsesTable } from "../../hooks/useResponsesTable";
import { useTableColumns } from "../../hooks/useTableColumns";
import { useResponsesList } from "../../hooks/useResponsesList";
import ResponseDetailsPanel from "../../components/ResponseDetailsPanel/ResponseDetailsPanel";
import SidePanel from "../../components/SidePanel/SidePanel";
import { ViewColumn } from "../../types/interfaces/tableViews.types";
import { useQuickEdit } from "../../hooks/useQuickEdit";
import { useConnectedFormOptions } from "../../hooks/useConnectedFormOptions";
import UserPicker from "../../components/USerPicker/UserPicker";
import ConfirmPopup from "../../popups/ConfirmPopup/ConfirmPopup";
import deleteResponseImg from "../../images/delete_response.png";
import { Form } from "../../utils/interfaces";
import { useResponsesQuery } from "../../hooks/useResponsesQuery";
import { useQueryClient } from "@tanstack/react-query";
import { OperationsContainer } from "../../components/Responses/OperationsContainer";

function ResponsesPage({ user, shouldRefreshPage, setShouldRefreshPage, roles }) {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [currentViewConfig, setCurrentViewConfig] = useState<ViewColumn[] | undefined>();
  const { id } = useParams();

  const {
    isLoading,
    setIsLoading,
    isLoadingInsideTable,
    isLoadingTable,
    setIsLoadingTable,
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
    setIsLoadingInsideTable,
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
    deleteFormFromBtn,
    confirmBtnText,
  } = useResponsesList({ setShouldRefreshPage, currentViewConfig, user });

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

  const { isSuperAdmin } = useSuperAdmin();
  const {
    initializeFormData,
    responsesHaveParents,
    setResponsesHaveParents,
    responsesWithChildren,
    childrenForms,
  } = useInitializeFormData();
  const { fieldOptions, isLoading: isLoadingConnections } = useConnectedFormOptions({
    formFields: form?.fields,
  });

  const queryClient = useQueryClient();

  const { data: responsesData, isLoading: isResponsesLoading } = useResponsesQuery({
    formId: form?.id,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
  });

  useEffect(() => {
    if (responsesData) {
      setAllFilteredResponses(responsesData.responses);
      setAllResponsesCount(responsesData.count);
      setSearchCount(responsesData.count);
      setIsLoadingTable(false);
      setIsLoadingInsideTable(false);
    }
  }, [responsesData]);

  const getResponsesForCurrentPage = async (form: Form) => {
    if (!form?.id) return;
    await queryClient.invalidateQueries({ queryKey: ["responses", form.id] });
  };

  // Initialize table columns with Quick Edit support
  const { createTableColumns } = useTableColumns(
    setColumns,
    fileOnClickHandler,
    isSynchedToMetro,
    sorting,
    setIsLoadingInsideTable,
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
      !!isSuperAdmin,
      setForm,
      setCurrentFilter,
      getResponsesForCurrentPage,
      setFirstRun,
      setIsLoading,
    );
  }, [roles]);

  useEffect(() => {
    if (form && permissionTypes.length > 0) {
      createTableColumns(form, permissionTypes);
    }
  }, [responsesHaveParents, currentViewConfig, form, permissionTypes, fieldOptions]);

  useEffect(() => {
    setResponsesHaveParents(allFilteredResponses.some((response) => response.parentResponse));
  }, [allFilteredResponses, setResponsesHaveParents]);

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
      if (!Array.isArray(response.mainResponses)) return false;

      return response.mainResponses.some((p) => Number(p?.index) === Number(responseId));
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
    loadingInsideTable: isLoadingInsideTable || isLoadingConnections || isResponsesLoading,
    rowSelection,
    setRowSelection: (newSelection) => {
      setRowSelection(newSelection);
      // Handle row selection changes for edit mode toggling
      if (isQuickEditMode) {
        handleRowSelectionChange(newSelection);
      }
    },
    // getResponseDetails,
    responsesWithChildren,
    currentViewConfig,
  });

  if (isLoading || isResponsesLoading) {
    return <Loader />;
  }

  return (
    <PageWrapper>
      <MainContentWrapper>
        <TopSection>
          <Header />
          {/* <ResponseToolbar
            deleteAllResponsesConfirmation={deleteAllResponsesConfirmation}
            deleteFormFromBtn={deleteFormFromBtn}
            form={form}
            responsesCount={allResponsesCount}
            getResponsesForCurrentPage={getResponsesForCurrentPage}
            setShowSharePopup={setShowSharePopup}
            permissionTypes={permissionTypes}
            setShouldRefreshPage={setShouldRefreshPage}
          /> */}
        </TopSection>
        <SearchInfo search={search} setSearch={setSearch} allResponsesCount={allResponsesCount} />
        <OperationsContainer
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
        />
        <ContentContainer>
          <MainContent $sidePanelOpen={isSidePanelOpen}>
            {isLoadingTable ? <Loader /> : <MaterialReactTable table={responsesTable} />}
          </MainContent>
        </ContentContainer>

        {showSharePopup && (
          <UserPicker
            form={form}
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
        title="ניהול תצוגות"
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
