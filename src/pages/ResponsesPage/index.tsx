import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { MaterialReactTable } from "material-react-table";
import { useQueries } from "@tanstack/react-query";
import { getResponses, getResponsesCount } from "../../api";
import apiClient from "../../api/config";
import { useGetForm } from "../../api/formsApi";
import { Form } from "../../utils/interfaces";
import { FieldTypeIds, ResponseForm } from "../../utils/interfaces";
import { ResponseCount } from "../../types/interfaces/responses.types";
import { ViewColumn } from "../../types/interfaces/tableViews.types";
import { showErrorNotification } from "../../utils/utils";
import UserPicker from "../../components/USerPicker/UserPicker";
import ConfirmPopup from "../../popups/ConfirmPopup/ConfirmPopup";
import ResponseToolbar from "../../components/ResponseToolbar/ResponseToolbar";
import Loader from "../../components/Responses/Loader";
import Header from "../../components/Responses/Header";
import SearchInfo from "../../components/Responses/SearchInfo";
import ResponseDetailsPanel from "../../components/ResponseDetailsPanel/ResponseDetailsPanel";
import SidePanel from "../../components/SidePanel/SidePanel";
import { useSuperAdmin } from "../../contexts/SuperAdminContext";
import { useInitializeFormData } from "../../hooks/useInitializeFormData";
import { useViewManager } from "../../hooks/useViewManager";
import { useResponsesTable } from "../../hooks/useResponsesTable";
import { useTableColumns } from "../../hooks/useTableColumns";
import { useResponsesList } from "../../hooks/useResponsesList";
import { useQuickEdit } from "../../hooks/useQuickEdit";
import { useConnectedFormOptions } from "../../hooks/useConnectedFormOptions";
import {
  DetailsContainer,
  MainContentWrapper,
  TopSection,
  ContentContainer,
  MainContent,
  PageWrapper,
} from "./styled";
import deleteResponseImg from "../../images/delete_response.png";

const ResponseRowDetails = ({
  parentForm,
  parentResponseId,
}: {
  parentForm: Form;
  parentResponseId: string;
}) => {
  // Find all "connected form" fields (child forms) in the parent form schema
  const childFormFields = useMemo(
    () => parentForm.fields.filter((f) => f.typeId === FieldTypeIds.form && f.connectedFormId),
    [parentForm.fields],
  );

  // child form schemas
  const childFormsQueries = useQueries({
    queries: childFormFields.map((field) => {
      const childId = field.connectedFormId!;
      return {
        queryKey: ["form", childId] as const,
        queryFn: async () => {
          const res = await apiClient.get<Form>(`/forms/${childId}`);
          return res.data;
        },
        enabled: Boolean(childId),
        staleTime: 5 * 60 * 1000,
      };
    }),
  });

  const childForms = childFormsQueries.map((q) => q.data).filter(Boolean) as Form[];

  // child responses (per child form)
  const childResponsesQueries = useQueries({
    queries: childFormFields.map((field) => {
      const childFormId = field.connectedFormId!;
      const parentKey = `${parentForm.id};${parentResponseId}`;

      return {
        queryKey: ["childResponses", childFormId, parentKey] as const,
        queryFn: async () => {
          const res = await getResponses({
            form_id: childFormId,
            query: {
              parentResponse: parentKey,
            },
          });
          return (res || []) as ResponseForm[];
        },
        enabled: Boolean(childFormId) && Boolean(parentResponseId),
        staleTime: 30_000,
      };
    }),
  });

  const isLoading =
    childFormsQueries.some((q) => q.isLoading) || childResponsesQueries.some((q) => q.isLoading);

  const hasError =
    childFormsQueries.some((q) => q.isError) || childResponsesQueries.some((q) => q.isError);

  if (isLoading) return <div style={{ padding: 12 }}>טוען…</div>;
  if (hasError) return <div style={{ padding: 12 }}>שגיאה בטעינת טפסי הבת / תגובות הבת</div>;

  // Build map: childFormId -> responses
  const responsesByChildFormId = new Map<number, ResponseForm[]>();
  childResponsesQueries.forEach((q, idx) => {
    const childFormId = childFormFields[idx]?.connectedFormId;
    if (childFormId) responsesByChildFormId.set(childFormId, (q.data || []) as ResponseForm[]);
  });

  // If no child form has any responses -> don't render the detail panel at all
  const hasAnyChildren = childForms.some(
    (cf) => (responsesByChildFormId.get(cf.id)?.length ?? 0) > 0,
  );

  if (!hasAnyChildren) return null;

  return (
    <DetailsContainer key={parentResponseId}>
      {childForms.map((childForm, index) => {
        const childResponses = responsesByChildFormId.get(childForm.id) ?? [];
        if (childResponses.length === 0) return null;

        const responseTitle =
          childFormFields.find((f) => f.connectedFormId === childForm.id)?.displayName || "תגובה";

        return (
          <ResponseDetailsPanel
            key={`${childForm.id}-${index}`}
            responses={childResponses}
            form={childForm}
            parentFormId={parentForm.id}
            title={responseTitle}
          />
        );
      })}
    </DetailsContainer>
  );
};

