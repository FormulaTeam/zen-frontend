import React, { useEffect } from "react";
import { Droppable, Draggable, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { Box } from "@mui/material";
import FormSection from "./FormSection";
import { Section } from "../../utils/interfaces";
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
  sections: Section[];
  getFormProperty: (
    formField: EditorFormField,
    dragHandleProps: DraggableProvidedDragHandleProps | null | undefined,
  ) => JSX.Element;
  formFields: EditorFormField[];
  anounceRemoveSection: (sectionId: string) => void;
  renameSection: (sectionId: string, newName: string) => boolean;
  toggleCollapse: (sectionId: string) => void;
  changeSectionDescription?: (sectionId: string, newDescription: string) => void;
  handleScrollToLastSection: () => void;
}

export default function FormSectionsList({
  sections,
  getFormProperty,
  formFields,
  anounceRemoveSection,
  renameSection,
  toggleCollapse,
  changeSectionDescription,
  handleScrollToLastSection,
}: Props) {
  useEffect(() => {
    handleScrollToLastSection();
  }, [sections.length, handleScrollToLastSection]);

  return (
    <Box>
      <Droppable droppableId="SECTIONS" type="SECTION">
        {(provided) => (
          <Box ref={provided.innerRef} {...provided.droppableProps}>
            {[...sections]
              .sort((a, b) => a.order - b.order)
              .map((sec, idx) => (
                <Draggable key={sec.id} draggableId={sec.id} index={idx}>
                  {(prov) => (
                    <Box ref={prov.innerRef} {...prov.draggableProps} mb={3} id={sec.id}>
                      <FormSection
                        changeSectionDescription={changeSectionDescription}
                        anounceRemoveSection={anounceRemoveSection}
                        renameSection={renameSection}
                        toggleCollapse={toggleCollapse}
                        section={sec}
                        dragHandleProps={prov.dragHandleProps}
                        getFormProperty={getFormProperty}
                        formFields={formFields}
                      />
                    </Box>
                  )}
                </Draggable>
              ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Box>
  );
}
