import { useState, useEffect } from "react";
import { getForms, getLinkableForms } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { FormDto, FormOverviewDto } from "../types/shared";

interface UseFormInFormSearchProps {
  formId: number;
  linkedFormId?: number;
}

export const useFormInFormSearch = ({
  formId,
  linkedFormId,
}: UseFormInFormSearchProps) => {
  const [forms, setForms] = useState<FormOverviewDto[]>([]);
  const [loadingForms, setLoadingForms] = useState<boolean>(false);
  const [selectedForm, setSelectedForm] = useState<FormDto | FormOverviewDto | null>(null);
  const [formSearchText, setFormSearchText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const { user } = useAuth();

  // Load initial form if linkedFormId exists
  useEffect(() => {
    if (linkedFormId) {
      getForms({
        query: { id: linkedFormId }
      })
        .then((response) => {
          setSelectedForm(response[0] ?? null);
        })
        .catch((error) => {
          console.error("Failed to load initial form:", error);
          setSelectedForm(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      setSelectedForm(null);
    }
  }, [linkedFormId]);

  // Fetch linkable forms (all or with search)
  useEffect(() => {
    if (formId) {
      setLoadingForms(true);
      getLinkableForms(formId, formSearchText || undefined)
        .then((response) => {
          setForms(response);
          setLoadingForms(false);
        })
        .catch((error) => {
          console.error("Failed to fetch linkable forms:", error);
          setForms([]);
          setLoadingForms(false);
        });
    }
  }, [formId, formSearchText]);

  const handleSearchForm = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormSearchText(value);
  };

  const handleSelectForm = (event: React.SyntheticEvent, value: FormDto | FormOverviewDto | null) => {
    setSelectedForm(value);
  };

  return {
    forms,
    loadingForms,
    selectedForm,
    formSearchText,
    loading,
    handleSearchForm,
    handleSelectForm,
    setSelectedForm,
  };
};