const ResponsesPage = ({ user, shouldRefreshPage, setShouldRefreshPage, roles }: any) => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [currentViewConfig, setCurrentViewConfig] = useState<ViewColumn[] | undefined>();
  const [responsesHaveParents, setResponsesHaveParents] = useState(false);

  const { id } = useParams();
  const { isSuperAdmin } = useSuperAdmin();

  const {
    data: formFromQuery,
    isLoading: formLoading,
    isError: formIsError,
  } = useGetForm({ formId: id });

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

  // Keep local "form" in sync with query result
  useEffect(() => {
    if (formFromQuery) setForm(formFromQuery);
  }, [formFromQuery, setForm]);

  // Show parent column only if at least one row has parentResponse
  useEffect(() => {
    setResponsesHaveParents(allFilteredResponses.some((r: any) => Boolean(r?.parentResponse)));
  }, [allFilteredResponses]);

  const { initializeFormData } = useInitializeFormData();

  const { fieldOptions, isLoading: loadingConnections } = useConnectedFormOptions({
    formFields: form?.fields,
  });

  const {
    isQuickEditMode,
    editedData,
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
    editedData,
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
    setSorting,
    tableColumns: columns,
  });

  // Init: permissions + first page load
  useEffect(() => {
    if (!form) return;
    initializeFormData(
      form,
      roles,
      user,
      isSuperAdmin as boolean,
      setPermissionTypes,
      setCurrentFilter,
      getResponsesForCurrentPage,
      setFirstRun,
      setLoading,
    );
  }, [form, roles, user, isSuperAdmin]);

  // Rebuild columns whenever their true inputs change
  useEffect(() => {
    if (form && permissionTypes.length > 0) {
      createTableColumns(form, permissionTypes, currentViewConfig);
    }
  }, [
    currentViewConfig,
    form,
    permissionTypes,
    fieldOptions,
    isQuickEditMode,
    responsesHaveParents,
  ]);

  // Sorting triggers a search
  useEffect(() => {
    if (sorting.length > 0) searchBySorting(sorting);
  }, [sorting]);

  // Pagination changes trigger page fetch
  useEffect(() => {
    if (form) changePageSizeAndRefreshTable(pagination.pageSize, pagination.pageIndex);
  }, [pagination.pageIndex, pagination.pageSize]);

  // Column filters trigger a search
  useEffect(() => {
    searchByColumn(
      (f: Form, p: number[]) => createTableColumns(f, p, currentViewConfig),
      columnFilters,
      mainSearch,
    );
  }, [columnFilters, currentViewConfig, fieldOptions]);

  // Quick edit: keep selection + columns in sync
  useEffect(() => {
    if (form && isQuickEditMode) {
      handleRowSelectionChange(rowSelection);
      createTableColumns(form, permissionTypes, currentViewConfig);
    }
  }, [rowSelection, isQuickEditMode, handleRowSelectionChange, fieldOptions]);

  // Quick edit: re-render columns when forcing refresh
  useEffect(() => {
    if (form && isQuickEditMode) {
      createTableColumns(form, permissionTypes, currentViewConfig);
    }
  }, [forceRenderCounter, fieldOptions]);

  // Global search box effect (server-side)
  useEffect(() => {
    const abortController = new AbortController();

    if (firstRun === false) {
      setPagination({ ...pagination, pageIndex: 0 });

      if (search && search !== "") {
        const foundMainSearch = columnFilters.some((el: any) => el.searchField === "");
        const arr = foundMainSearch
          ? columnFilters.map((el: any) =>
              el.searchField === "" ? { ...el, searchText: search } : el,
            )
          : [...columnFilters, { searchField: "", searchText: search }];

        if (!foundMainSearch) setMainSearch(search);

        doSearch(
          (f: Form, p: number[]) => createTableColumns(f, p, currentViewConfig),
          arr,
          abortController,
        );
      } else if (form) {
        const searchWithoutMain = columnFilters.map((e: any) =>
          e.searchField === "" ? { ...e, searchText: "" } : e,
        );

        setMainSearch("");
        searchByColumn(
          (f: Form, p: number[]) => createTableColumns(f, p, currentViewConfig),
          searchWithoutMain,
          "",
        );
      }
    }

    return () => abortController.abort();
  }, [search]);

  // Row expansion (connected forms)
  const enableRowExpanding =
    Boolean(form) &&
    form.fields.some((f: any) => f.typeId === FieldTypeIds.form && f.connectedFormId);

  const getResponseDetails = (responseId: string | number) => {
    if (!form || !enableRowExpanding) return undefined;
    return <ResponseRowDetails parentForm={form} parentResponseId={String(responseId)} />;
  };

  // Page fetch
  const getResponsesForCurrentPage = async (f: Form, _permissionTypes1: number[]) => {
    try {
      const countRes: ResponseCount = await getResponsesCount(f.id);
      const responsesCount: number = countRes?.count || 0;

      setAllResponsesCount(responsesCount);
      setSearchCount(responsesCount);

      const filter: any = {
        form_id: f.id,
        pageSize: pagination.pageSize,
        pageNumber: pagination.pageIndex + 1,
        searchFilters: [],
      };

      try {
        const responses: any[] = await getResponses(filter);

        const validResponses = (responses || []).filter((response, index) => {
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

        setAllFilteredResponses(validResponses);
      } catch (error) {
        console.error("Error getting responses:", error);
        showErrorNotification("שליפת התגובות לעמוד זה נכשלה");
      } finally {
        setLoadingTable(false);
        setLoadingInsideTable(false);
      }
    } catch {
      showErrorNotification("שליפת כמות התגובות נכשלה");
      setLoadingTable(false);
      setLoadingInsideTable(false);
    }
  };

  // Table wiring
  const tableData = isQuickEditMode ? getCombinedResponses() : allFilteredResponses;

  const responsesTable = useResponsesTable({
    columns,
    data: tableData,
    searchCount,
    sorting,
    setSorting,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    loadingInsideTable: loadingInsideTable || loadingConnections || formLoading,
    rowSelection,
    setRowSelection: (newSelection: any) => {
      setRowSelection(newSelection);
      if (isQuickEditMode) handleRowSelectionChange(newSelection);
    },
    getResponseDetails: (id: any) => getResponseDetails(id),
    enableRowExpanding,
    currentViewConfig,
  });

  if (loading || formLoading) return <Loader />;
  if (formIsError) return <div style={{ padding: 12 }}>שגיאה בטעינת הטופס</div>;
  if (!form) return <div style={{ padding: 12 }}>טופס לא נמצא</div>;

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
            closeSharePopupAndRefreshForm={(users: any, updatedForm: any) => {
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
