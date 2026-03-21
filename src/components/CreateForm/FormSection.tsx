import React, { useState } from "react";
import { Droppable, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { Box, useTheme, Collapse } from "@mui/material";
import FormFieldsList from "./FormFieldsList";
import { Section } from "../../utils/interfaces";
import SectionHeader from "./SectionHeader";
import { FORM_FIELDS_PREFIX } from "../../utils/sections/consts";
import { FormFieldDto } from "../../types/shared";

type EditorFormField = FormFieldDto & {
  extra?: {
    sectionId?: string;
    sectionOrder?: number;
    sectionName?: string;
    sectionDescription?: string;
    [key: string]: unknown;
  };
};

interface Props {
  section: Section;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  getFormProperty: (
    formField: EditorFormField,
    dragHandleProps: DraggableProvidedDragHandleProps | null | undefined,
  ) => React.ReactNode;
  formFields: EditorFormField[];
  renameSection: (sectionId: string, newName: string) => boolean;
  toggleCollapse: (sectionId: string) => void;
  anounceRemoveSection: (sectionId: string) => void;
  changeSectionDescription?: (sectionId: string, newDescription: string) => void;
}

export default function FormSection({
  section,
  dragHandleProps,
  getFormProperty,
  formFields,
  renameSection,
  toggleCollapse,
  anounceRemoveSection,
  changeSectionDescription,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValues, setDraftValues] = useState({
    name: section.name,
    description: section.description || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const theme = useTheme();

  const handeValuesChange = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const isRenameSuccess = renameSection(section.id, draftValues.name);

      if (changeSectionDescription) {
        changeSectionDescription(section.id, draftValues.description);
      }

      if (isRenameSuccess) {
        setIsEditing(false);
        setDraftValues({
          name: draftValues.name.trim(),
          description: draftValues.description,
        });
      } else {
        setDraftValues((prev) => ({ name: section.name, description: prev.description }));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box
      border={1}
      borderColor={theme.palette.divider}
      borderRadius={1}
      p={2}
      key={FORM_FIELDS_PREFIX + section.id}>
      <Box display="flex" justifyContent="space-between" alignItems="center" {...dragHandleProps}>
        <SectionHeader
          draftValues={draftValues}
          setDraftValues={setDraftValues}
          section={section}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          toggleCollapse={toggleCollapse}
          anounceRemoveSection={anounceRemoveSection}
          handeValuesChange={handeValuesChange}
        />
      </Box>

      <Collapse in={!section.collapsed} timeout="auto" unmountOnExit>
        <Droppable droppableId={section.id} type="FIELD">
          {(prov, snapshot) => (
            <Box
              ref={prov.innerRef}
              {...prov.droppableProps}
              mt={1}
              sx={{
                position: "relative",
                backgroundColor: snapshot.isDraggingOver ? "rgba(0,0,0,0.05)" : "transparent",
                transition: "background-color 0.2s ease",
                userSelect: snapshot.isDraggingOver ? "none" : "auto",
                WebkitUserSelect: snapshot.isDraggingOver ? "none" : "auto",
              }}>
              <FormFieldsList
                getFormProperty={getFormProperty}
                formFields={formFields}
                section={section}
              />
              {prov.placeholder}
            </Box>
          )}
        </Droppable>
      </Collapse>
    </Box>
  );
}
