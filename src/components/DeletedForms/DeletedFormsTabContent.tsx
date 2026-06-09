import React, { useState } from "react";
import ReactLoading from "react-loading";
import {
  FormsGrid,
  LoadingBox,
  TopBarWrapper,
  FullWidthBox,
} from "../../pages/DeletedForms/styled";
import DeletedFormItem from "./DeletedFormItem";
import DeletedFormsToolbar from "./DeletedFormsToolbar";
import { DeletedFormsFilters } from "../../hooks/useDeletedForms";
import DeletedSelection from "./DeletedSelection";
import Grow from "@mui/material/Grow";
import { EmptyStateWrapper } from "./styled";
import { Typography, useTheme } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

interface DeletedFormsTabContentProps {
  forms: any[];
  loadingForms: boolean;
  handleRestoreForm: (formId: number) => Promise<void>;
  setCurrentDeletedForm: (response: any) => void;
  filters: DeletedFormsFilters;
  setFilters: React.Dispatch<React.SetStateAction<DeletedFormsFilters>>;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

const DeletedFormsTabContent: React.FC<DeletedFormsTabContentProps> = ({
  forms,
  loadingForms,
  handleRestoreForm,
  setCurrentDeletedForm,
  filters,
  setFilters,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) => {
  const theme = useTheme();
  const [selectedFormIds, setSelectedFormIds] = useState<number[]>([]);

  const toggleSelect = (formId: number) => {
    setSelectedFormIds((prev) =>
      prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId],
    );
  };

  const restoreSelectedForms = async () => {
    for (const formId of selectedFormIds) {
      await handleRestoreForm(formId);
    }
    setSelectedFormIds([]);
  };

  const cancelSelection = () => {
    setSelectedFormIds([]);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 10 && hasNextPage && !isFetchingNextPage && !loadingForms) {
      fetchNextPage();
    }
  };

  return (
    <>
      <DeletedFormsToolbar
        sortValue={filters.sortValue ?? 7}
        onSortChange={(value) =>
          setFilters((prev) => ({
            ...prev,
            sortValue: value,
          }))
        }
        deletedBy={filters.deletedBy}
        createdBy={filters.createdBy}
        onDeletedByChange={(value) => setFilters((prev) => ({ ...prev, deletedBy: value }))}
        onCreatedByChange={(value) => setFilters((prev) => ({ ...prev, createdBy: value }))}
      />

      <TopBarWrapper>
        {selectedFormIds.length > 0 && (
          <DeletedSelection
            selectedIds={selectedFormIds}
            cancelSelection={cancelSelection}
            onRestore={restoreSelectedForms}
          />
        )}
      </TopBarWrapper>

      {loadingForms && !forms.length ? (
        <LoadingBox>
          <ReactLoading type="spinningBubbles" color="#1976d2" />
        </LoadingBox>
      ) : !forms.length ? (
        <EmptyStateWrapper>
          <DeleteOutlineIcon sx={{ fontSize: 80, color: theme.palette.text.disabled }} />
          <Typography variant="h6" color="text.secondary">
            סל המיחזור ריק
          </Typography>
          <Typography variant="body2" color="text.disabled">
            לא נמצאו טפסים שנמחקו עבור החיפוש הנוכחי
          </Typography>
        </EmptyStateWrapper>
      ) : (
        <FormsGrid container spacing={3} onScroll={handleScroll} style={{ overflowY: 'auto', flex: 1, maxHeight: 'calc(100vh - 200px)' }}>
          {forms.map((form) => (
            <Grow in timeout={300} key={form.id}>
              <FullWidthBox>
                <DeletedFormItem
                  form={form}
                  handleRestoreForm={handleRestoreForm}
                  setCurrentDeletedForm={setCurrentDeletedForm}
                  isSelected={selectedFormIds.includes(form.id)}
                  toggleSelect={toggleSelect}
                />
              </FullWidthBox>
            </Grow>
          ))}
          {isFetchingNextPage && (
            <LoadingBox style={{ width: '100%', marginTop: '16px' }}>
              <ReactLoading type="spin" color="#1976d2" height={30} width={30} />
            </LoadingBox>
          )}
        </FormsGrid>
      )}
    </>
  );
};

export default DeletedFormsTabContent;
