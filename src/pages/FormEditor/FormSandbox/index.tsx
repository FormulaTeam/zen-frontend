import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { FormStructureContainer } from "./FormStructure";
import { DraggableElementData, DraggableElementType, FormSandboxContext } from "../context/FormSandboxContext";
import { useFormDraggingState } from "../hooks/useFormDraggingState";
import { CatalogItemDragOverlay } from "./DragOverlay/CatalogItemDragOverlay";
import { SectionDragOverlay } from "./DragOverlay/SectionDragOverlay";
import { ReactNode, useCallback, useState } from "react";
import { FieldDragOverlay } from "./DragOverlay/FieldDragOverlay";
import { FormField, useFormStructureContext } from "../context/FormStructureContext";
import { FormFieldTypeId } from "../../../utils/interfaces";
import { arrayMove } from "@dnd-kit/sortable";
import { generateFieldId, generateFieldName } from "../utils";
import { PLACEHOLDER_FIELD_ID } from "../context/constants";
import { FormSandboxSidebar } from "./FormSandboxSidebar";

const DRAG_OVERLAYS: Record<DraggableElementType, ReactNode> = {
  catalogItem: <CatalogItemDragOverlay />,
  section: <SectionDragOverlay />,
  field: <FieldDragOverlay />,
} as const;

const COLLISION_DETECTION: Record<DraggableElementType, CollisionDetection> = {
  catalogItem: pointerWithin,
  section: pointerWithin,
  field: pointerWithin,
} as const;

