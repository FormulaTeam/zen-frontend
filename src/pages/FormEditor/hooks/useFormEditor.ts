import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateForm, useUpdateForm } from "@api/formsApi";
import { FormMetadata, FormStructure } from "../context/FormStructureContext";
import { showErrorNotification, showSuccessNotification } from "@utils/utils";
import { convertFormStructureToCreateDto } from "../utils/formStructureToDto";
import { IPath } from "../../../types/enums/global.enums";
import queryClient from "@api/queryClient";
import { useFormEditorContext, FORM_EDITOR_MODE } from "../context/FormEditorContext";
import { clearFormDraft } from "../utils/draftPersistence";

interface SaveFormOptions extends Partial<Omit<FormMetadata, "validationErrors">> {
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

  const formStructureRef = useRef(formStructure);

  useEffect(() => {
    formStructureRef.current = formStructure;
  }, [formStructure]);

  const handleSaveForm = useCallback(
    async (options?: SaveFormOptions) => {
      setIsLoading(true);

      try {
        const { navigateToResponses, ...metadataOverride } = options ?? {};

        let structureToSave = formStructureRef.current;

        if (Object.keys(metadataOverride).length > 0) {
          structureToSave = {
            ...structureToSave,
            metadata: {
              ...structureToSave.metadata,
              ...metadataOverride,
            },
          };
        }

        const payload = convertFormStructureToCreateDto(structureToSave);

        if (mode === FORM_EDITOR_MODE.EDIT && structureToSave.metadata.id) {
          await mutateUpdateFormAsync({ id: structureToSave.metadata.id, payload });
          showSuccessNotification("הטופס עודכן בהצלחה!");
          clearFormDraft(structureToSave.metadata.id);
          queryClient.invalidateQueries({
            queryKey: [structureToSave.metadata.id.toString()],
          });

          if (navigateToResponses) {
            navigate(`/responses/${structureToSave.metadata.id}`, { replace: true });
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
    [mutateCreateFormAsync, mutateUpdateFormAsync, mode, navigate],
  );

  const handleExit = useCallback(() => {
    const formId = formStructureRef.current.metadata.id;

    if (mode === FORM_EDITOR_MODE.EDIT && formId) {
      navigate(`/responses/${formId}`);
      return;
    }

    navigate(IPath.HOME);
  }, [navigate, mode]);

  const handleDiscardAndExit = useCallback(() => {
    const formId = formStructureRef.current.metadata.id;

    clearFormDraft(formId);

    if (mode === FORM_EDITOR_MODE.EDIT && formId) {
      navigate(`/responses/${formId}`);
      return;
    }

    navigate(IPath.HOME);
  }, [navigate, mode]);

  return {
    handleSaveForm,
    handleExit,
    handleDiscardAndExit,
    isLoading,
  };
}
