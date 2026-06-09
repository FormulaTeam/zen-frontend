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
import { Typography, useTheme, Box } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import noDataImg from "../../images/noData2.png";

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
          <ReactLoading type="spin" color={theme.palette.primary.main} height={40} width={40} />
        </LoadingBox>
      ) : !forms.length ? (
        <EmptyStateWrapper>
          <Box
            component="img"
            src={noDataImg}
            alt="No Data"
            sx={{ width: 200, height: 200, opacity: 0.9, objectFit: "contain" }}
          />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
            סל המיחזור ריק
          </Typography>
          <Typography variant="body2" color="text.disabled">
            לא נמצאו טפסים שנמחקו עבור החיפוש הנוכחי
          </Typography>
        </EmptyStateWrapper>
      ) : (
        <FormsGrid container spacing={0} onScroll={handleScroll} style={{ overflowY: 'auto', flex: 1, maxHeight: 'calc(100vh - 200px)', padding: '16px 0' }}>
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
              <ReactLoading type="spin" color={theme.palette.primary.main} height={30} width={30} />
            </LoadingBox>
          )}
        </FormsGrid>
      )}
    </>
  );
};

export default DeletedFormsTabContent;