function FormSandbox() {
  const [isInternalNamesShown, setIsInternalNamesShown] = useState(false);
  const { draggingState, setDragging } = useFormDraggingState();
  const { formStructure, setFormStructure } = useFormStructureContext();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const toggleInternalNamesShown = useCallback(() => setIsInternalNamesShown((prev) => !prev), []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    setDragging(true, { id: active.id, type: (active.data.current as DraggableElementData).elementType });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFormStructure((prevFormStructure) => {

        const activeElementType = (active.data.current as DraggableElementData).elementType;

        if (over && activeElementType === "section") {
          let sectionId: string;

          if ((over.data.current as DraggableElementData).elementType === "section") {
            sectionId = over.id as string;
          } else {
            return prevFormStructure;
          }

          const orderedSectionIds = [...prevFormStructure.orderedSectionIds];

          return {
            ...prevFormStructure,
            orderedSectionIds: arrayMove(
              orderedSectionIds,
              orderedSectionIds.indexOf(active.id as string),
              orderedSectionIds.indexOf(sectionId),
            ),
          };
        } else if (activeElementType === "field" || activeElementType === "catalogItem") {
          if (activeElementType === "field" && over) {
            const activeFieldId = active.id as string;
            const overElementType = (over.data.current as DraggableElementData).elementType;
            const oldParentSectionId = prevFormStructure.fields[activeFieldId].parentSectionId;
            const oldParentSection = {
              ...prevFormStructure.sections[oldParentSectionId],
              fieldIds: [...prevFormStructure.sections[oldParentSectionId].fieldIds],
            };

            if (overElementType === "section") {
              const newParentSectionId = over.id as string;
              const newParentSection = { ...prevFormStructure.sections[newParentSectionId] };

              if (newParentSection.fieldIds.length == 0 && newParentSection.expanded) {
                // insert field id into the current section
                newParentSection.fieldIds = [activeFieldId];

                // If field is already defined, remove it from the previous parent section
                oldParentSection.fieldIds.splice(oldParentSection.fieldIds.indexOf(activeFieldId), 1);

                return {
                  ...prevFormStructure,
                  sections: {
                    ...prevFormStructure.sections,
                    [newParentSectionId]: newParentSection,
                    [oldParentSectionId]: oldParentSection,
                  },
                  fields: {
                    ...prevFormStructure.fields,
                    [activeFieldId]: {
                      ...formStructure.fields[activeFieldId],
                      parentSectionId: newParentSectionId,
                    },
                  },
                };
              }
            }
            if (overElementType === "field") {
              const overFieldId = over.id as string;
              const newParentSectionId = prevFormStructure.fields[overFieldId].parentSectionId;
              const newParentSection = {
                ...prevFormStructure.sections[newParentSectionId],
                fieldIds: [...prevFormStructure.sections[newParentSectionId].fieldIds],
              };

              if (newParentSectionId === oldParentSectionId) {
                newParentSection.fieldIds = arrayMove(oldParentSection.fieldIds,
                  oldParentSection.fieldIds.indexOf(activeFieldId), // TODO add index attribute to Field
                  oldParentSection.fieldIds.indexOf(overFieldId));

                return {
                  ...prevFormStructure,
                  sections: {
                    ...prevFormStructure.sections,
                    [newParentSectionId]: newParentSection,
                  },
                };
              }

              oldParentSection.fieldIds.splice(oldParentSection.fieldIds.indexOf(activeFieldId), 1);
              newParentSection.fieldIds.splice(oldParentSection.fieldIds.indexOf(overFieldId), 0, activeFieldId);

              return {
                ...prevFormStructure,
                sections: {
                  ...prevFormStructure.sections,
                  [oldParentSectionId]: oldParentSection,
                  [newParentSectionId]: newParentSection,
                },
                fields: {
                  ...prevFormStructure.fields,
                  [activeFieldId]: {
                    ...formStructure.fields[activeFieldId],
                    parentSectionId: newParentSectionId,
                  },
                },
              };
            }
          } else if (activeElementType === "catalogItem") {
            if (over) {
              const overElementType = (over.data.current as DraggableElementData).elementType;

              if (overElementType === "section") {
                const newParentSectionId = over.id as string;
                if (prevFormStructure.sections[newParentSectionId].fieldIds.length == 0) {
                  const newParentSection = { ...prevFormStructure.sections[newParentSectionId] };

                  // insert placeholder into the current section
                  newParentSection.fieldIds = [PLACEHOLDER_FIELD_ID];

                  if (PLACEHOLDER_FIELD_ID in prevFormStructure.fields) {
                    const oldParentSectionId = prevFormStructure.fields[PLACEHOLDER_FIELD_ID].parentSectionId;
                    const oldParentSection = {
                      ...prevFormStructure.sections[oldParentSectionId],
                      fieldIds: [...prevFormStructure.sections[oldParentSectionId].fieldIds],
                    };

                    // If placeholder element is already defined, remove it from the previous parent section
                    oldParentSection.fieldIds.splice(oldParentSection.fieldIds.indexOf(PLACEHOLDER_FIELD_ID), 1);

                    return {
                      ...prevFormStructure,
                      sections: {
                        ...prevFormStructure.sections,
                        [newParentSectionId]: newParentSection,
                        [oldParentSectionId]: oldParentSection,
                      },
                      fields: {
                        ...prevFormStructure.fields,
                        [PLACEHOLDER_FIELD_ID]: {
                          ...formStructure.fields[PLACEHOLDER_FIELD_ID],
                          parentSectionId: newParentSectionId,
                        },
                      },
                    };
                  }

                  return {
                    ...prevFormStructure,
                    sections: {
                      ...prevFormStructure.sections,
                      [newParentSectionId]: newParentSection,
                    },
                    fields: {
                      ...prevFormStructure.fields,
                      [PLACEHOLDER_FIELD_ID]: {
                        id: PLACEHOLDER_FIELD_ID,
                        parentSectionId: newParentSectionId,
                        data: {
                          name: "",
                          displayName: "",
                          typeId: +active.id as FormFieldTypeId,
                          required: false,
                        },
                      },
                    },
                  };
                }

                return prevFormStructure;
              } else if (overElementType === "field" && over.id !== PLACEHOLDER_FIELD_ID) {
                const fields = { ...prevFormStructure.fields };
                const sections = { ...prevFormStructure.sections };

                const newParentSectionId = fields[over.id].parentSectionId;
                const newParentSection = {
                  ...sections[newParentSectionId],
                  fieldIds: [...sections[newParentSectionId].fieldIds],
                };

                if (!(PLACEHOLDER_FIELD_ID in fields)) {
                  fields[PLACEHOLDER_FIELD_ID] = {
                    id: PLACEHOLDER_FIELD_ID,
                    parentSectionId: newParentSectionId,
                    data: {
                      name: "",
                      displayName: "",
                      typeId: +active.id as FormFieldTypeId,
                      required: false,
                    },
                  };

                  newParentSection.fieldIds.splice(newParentSection.fieldIds.indexOf(over.id as string), 0, PLACEHOLDER_FIELD_ID);
                } else if (fields[PLACEHOLDER_FIELD_ID].parentSectionId !== newParentSectionId) {
                  const oldParentSectionId = fields[PLACEHOLDER_FIELD_ID].parentSectionId;
                  const oldParentSection = {
                    ...sections[oldParentSectionId],
                    fieldIds: [...sections[oldParentSectionId].fieldIds],
                  };

                  oldParentSection.fieldIds.splice(oldParentSection.fieldIds.indexOf(PLACEHOLDER_FIELD_ID), 1);

                  sections[oldParentSectionId] = oldParentSection;
                  newParentSection.fieldIds.splice(newParentSection.fieldIds.indexOf(over.id as string), 0, PLACEHOLDER_FIELD_ID);
                } else {
                  newParentSection.fieldIds = arrayMove(newParentSection.fieldIds, newParentSection.fieldIds.indexOf(PLACEHOLDER_FIELD_ID), newParentSection.fieldIds.indexOf(over.id as string));
                }

                sections[newParentSectionId] = newParentSection;

                return {
                  ...prevFormStructure,
                  sections,
                  fields,
                };
              }
            } else { // remove element placeholder when dragging outside the dnd context area
              const fields = { ...prevFormStructure.fields };

              if (PLACEHOLDER_FIELD_ID in fields) {
                const parentSectionId = fields[PLACEHOLDER_FIELD_ID].parentSectionId;
                const parentSection = {
                  ...prevFormStructure.sections[parentSectionId],
                  fieldIds: [...prevFormStructure.sections[parentSectionId].fieldIds],
                };

                parentSection.fieldIds.splice(parentSection.fieldIds.indexOf(PLACEHOLDER_FIELD_ID), 1);

                delete fields[PLACEHOLDER_FIELD_ID];

                return {
                  ...prevFormStructure,
                  sections: {
                    ...prevFormStructure.sections,
                    [parentSectionId]: parentSection,
                  },
                  fields,
                };
              }

              return prevFormStructure;
            }
          }
        }

        return prevFormStructure;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if ((active.data.current as DraggableElementData).elementType === "catalogItem") {
        setFormStructure((prevFormStructure) => {
          const fields = { ...prevFormStructure.fields };

          if (PLACEHOLDER_FIELD_ID in fields) {
            const placeholderFieldTypeId = fields[PLACEHOLDER_FIELD_ID].data.typeId;
            const parentSectionId = fields[PLACEHOLDER_FIELD_ID].parentSectionId;

            delete fields[PLACEHOLDER_FIELD_ID];

            const newField: FormField = {
              id: generateFieldId(),
              parentSectionId,
              data: {
                name: generateFieldName(placeholderFieldTypeId),
                displayName: "",
                typeId: placeholderFieldTypeId,
                required: false,
              },
            };

            fields[newField.id] = newField;

            const editedParentSection = {
              ...prevFormStructure.sections[parentSectionId],
              fieldIds: [...prevFormStructure.sections[parentSectionId].fieldIds],
            };

            editedParentSection.fieldIds.splice(editedParentSection.fieldIds.indexOf(PLACEHOLDER_FIELD_ID), 1, newField.id);

            return {
              ...prevFormStructure,
              sections: {
                ...prevFormStructure.sections,
                [parentSectionId]: editedParentSection,
              },
              fields,
            };
          }

          return prevFormStructure;
        });
      }
    }

    setDragging(false);
  };

  return (
    <FormSandboxContext.Provider value={{ draggingState, isInternalNamesShown, toggleInternalNamesShown }}>
      <DndContext sensors={sensors}
                  collisionDetection={
                    draggingState.draggingElement?.type ?
                      COLLISION_DETECTION[draggingState.draggingElement.type] :
                      pointerWithin
                  }
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}>
        <FormSandboxSidebar />
        <FormStructureContainer />
        {DRAG_OVERLAYS[draggingState.draggingElement?.type!]}
      </DndContext>
    </FormSandboxContext.Provider>
  );
}

export { FormSandbox };