import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateForm } from "../../../api";
import { FormStructure } from "../context/FormStructureContext";
import { showErrorNotification, showSuccessNotification } from "../../../utils/utils";
import { convertFormStructureToCreateDto } from "../utils/formStructureToDto";
import { IPath } from "../../../types/enums/global.enums";
import queryClient from "../../../api/queryClient";

interface UseFormEditorReturn {
    handleSaveForm: () => Promise<void>;
    handleExit: () => void;
    isLoading: boolean;
}

export function useFormEditor(formStructure: FormStructure): UseFormEditorReturn {
    const navigate = useNavigate();
    const { mutateAsync: mutateCreateFormAsync } = useCreateForm();
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveForm = useCallback(async () => {
        setIsLoading(true);

        try {
            const createPayload = convertFormStructureToCreateDto(formStructure);
            await mutateCreateFormAsync(createPayload);
            showSuccessNotification("הטופס נשמר בהצלחה!");
            queryClient.invalidateQueries({ queryKey: ["forms"] });
        } catch (error) {
            console.error("Failed to save form:", error);
            showErrorNotification("שמירת הטופס נכשלה");
        } finally {
            setIsLoading(false);
        }
    }, [formStructure, mutateCreateFormAsync]);

    const handleExit = useCallback(() => {
        navigate(IPath.HOME);
    }, [navigate]);

    return {
        handleSaveForm,
        handleExit,
        isLoading,
    };
}
