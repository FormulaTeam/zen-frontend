import { useEffect, useMemo, useState } from "react";
import { ResponseForm } from "../../utils/interfaces";
import { Container } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useResponseSave } from "../../hooks/useResponseSave";
import { useResponseState } from "../../hooks/useResponseState";
import { showErrorNotification } from "../../utils/utils";
import { FormSectionsContainer } from "./styled";
import { useChildForms } from "./hooks/useChildForms";
import { resolveUserPermissions } from "../../utils/formFieldsResponses";
import styled from "styled-components";
import ResponseHeader from "./components/ResponseHeader";
import ResponseSection from "./components/ResponseSection";
import { useSuperAdmin } from "../../contexts/SuperAdminContext";
import FormInsideForm from "./components/FormInsideForm";

const PageContainer = styled(Container)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export default function Response({ user, roles, viewMode = false, copyMode = false }) {
  const [permissionTypes, setPermissionTypes] = useState<number[]>([]);
  const [savedResponse, setSavedResponse] = useState<ResponseForm | null>(null);

  const { formId, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isSuperAdmin } = useSuperAdmin();
  const {
    formTitle,
    formFields,
    formFieldsByIdMap,
    formFieldsValuesMap,
    formFieldsValidMap,
    onChangeHandler,
    validateRequiredFields,
    loading,
    form,
    response,
    fieldOptions,
    loadingConnections,
    responsSections,
    collapsedSections,
    toggleSectionCollapse,
  } = useResponseState(formId, id, viewMode, copyMode);

  const saveAll = async () => {
    if ((await validateRequiredFields()) && form) {
      try {
        const result = await saveResponse(formFieldsByIdMap, formFieldsValuesMap);
        if (!Array.isArray(result)) setSavedResponse(result);

        // if (result) {
        //   navigate(`/responses/${formId}`);
        // }
        setChildFormsSaving(true);
      } catch (error: any) {
        console.error("error:", error);
        if (error?.response?.data?.error?.includes("Metro")) {
          navigate(`/responses/${form.id}`);
        } else {
          console.error("error:", error);
          showErrorNotification("משהו השתבש");
        }
      }
    }
  };

  const { saveResponse, isSaving } = useResponseSave(form, response, user);

  const {
    childForms,
    childFormsSaving,
    setChildFormsSaving,
    childFormsValidate,
    setChildFormsValidate,
    handleAddChildForm,
    handleRemoveChildForm,
    handleChildSaved,
    handleChildValid,
  } = useChildForms({
    formFields,
    id,
    formId,
    saveAll,
    user,
    isSuperAdmin,
    roles,
  });

  const isLoading = useMemo(() => {
    return isSaving || childFormsSaving || loading || loadingConnections;
  }, [isSaving, childFormsSaving, loading, loadingConnections]);

  useEffect(() => {
    resolveUserPermissions(form, user, roles, viewMode, setPermissionTypes);
  }, [roles, form]);

  const onBack = () => {
    if (location.state?.parentFormId) {
      navigate(`/responses/${location.state.parentFormId}`, {});
    } else {
      form && navigate(`/responses/${form.id}`);
    }
  };

  const onEdit = () => navigate(`/response/edit/${formId}/${id}`);

  const onSaveAndClose = () => {
    const allShown = childForms.map((cf) => cf.shown);
    if (allShown.every((v) => v === false)) {
      saveAll();
    } else {
      setChildFormsValidate(true);
    }
  };

  const getFormInFormProperty = (formField: any) => {
    return (
      <FormInsideForm
        formField={formField}
        childForms={childForms}
        handleRemoveChildForm={handleRemoveChildForm}
        childFormsSaving={childFormsSaving}
        user={user}
        viewMode={viewMode}
        copyMode={copyMode}
        savedResponse={savedResponse}
        handleChildSaved={handleChildSaved}
        handleChildValid={handleChildValid}
        childFormsValidate={childFormsValidate}
        isSaving={isSaving}
        isLoading={isLoading}
        handleAddChildForm={handleAddChildForm}
        formFields={formFields}
      />
    );
  };

  // Sort sections by their order and ensure proper section hierarchy
  const sortedSections = useMemo(() => {
    return Object.entries(responsSections).sort((a, b) => {
      // Extract section order from the first field in each section
      // Default to 0 if no sectionOrder is defined
      const aOrder = a[1].fields[0]?.sectionOrder ?? 0;
      const bOrder = b[1].fields[0]?.sectionOrder ?? 0;

      // If both sections have the same order value, sort by section ID
      // This ensures section_0 comes before other sections with the same order
      // Using localeCompare for proper string comparison
      if (aOrder === bOrder) {
        return a[0].localeCompare(b[0]);
      }

      // Primary sorting: by section order (ascending - lower numbers first)
      // This ensures sections appear in their intended sequence
      return aOrder - bOrder;
    });
  }, [responsSections]);

  return (
    <div className="response-page">
      <PageContainer disableGutters maxWidth={false}>
        <ResponseHeader
          formTitle={formTitle}
          viewMode={viewMode}
          permissionTypes={permissionTypes}
          onEdit={onEdit}
          onBack={onBack}
          onSaveAndClose={onSaveAndClose}
          saveIsLoading={isSaving || childFormsSaving}
        />
        <FormSectionsContainer>
          {sortedSections.map(([sectionId, section], sectionIdx) => (
            <ResponseSection
              key={sectionId}
              section={section}
              sectionId={sectionId}
              sectionIdx={sectionIdx}
              collapsedSections={collapsedSections}
              toggleSectionCollapse={toggleSectionCollapse}
              formFieldsByIdMap={formFieldsByIdMap}
              formFieldsValuesMap={formFieldsValuesMap}
              formFieldsValidMap={formFieldsValidMap}
              onChangeHandler={onChangeHandler}
              viewMode={viewMode}
              fieldOptions={fieldOptions}
              formFields={formFields}
              getFormInFormProperty={getFormInFormProperty}
              isLoading={isLoading}
            />
          ))}
        </FormSectionsContainer>
      </PageContainer>
    </div>
  );
}
