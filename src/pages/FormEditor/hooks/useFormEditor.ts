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

interface UseFormEditorReturn {
    handleSaveForm: (metadataOverride?: Partial<FormMetadata>) => Promise<void>;
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

    // Use a ref to always have the latest formStructure in the async save function
    const formStructureRef = useRef(formStructure);
    useEffect(() => {
        formStructureRef.current = formStructure;
    }, [formStructure]);

    const handleSaveForm = useCallback(async (metadataOverride?: Partial<FormMetadata>) => {
        setIsLoading(true);

        try {
            let structureToSave = formStructureRef.current;
            if (metadataOverride) {
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
                queryClient.invalidateQueries({ queryKey: [structureToSave.metadata.id.toString()] });
            } else {
                const createdForm = await mutateCreateFormAsync(payload);
                showSuccessNotification("הטופס נשמר בהצלחה!");
                clearFormDraft(undefined); // Clear 'new' form draft

                navigate(`/form/edit/${createdForm.id}`, { replace: true });
            }

            queryClient.invalidateQueries({ queryKey: ["forms"] });
        } catch (error) {
            console.error("Failed to save form:", error);
            showErrorNotification("שמירת הטופס נכשלה");
        } finally {
            setIsLoading(false);
        }
    }, [mutateCreateFormAsync, mutateUpdateFormAsync, mode, navigate]);

    const handleExit = useCallback(() => {
        navigate(IPath.HOME);
    }, [navigate]);

    const handleDiscardAndExit = useCallback(() => {
        clearFormDraft(formStructureRef.current.metadata.id);
        navigate(IPath.HOME);
    }, [formStructure.metadata.id, navigate]);

    return {
        handleSaveForm,
        handleExit,
        handleDiscardAndExit,
        isLoading,
    };
}
