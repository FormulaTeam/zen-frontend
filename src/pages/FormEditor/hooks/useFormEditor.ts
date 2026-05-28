import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateForm, useUpdateForm } from "@api/formsApi";
import { FormStructure } from "../context/FormStructureContext";
import { showErrorNotification, showSuccessNotification } from "@utils/utils";
import { convertFormStructureToCreateDto } from "../utils/formStructureToDto";
import { IPath } from "../../../types/enums/global.enums";
import queryClient from "@api/queryClient";
import { useFormEditorContext, FORM_EDITOR_MODE } from "../context/FormEditorContext";
import { clearFormDraft } from "../utils/draftPersistence";

interface SaveFormOptions {
  navigateToResponses?: boolean;
}

interface UseFormEditorReturn {
  handleSaveForm: (options?: SaveFormOptions) => Promise<void>;
  handleExit: () => void;
  handleDiscardAndExit: () => void;
  isLoading: boolean;
}

export function useFormEditor(formStructure: FormStructure): UseFormEditorReturn {
  const navigate = useNavigate();
  const { mutateAsync: mutateCreateFormAsync } = useCreateForm();
  const { mutateAsync: mutateUpdateFormAsync } = useUpdateForm();
  const { mode } = useFormEditorContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveForm = useCallback(
    async (options?: SaveFormOptions) => {
      setIsLoading(true);

      try {
        const payload = convertFormStructureToCreateDto(formStructure);

        if (mode === FORM_EDITOR_MODE.EDIT && formStructure.metadata.id) {
          await mutateUpdateFormAsync({ id: formStructure.metadata.id, payload });
          showSuccessNotification("הטופס עודכן בהצלחה!");
          clearFormDraft(formStructure.metadata.id);
          queryClient.invalidateQueries({ queryKey: [formStructure.metadata.id.toString()] });

          if (options?.navigateToResponses) {
            navigate(`/responses/${formStructure.metadata.id}`, { replace: true });
          }
        } else {
          const createdForm = await mutateCreateFormAsync(payload);
          showSuccessNotification("הטופס נשמר בהצלחה!");
          clearFormDraft(undefined);

          navigate(`/responses/${createdForm.id}`, { replace: true });
        }

        queryClient.invalidateQueries({ queryKey: ["forms"] });
      } catch (error) {
        console.error("Failed to save form:", error);
        showErrorNotification("שמירת הטופס נכשלה");
      } finally {
        setIsLoading(false);
      }
    },
    [formStructure, mutateCreateFormAsync, mutateUpdateFormAsync, mode, navigate],
  );

  const handleExit = useCallback(() => {
    if (mode === FORM_EDITOR_MODE.EDIT && formStructure.metadata.id) {
      navigate(`/responses/${formStructure.metadata.id}`);
      return;
    }

    navigate(IPath.HOME);
  }, [mode, formStructure.metadata.id, navigate]);

  const handleDiscardAndExit = useCallback(() => {
    clearFormDraft(formStructure.metadata.id);

    if (mode === FORM_EDITOR_MODE.EDIT && formStructure.metadata.id) {
      navigate(`/responses/${formStructure.metadata.id}`);
      return;
    }

    navigate(IPath.HOME);
  }, [mode, formStructure.metadata.id, navigate]);

  return {
    handleSaveForm,
    handleExit,
    handleDiscardAndExit,
    isLoading,
  };
}
