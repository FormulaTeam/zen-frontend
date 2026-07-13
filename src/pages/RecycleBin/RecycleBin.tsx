import React, { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Box } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useGetRecycleBinForms, useGetRecycleBinResponses, restoreForm } from "../../api/formsApi";
import { restoreResponse, restoreResponses } from "../../api/responsesApi";
import { getFormIconByName } from "../../utils/utils";
import queryClient from "../../api/queryClient";
import { IOrderBy, formsSortOption } from "../../types/enums/filtersAndSorts.enum";
import { useDebounce } from "../../hooks/utilsHooks/useDebounce";
import { User } from "../../utils/interfaces";

import { RecycleBinProvider } from "./context/RecycleBinContext";
import { RecycleBinItemWithResponses } from "./types";
import RecycleBinHeader from "./components/RecycleBinHeader";
import RecycleBinToolbar from "./components/RecycleBinToolbar";
import RecycleBinList from "./components/RecycleBinList";
import RecycleBinResponsesList from "./components/RecycleBinResponsesList";
import RecycleBinSelectionBar from "./components/RecycleBinSelectionBar";

function RecycleBin({ user }: { user: User | null }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const scopeParam = searchParams.get("scope") || "forms";
  const activeTab = scopeParam === "responses" ? 1 : 0;
  const sortBy = searchParams.get("sortBy") || formsSortOption.DeletedAt;
  const sortDirection = (searchParams.get("sortDirection") as "asc" | "desc") || "desc";
  const hasResponsesFilter = searchParams.get("hasResponses") === "true" ? true : undefined;

  const [restoringFormId, setRestoringFormId] = useState<number | null>(null);
  const [restoringResponseId, setRestoringResponseId] = useState<string | null>(null);
  const [isBulkRestoring, setIsBulkRestoring] = useState(false);
  const [expandedForms, setExpandedForms] = useState<Record<number, boolean>>({});
  const [selectedFormIds, setSelectedFormIds] = useState<Set<number>>(new Set());
  const [selectedResponseIds, setSelectedResponseIds] = useState<Set<string>>(new Set());

  const [searchTerm, setSearchTerm] = useState("");
  const [createdBySearch, setCreatedBySearch] = useState("");
  const [deletedBySearch, setDeletedBySearch] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedCreatedBy = useDebounce(createdBySearch, 300);
  const debouncedDeletedBy = useDebounce(deletedBySearch, 300);

  const hasActiveFilters = !!(searchTerm || createdBySearch || deletedBySearch || hasResponsesFilter);

  const {
    data: deletedFormsData,
    isLoading: isDeletedFormsLoading,
    fetchNextPage: fetchNextDeletedForms,
    hasNextPage: hasNextDeletedForms,
    isFetchingNextPage: isFetchingNextDeletedForms,
  } = useGetRecycleBinForms({
    query: debouncedSearchTerm || undefined,
    createdBy: debouncedCreatedBy || undefined,
    deletedBy: debouncedDeletedBy || undefined,
    sortBy,
    orderBy: sortDirection === "desc" ? IOrderBy.DESC : IOrderBy.ASC,
    hasResponses: hasResponsesFilter,
  });

  const {
    data: activeFormsData,
    isLoading: isActiveFormsLoading,
    fetchNextPage: fetchNextActiveForms,
    hasNextPage: hasNextActiveForms,
    isFetchingNextPage: isFetchingNextActiveForms,
  } = useGetRecycleBinResponses({
    query: debouncedSearchTerm || undefined,
    createdBy: debouncedCreatedBy || undefined,
    deletedBy: debouncedDeletedBy || undefined,
    sortBy: sortBy === formsSortOption.DeletedAt ? formsSortOption.CreatedAt : sortBy,
    orderBy: sortDirection === "desc" ? IOrderBy.DESC : IOrderBy.ASC,
  });

  const deletedForms = useMemo(() => (deletedFormsData?.pages.flat() as RecycleBinItemWithResponses[]) || [], [deletedFormsData]);
  const activeFormsWithDeleted = useMemo(() => (activeFormsData?.pages.flat() as RecycleBinItemWithResponses[]) || [], [activeFormsData]);

  const handleToggleSelectForm = useCallback((id: number) => {
    setSelectedFormIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectResponse = useCallback((id: string) => {
    setSelectedResponseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleExpand = useCallback((id: number) => {
    setExpandedForms((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleRestoreForm = useCallback(async (formId: number) => {
    setRestoringFormId(formId);
    try {
      await restoreForm(formId);
      toast.success("הטופס שוחזר בהצלחה");
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    } catch (error) {
      toast.error("שחזור הטופס נכשל");
    } finally {
      setRestoringFormId(null);
    }
  }, []);

  const handleRestoreResponse = useCallback(async (formId: number, responseId: string) => {
    setRestoringResponseId(responseId);
    try {
      await restoreResponse(formId, responseId);
      toast.success("התגובה שוחזרה בהצלחה");
      queryClient.invalidateQueries({ queryKey: ["forms", "responses", "soft-deleted"] });
      queryClient.invalidateQueries({ queryKey: ["forms", "soft-deleted"] });
    } catch (error) {
      toast.error("שחזור התגובה נכשל");
    } finally {
      setRestoringResponseId(null);
    }
  }, []);

  const handleToggleHasResponses = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    if (hasResponsesFilter) newParams.delete("hasResponses");
    else newParams.set("hasResponses", "true");
    setSearchParams(newParams, { replace: true });
  }, [hasResponsesFilter, searchParams, setSearchParams]);

  const handleSortChange = useCallback((newSortBy: string, newDirection: "asc" | "desc") => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sortBy", newSortBy);
    newParams.set("sortDirection", newDirection);
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleScopeChange = useCallback((newScope: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("scope", newScope);
    setSearchParams(newParams, { replace: true });
    setExpandedForms({});
    setSelectedFormIds(new Set());
    setSelectedResponseIds(new Set());
  }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setCreatedBySearch("");
    setDeletedBySearch("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("hasResponses");
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (activeTab === 0 && hasNextDeletedForms && !isFetchingNextDeletedForms) fetchNextDeletedForms();
      else if (activeTab === 1 && hasNextActiveForms && !isFetchingNextActiveForms) fetchNextActiveForms();
    }
  }, [activeTab, hasNextDeletedForms, isFetchingNextDeletedForms, fetchNextDeletedForms, hasNextActiveForms, isFetchingNextActiveForms, fetchNextActiveForms]);

  const handleBulkRestore = async () => {
    setIsBulkRestoring(true);
    let successCount = 0;
    try {
      if (activeTab === 0) {
        const ids = Array.from(selectedFormIds);
        for (const id of ids) {
          try {
            await restoreForm(id);
            successCount++;
          } catch (e) {
            console.error(`Failed to restore form ${id}`, e);
          }
        }
        if (successCount > 0) {
          toast.success(`${successCount} טפסים שוחזרו בהצלחה`);
          setSelectedFormIds(new Set());
          queryClient.invalidateQueries({ queryKey: ["forms", "soft-deleted"] });
        }
      } else {
        const formResponseMap: Record<number, string[]> = {};
        activeFormsWithDeleted.forEach(form => {
          form.responses?.forEach(resp => {
            if (selectedResponseIds.has(resp.id)) {
              if (!formResponseMap[form.id]) formResponseMap[form.id] = [];
              formResponseMap[form.id].push(resp.id);
            }
          });
        });
        const formIds = Object.keys(formResponseMap).map(Number);
        for (const fId of formIds) {
          try {
            const respIds = formResponseMap[fId];
            await restoreResponses(fId, respIds);
            successCount += respIds.length;
          } catch (e) {
            console.error(`Failed to restore responses for form ${fId}`, e);
          }
        }
        if (successCount > 0) {
          toast.success(`${successCount} תגובות שוחזרו בהצלחה`);
          setSelectedResponseIds(new Set());
          queryClient.invalidateQueries({ queryKey: ["forms", "responses", "soft-deleted"] });
          queryClient.invalidateQueries({ queryKey: ["forms", "soft-deleted"] });
        }
      }
    } catch (error) {
      toast.error("שחזור המוני נכשל");
    } finally {
      setIsBulkRestoring(false);
    }
  };

  const getIconContent = useCallback((iconName: string | null) => {
    const iconSrc = getFormIconByName(iconName ?? undefined);
    if (typeof iconSrc === "string") return <img src={iconSrc} alt={iconName ?? "form icon"} />;
    if (iconSrc) {
      const IconComponent = iconSrc;
      return <IconComponent />;
    }
    return <KeyboardArrowDownIcon />;
  }, []);

  const contextValue = useMemo(() => ({
    restoringFormId,
    restoringResponseId,
    isBulkRestoring,
    expandedForms,
    selectedFormIds,
    selectedResponseIds,
    hasFilters: hasActiveFilters,
    onToggleSelectForm: handleToggleSelectForm,
    onToggleSelectResponse: handleToggleSelectResponse,
    onToggleExpand: handleToggleExpand,
    onRestoreForm: handleRestoreForm,
    onRestoreResponse: handleRestoreResponse,
    onClearFilters: clearFilters,
    getIconContent,
  }), [restoringFormId, restoringResponseId, isBulkRestoring, expandedForms, selectedFormIds, selectedResponseIds, hasActiveFilters, handleToggleSelectForm, handleToggleSelectResponse, handleToggleExpand, handleRestoreForm, handleRestoreResponse, clearFilters, getIconContent]);

  return (
    <RecycleBinProvider value={contextValue}>
      <Box sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", bgcolor: "#F8FAFC", overflow: "hidden" }}>
        <Box sx={{ display: "flex", flexDirection: "column", width: "85%", minWidth: "900px", height: "100%" }}>
          <RecycleBinHeader />
          <RecycleBinToolbar
            activeTab={activeTab}
            scopeParam={scopeParam}
            sortBy={sortBy}
            sortDirection={sortDirection}
            hasResponsesFilter={hasResponsesFilter}
            searchTerm={searchTerm}
            createdBySearch={createdBySearch}
            deletedBySearch={deletedBySearch}
            onSearchChange={setSearchTerm}
            onCreatedByChange={setCreatedBySearch}
            onDeletedByChange={setDeletedBySearch}
            onScopeChange={handleScopeChange}
            onSortChange={handleSortChange}
            onToggleHasResponses={handleToggleHasResponses}
          />

          <Box
            className="main-page-content-wrapper deleted-forms-scroll-container"
            sx={{ pt: 0, flex: 1, overflowY: "auto", direction: "ltr" }}
            onScroll={handleScroll}
          >
            <Box sx={{ direction: "rtl", width: "100%" }}>
              {activeTab === 0 ? (
                <RecycleBinList
                  deletedForms={deletedForms}
                  isLoading={isDeletedFormsLoading}
                  isFetchingNextPage={isFetchingNextDeletedForms}
                />
              ) : (
                <RecycleBinResponsesList
                  activeFormsWithDeleted={activeFormsWithDeleted}
                  isLoading={isActiveFormsLoading}
                  isFetchingNextPage={isFetchingNextActiveForms}
                />
              )}
            </Box>
          </Box>

          <RecycleBinSelectionBar
            selectedCount={activeTab === 0 ? selectedFormIds.size : selectedResponseIds.size}
            activeTab={activeTab}
            isBulkRestoring={isBulkRestoring}
            onClearSelection={() => {
              setSelectedFormIds(new Set());
              setSelectedResponseIds(new Set());
            }}
            onBulkRestore={handleBulkRestore}
          />
        </Box>
      </Box>
    </RecycleBinProvider>
  );
}

export default RecycleBin;
