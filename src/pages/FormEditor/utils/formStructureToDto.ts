import { DEFAULT_ICON_NAME } from "@utils/utils";
import { CreateFormDto } from "../../../api/formsApi";
import { FormStructure } from "../context/FormStructureContext";
import { FormFieldSchema } from "../schemas/fields";

export function convertFormStructureToCreateDto(formStructure: FormStructure): CreateFormDto {
    const sections = formStructure.orderedSectionIds.map((sectionId, index) => {
        const section = formStructure.sections[sectionId];
        const fields = section.fieldIds
            .map((fieldId) => formStructure.fields[fieldId])
            .filter((field) => !!field)
            .map((field) => {
                const fieldData = field.data;
                
                // Parse through Zod to apply defaults and ensure strict schema compliance
                const validatedData = FormFieldSchema.parse({
                    ...fieldData,
                    extra: fieldData.extra ?? {},
                });

                return {
                    id: field.id,
                    name: validatedData.name,
                    index: formStructure.sections[sectionId].fieldIds.indexOf(field.id) + 1,
                    fieldType: validatedData.typeId as number,
                    displayName: validatedData.displayName,
                    isRequired: validatedData.required,
                    options: validatedData.options,
                    extra: validatedData.extra ?? {},
                };
            });

        return {
            id: sectionId,
            name: section.title,
            index: index + 1,
            fields,
        };
    });

    const payload: any = {
        name: formStructure.metadata.title,
        description: formStructure.metadata.description ?? "",
        sections,
        conditions: formStructure.conditions ?? [],
    };

    if (
        formStructure.metadata.iconId &&
        formStructure.metadata.iconId !== DEFAULT_ICON_NAME &&
        formStructure.metadata.iconId !== "default-icon"
    ) {
        payload.icon = formStructure.metadata.iconId;
    }

    return payload as CreateFormDto;
}
