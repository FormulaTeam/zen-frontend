import { useState, useEffect } from "react";
import { getForms } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { FormDto } from "../types/shared";

interface UseFormInFormSearchProps {
  linkedFormId?: number;
}

export const useFormInFormSearch = ({
  linkedFormId: linkedFormId,
}: UseFormInFormSearchProps) => {
  const [forms, setForms] = useState<FormDto[]>([]);
  const [loadingForms, setLoadingForms] = useState<boolean>(false);
  const [selectedForm, setSelectedForm] = useState<FormDto | null>(null);
  const [formSearchText, setFormSearchText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const { user } = useAuth();

  // Load initial form if linkedFormId exists
  useEffect(() => {
    if (linkedFormId) {
      const filter = {
        query: {
          $or: [{ name: { $regex: formSearchText } }, { description: { $regex: formSearchText } }],
          users: { $elemMatch: { upn: user?.upn?.toLowerCase() } },
          id: linkedFormId,
        },
      };
      getForms(filter)
        .then((response) => {
          setSelectedForm(response[0] ?? null);
        })
        .catch((error) => {
          setSelectedForm(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      setSelectedForm(null);
    }
  }, [linkedFormId, user?.upn]);

  // Search forms by name or description
  useEffect(() => {
    setLoadingForms(true);
    const abortController = new AbortController();

    if (formSearchText.length > 2) {
      const filter = {
        query: {
          $or: [{ name: { $regex: formSearchText } }, { description: { $regex: formSearchText } }],
          users: { $elemMatch: { upn: user?.upn?.toLowerCase() } },
        },
        signal: abortController.signal,
      };
      getForms(filter)
        .then((response) => {
          setForms(response);
          setLoadingForms(false);
        })
        .catch((error) => {
          setForms([]);
          setLoadingForms(false);
        });
    } else {
      setForms([]);
      setLoadingForms(false);
    }

    return () => abortController.abort();
  }, [formSearchText, user?.upn]);

  const handleSearchForm = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormSearchText(value);
  };

  const handleSelectForm = (event: React.SyntheticEvent, value: FormDto | null) => {
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
