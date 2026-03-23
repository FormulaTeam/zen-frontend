import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateForm, useUpdateForm } from "@api/formsApi";
import { FormStructure } from "../context/FormStructureContext";
import { showErrorNotification, showSuccessNotification } from "@utils/utils";
import { convertFormStructureToCreateDto } from "../utils/formStructureToDto";
import { IPath } from "../../../types/enums/global.enums";
import queryClient from "@api/queryClient";
import { useFormEditorContext, FORM_EDITOR_MODE } from "../context/FormEditorContext";

interface UseFormEditorReturn {
    handleSaveForm: () => Promise<void>;
    handleExit: () => void;
    isLoading: boolean;
}

export function useFormEditor(formStructure: FormStructure): UseFormEditorReturn {
    const navigate = useNavigate();
    const { mutateAsync: mutateCreateFormAsync } = useCreateForm();
    const { mutateAsync: mutateUpdateFormAsync } = useUpdateForm();
    const { mode } = useFormEditorContext();
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveForm = useCallback(async () => {
        setIsLoading(true);

        try {
            const payload = convertFormStructureToCreateDto(formStructure);

            if (mode === FORM_EDITOR_MODE.EDIT && formStructure.metadata.id) {
                await mutateUpdateFormAsync({ id: formStructure.metadata.id, payload });
                showSuccessNotification("הטופס עודכן בהצלחה!");
                queryClient.invalidateQueries({ queryKey: [formStructure.metadata.id.toString()] });
            } else {
                await mutateCreateFormAsync(payload);
                showSuccessNotification("הטופס נשמר בהצלחה!");
            }

            queryClient.invalidateQueries({ queryKey: ["forms"] });
        } catch (error) {
            console.error("Failed to save form:", error);
            showErrorNotification("שמירת הטופס נכשלה");
        } finally {
            setIsLoading(false);
        }
    }, [formStructure, mutateCreateFormAsync, mutateUpdateFormAsync, mode]);

    const handleExit = useCallback(() => {
        navigate(IPath.HOME);
    }, [navigate]);

    return {
        handleSaveForm,
        handleExit,
        isLoading,
    };
}
