import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Box, useTheme } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useGetDeletedForms, useGetSoftDeletedResponsesGlobal, restoreForm } from "../../api/formsApi";
import { restoreResponse, restoreResponses } from "../../api/responsesApi";
import { getFormIconByName } from "../../utils/utils";
import queryClient from "../../api/queryClient";
import { IOrderBy, formsSortOption } from "../../types/enums/filtersAndSorts.enum";
import { useDebounce } from "../../hooks/utilsHooks/useDebounce";

// Modular Components
import { DeletedFormWithResponses } from "./types";
import DeletedFormsHeader from "./components/DeletedFormsHeader";
import DeletedFormsToolbar from "./components/DeletedFormsToolbar";
import DeletedFormsList from "./components/DeletedFormsList";
import DeletedResponsesList from "./components/DeletedResponsesList";
import DeletedFormsSelectionBar from "./components/DeletedFormsSelectionBar";

/**
 * Main Trash Page displaying soft-deleted forms and responses in tabs.
 */
function DeletedForms({ user }: { user: any }) {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  // Route-based state
  const scopeParam = searchParams.get("scope") || "forms";
  const activeTab = scopeParam === "responses" ? 1 : 0;
  const sortBy = searchParams.get("sortBy") || formsSortOption.DeletedAt;
  const sortDirection = (searchParams.get("sortDirection") as "asc" | "desc") || "desc";
  const hasResponsesFilter = searchParams.get("hasResponses") === "true" ? true : undefined;

  // Local state
  const [restoringFormId, setRestoringFormId] = useState<number | null>(null);
  const [restoringResponseId, setRestoringResponseId] = useState<string | null>(null);
  const [isBulkRestoring, setIsBulkRestoring] = useState(false);
  const [expandedForms, setExpandedForms] = useState<Record<number, boolean>>({});
  const [selectedFormIds, setSelectedFormIds] = useState<Set<number>>(new Set());
  const [selectedResponseIds, setSelectedResponseIds] = useState<Set<string>>(new Set());

  // Filter input states
  const [searchTerm, setSearchTerm] = useState("");
  const [createdBySearch, setCreatedBySearch] = useState("");
  const [deletedBySearch, setDeletedBySearch] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedCreatedBy = useDebounce(createdBySearch, 300);
  const debouncedDeletedBy = useDebounce(deletedBySearch, 300);

  // Queries
  const {
    data: deletedFormsData,
    isLoading: isDeletedFormsLoading,
    fetchNextPage: fetchNextDeletedForms,
    hasNextPage: hasNextDeletedForms,
    isFetchingNextPage: isFetchingNextDeletedForms,
  } = useGetDeletedForms({
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
  } = useGetSoftDeletedResponsesGlobal({
    query: debouncedSearchTerm || undefined,
    createdBy: debouncedCreatedBy || undefined,
    deletedBy: debouncedDeletedBy || undefined,
    sortBy: sortBy === formsSortOption.DeletedAt ? formsSortOption.CreatedAt : sortBy,
    orderBy: sortDirection === "desc" ? IOrderBy.DESC : IOrderBy.ASC,
  });

  const deletedForms = useMemo(() => (deletedFormsData?.pages.flat() as DeletedFormWithResponses[]) || [], [deletedFormsData]);
  const activeFormsWithDeleted = useMemo(() => (activeFormsData?.pages.flat() as DeletedFormWithResponses[]) || [], [activeFormsData]);

  // Callbacks
  const handleToggleSelectForm = (formId: number) => {
    setSelectedFormIds((prev) => {
      const next = new Set(prev);
      if (next.has(formId)) next.delete(formId);
      else next.add(formId);
      return next;
    });
  };

  const handleToggleSelectResponse = (responseId: string) => {
    setSelectedResponseIds((prev) => {
      const next = new Set(prev);
      if (next.has(responseId)) next.delete(responseId);
      else next.add(responseId);
      return next;
    });
  };

  const handleToggleHasResponses = () => {
    const newParams = new URLSearchParams(searchParams);
    if (hasResponsesFilter) newParams.delete("hasResponses");
    else newParams.set("hasResponses", "true");
    setSearchParams(newParams, { replace: true });
  };

  const handleSortChange = (newSortBy: string, newDirection: "asc" | "desc") => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sortBy", newSortBy);
    newParams.set("sortDirection", newDirection);
    setSearchParams(newParams, { replace: true });
  };

  const handleScopeChange = (newScope: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("scope", newScope);
    setSearchParams(newParams, { replace: true });
    setExpandedForms({});
    setSelectedFormIds(new Set());
    setSelectedResponseIds(new Set());
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCreatedBySearch("");
    setDeletedBySearch("");
  };

  const toggleFormExpanded = (formId: number) => {
    setExpandedForms((prev) => ({ ...prev, [formId]: !prev[formId] }));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (activeTab === 0 && hasNextDeletedForms && !isFetchingNextDeletedForms) fetchNextDeletedForms();
      else if (activeTab === 1 && hasNextActiveForms && !isFetchingNextActiveForms) fetchNextActiveForms();
    }
  };

  const handleRestoreFormClick = async (formId: number) => {
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
  };

  const handleRestoreResponseClick = async (formId: number, responseId: string) => {
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
  };

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

  const getIconContent = (iconName: string | null) => {
    const iconSrc = getFormIconByName(iconName ?? undefined);
    if (typeof iconSrc === "string") return <img src={iconSrc} alt={iconName ?? "form icon"} />;
    if (iconSrc) {
      const IconComponent = iconSrc;
      return <IconComponent />;
    }
    return <KeyboardArrowDownIcon />;
  };

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", bgcolor: "#F8FAFC", overflow: "hidden" }}>
      <Box sx={{ display: "flex", flexDirection: "column", width: "85%", minWidth: "900px", height: "100%" }}>
        <DeletedFormsHeader />

        <DeletedFormsToolbar
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

        {/* Scrollable Container with Right-side scrollbar trick */}
        <Box
          className="main-page-content-wrapper deleted-forms-scroll-container"
          sx={{ pt: 0, flex: 1, overflowY: "auto", direction: "ltr" }}
          onScroll={handleScroll}
        >
          <Box sx={{ direction: "rtl", width: "100%" }}>
            {activeTab === 0 ? (
              <DeletedFormsList
                deletedForms={deletedForms}
                isLoading={isDeletedFormsLoading}
                isFetchingNextPage={isFetchingNextDeletedForms}
                selectedFormIds={selectedFormIds}
                expandedForms={expandedForms}
                restoringFormId={restoringFormId}
                onToggleSelect={handleToggleSelectForm}
                onToggleExpand={toggleFormExpanded}
                onRestore={handleRestoreFormClick}
                onClearFilters={clearFilters}
                getIconContent={getIconContent}
              />
            ) : (
              <DeletedResponsesList
                activeFormsWithDeleted={activeFormsWithDeleted}
                isLoading={isActiveFormsLoading}
                isFetchingNextPage={isFetchingNextActiveForms}
                selectedResponseIds={selectedResponseIds}
                expandedForms={expandedForms}
                restoringResponseId={restoringResponseId}
                onToggleSelectResponse={handleToggleSelectResponse}
                onToggleExpand={toggleFormExpanded}
                onRestoreResponse={handleRestoreResponseClick}
                onClearFilters={clearFilters}
                getIconContent={getIconContent}
              />
            )}
          </Box>
        </Box>

        <DeletedFormsSelectionBar
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
  );
}

export default DeletedForms;
