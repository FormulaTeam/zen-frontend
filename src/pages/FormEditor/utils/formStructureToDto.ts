import { DEFAULT_ICON_NAME } from "@utils/utils";
import { CreateFormDto } from "../../../api/formsApi";
import { FormStructure } from "../context/FormStructureContext";

export function convertFormStructureToCreateDto(formStructure: FormStructure): CreateFormDto {
    const sections = formStructure.orderedSectionIds.map((sectionId, index) => {
        const section = formStructure.sections[sectionId];
        const fields = section.fieldIds
            .map((fieldId) => formStructure.fields[fieldId])
            .filter((field) => !!field)
            .map((field) => {
                const fieldData = field.data;
                return {
                    name: fieldData.name,
                    index: formStructure.sections[sectionId].fieldIds.indexOf(field.id),
                    fieldType: fieldData.typeId as number,
                    displayName: fieldData.displayName,
                    isRequired: fieldData.required,
                    extra: fieldData.extra ?? {},
                };
            });

        return {
            name: section.title,
            index,
            fields,
        };
    });

    const payload: any = {
        name: formStructure.metadata.title,
        description: formStructure.metadata.description ?? "",
        icon: formStructure.metadata.iconId ?? DEFAULT_ICON_NAME,
        sections,
    };

    return payload as CreateFormDto;
}
