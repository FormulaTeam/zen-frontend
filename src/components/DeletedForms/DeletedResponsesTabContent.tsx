import React, { useEffect, useRef, useMemo } from "react";
import { useTheme, Grow } from "@mui/material";
import ReactLoading from "react-loading";
import { useLegacyFormsData } from "../../hooks/useGetFormsData";
import DeletedResponseItem from "./DeletedResponseItem";
import {
  FormsGrid,
  LoadingBox,
  EmptyMessage,
  TopBarWrapper,
  FullWidthBox,
} from "../../pages/DeletedForms/styled";
import { useDeletedResponses, getResponseKey } from "../../hooks/useDeletedResponses";
import { User } from "../../utils/interfaces";
import type { FormDto } from "../../types/shared";
import DeletedFormHeader from "./DeletedFormHeader";
import DeletedFormsToolbar from "./DeletedFormsToolbar";
import DeletedSelection from "./DeletedSelection";
import { SelectionType } from "../../types/enums/filtersAndSorts.enum";
import { useDeletedForms } from "../../hooks/useDeletedForms";

interface DeletedResponsesTabContentProps {
  user: User;
  currentDeletedForm: FormDto | null;
  handleRestoreForm: (formId: number) => Promise<void>;
}

export default function DeletedResponsesTabContent({
  user,
  currentDeletedForm,
  handleRestoreForm,
}: DeletedResponsesTabContentProps) {
  const theme = useTheme();
  const listRef = useRef<HTMLDivElement>(null);
  const { formsData, getData, setFormsData } = useLegacyFormsData(1000);

  const {
    responses,
    isLoading,
    fetchResponses,
    searchValue,
    handleSearch,
    loadMore,
    restoreResponseById,
    mounted,
    setMounted,
    filters,
    setFilters,
    sortValue,
    setSortValue,
    selectedResponseKeys,
    handleSelect,
    handleDeselect,
    restoreSelectedResponses,
    cancelSelection,
  } = useDeletedResponses(user, formsData, getData, currentDeletedForm);

  const { forms } = useDeletedForms(user, () => {}, filters);

  useEffect(() => {
    if (!mounted) {
      fetchResponses(1);
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (currentDeletedForm) {
      setFormsData([currentDeletedForm]);
      return;
    }

    if (!mounted) return;
    getData(1, { query: {} });
  }, [responses, searchValue]);

  useEffect(() => {
    if (!mounted) return;
    fetchResponses(1, searchValue, filters, sortValue);
  }, [filters, sortValue]);

  /**
   * Combines forms from both formsData (fetched with responses) and useDeletedForms (fetched by filters),
   * ensuring all relevant forms are available for lookup by form_id.
   */
  const formMap = useMemo(() => {
    const combinedForms = [...formsData, ...forms];
    const uniqueForms = new Map<number, FormDto>();

    combinedForms.forEach((form) => {
      if (!uniqueForms.has(form.id)) {
        uniqueForms.set(form.id, form);
      }
    });

    return uniqueForms;
  }, [formsData, forms]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      loadMore();
    }
  };

  return (
    <>
      {currentDeletedForm ? (
        <DeletedFormHeader
          form={currentDeletedForm}
          handleRestoreForm={handleRestoreForm}
          responses={responses}
        />
      ) : (
        <DeletedFormsToolbar
          sortValue={sortValue}
          onSortChange={setSortValue}
          deletedBy={filters.deletedBy}
          createdBy={filters.createdBy}
          onDeletedByChange={(value) => setFilters((prev) => ({ ...prev, deletedBy: value }))}
          onCreatedByChange={(value) => setFilters((prev) => ({ ...prev, createdBy: value }))}
          searchValue={searchValue}
          handleSearch={handleSearch}
          allowSearch={true}
        />
      )}

      {!currentDeletedForm && (
        <TopBarWrapper>
          {selectedResponseKeys.length > 0 && (
            <DeletedSelection
              selectedIds={selectedResponseKeys}
              onRestore={restoreSelectedResponses}
              cancelSelection={cancelSelection}
              selectionType={SelectionType.Responses}
            />
          )}
        </TopBarWrapper>
      )}

      {isLoading ? (
        <LoadingBox>
          <ReactLoading type="spinningBubbles" color={theme.palette.primary.main} />
        </LoadingBox>
      ) : !isLoading && responses.length === 0 ? (
        <EmptyMessage variant="subtitle1">לא נמצאו תגובות</EmptyMessage>
      ) : (
        <FormsGrid container spacing={3} ref={listRef} onScroll={handleScroll}>
          {responses.map((res) => {
            const key = getResponseKey(res.form_id, res.index);
            return (
              <Grow in timeout={300} key={key}>
                <FullWidthBox>
                  <DeletedResponseItem
                    response={res}
                    form={formMap.get(res.form_id)}
                    handleRestoreResponse={restoreResponseById}
                    currentDeletedForm={currentDeletedForm}
                    isSelected={selectedResponseKeys.includes(key)}
                    onSelect={() => handleSelect(res.form_id, res.id)}
                    onDeselect={() => handleDeselect(res.form_id, res.id)}
                  />
                </FullWidthBox>
              </Grow>
            );
          })}
        </FormsGrid>
      )}
    </>
  );
}
