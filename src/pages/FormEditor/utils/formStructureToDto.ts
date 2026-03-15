import { CreateFormDto } from "../../../api/formsApi";
import { FormStructure } from "../context/FormStructureContext";

// Default icon is "formX" as per the API validation
const DEFAULT_ICON = "formX";

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
        icon: DEFAULT_ICON,
        sections,
    };

    return payload as CreateFormDto;
}
