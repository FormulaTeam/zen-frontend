import React, { useState } from "react";
import ReactLoading from "react-loading";
import {
  FormsGrid,
  LoadingBox,
  EmptyMessage,
  TopBarWrapper,
  FullWidthBox,
} from "../../pages/DeletedForms/styled";
import DeletedFormItem from "./DeletedFormItem";
import DeletedFormsToolbar from "./DeletedFormsToolbar";
import { DeletedFormsFilters } from "../../hooks/useDeletedForms";
import DeletedSelection from "./DeletedSelection";
import Grow from "@mui/material/Grow";

interface DeletedFormsTabContentProps {
  forms: any[];
  loadingForms: boolean;
  handleRestoreForm: (formId: number) => Promise<void>;
  setCurrentDeletedForm: (response: any) => void;
  filters: DeletedFormsFilters;
  setFilters: React.Dispatch<React.SetStateAction<DeletedFormsFilters>>;
}

const DeletedFormsTabContent: React.FC<DeletedFormsTabContentProps> = ({
  forms,
  loadingForms,
  handleRestoreForm,
  setCurrentDeletedForm,
  filters,
  setFilters,
}) => {
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

      {loadingForms ? (
        <LoadingBox>
          <ReactLoading type="spinningBubbles" color="#1976d2" />
        </LoadingBox>
      ) : !forms.length ? (
        <EmptyMessage variant="subtitle1">אין טפסים בסל המיחזור</EmptyMessage>
      ) : (
        <FormsGrid container spacing={3}>
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
        </FormsGrid>
      )}
    </>
  );
};

export default DeletedFormsTabContent;
