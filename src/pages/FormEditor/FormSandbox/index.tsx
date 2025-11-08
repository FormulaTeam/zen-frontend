import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { FormManagementActions } from "./FormManagementActions";
import { FormElementCatalog } from "./FormElementCatalog";
import { FormStructureElement } from "./FormStructure";
import { DraggableElementData, DraggableElementType, FormSandboxContext } from "../context/FormSandboxContext";
import { useFormDraggingState } from "../hooks/useFormDraggingState";
import { CatalogItemDragOverlay } from "./DragOverlay/CatalogItemDragOverlay";
import { SectionDragOverlay } from "./DragOverlay/SectionDragOverlay";
import { ReactNode, useEffect } from "react";
import { FieldDragOverlay } from "./DragOverlay/FieldDragOverlay";
import { useFormStructureContext } from "../context/FormStructureContext";
import { FormElementTypeId } from "../../../utils/interfaces";
import { v4 as uuid4 } from "uuid";
import { arrayMove } from "@dnd-kit/sortable";

const DRAG_OVERLAYS: Record<DraggableElementType, ReactNode> = {
  catalogItem: <CatalogItemDragOverlay />,
  section: <SectionDragOverlay />,
  field: <FieldDragOverlay />,
} as const;

const COLLISION_DETECTION: Record<DraggableElementType, CollisionDetection> = {
  catalogItem: pointerWithin,
  section: rectIntersection,
  field: rectIntersection,
} as const;

const PLACEHOLDER_FIELD_ID: string = "__PLACEHOLDER__" as const;

function FormSandbox() {
  const { draggingState, setDragging } = useFormDraggingState();
  const { formStructure, setFormStructure } = useFormStructureContext();

  const sensors = useSensors(
    useSensor(PointerSensor),
  );

  useEffect(() => {
    console.log(formStructure);
  }, [formStructure]);

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

          const sections = { ...prevFormStructure.sections };
          const originalIndex = sections[active.id].index;

          sections[active.id].index = sections[sectionId].index;
          sections[sectionId].index = originalIndex;

          return {
            ...prevFormStructure,
            sections,
          };
        } else if (activeElementType === "field" || activeElementType === "catalogItem") {
          if (activeElementType === "field" && over) {
            const activeFieldId = active.id as string;
            const overElementType = (over.data.current as DraggableElementData).elementType;
            const currentParentSectionId = prevFormStructure.fields[activeFieldId].parentSectionId;
            const currentParentSection = { ...prevFormStructure.sections[currentParentSectionId] };

            if (overElementType === "section") {
              const newParentSectionId = over.id as string;
              const newParentSection = { ...prevFormStructure.sections[newParentSectionId] };

              if (newParentSection.fieldIds.length == 0) {
                // insert field id into the current section
                newParentSection.fieldIds = [activeFieldId];

                // If placeholder element is already defined, remove it from the previous parent section
                currentParentSection.fieldIds =
                  currentParentSection.fieldIds.filter(
                    (fieldId) => (fieldId !== activeFieldId),
                  );

                return {
                  ...prevFormStructure,
                  sections: {
                    ...prevFormStructure.sections,
                    [newParentSectionId]: newParentSection,
                    [currentParentSectionId]: currentParentSection,
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
              const newParentSection = { ...prevFormStructure.sections[newParentSectionId] };

              if (newParentSectionId === currentParentSectionId) {
                newParentSection.fieldIds = arrayMove(currentParentSection.fieldIds,
                                                      currentParentSection.fieldIds.indexOf(activeFieldId), // TODO add index attribute to Field
                                                      currentParentSection.fieldIds.indexOf(overFieldId));

                return {
                  ...prevFormStructure,
                  sections: {
                    ...prevFormStructure.sections,
                    [newParentSectionId]: newParentSection,
                  },
                };
              }

              currentParentSection.fieldIds =
                currentParentSection.fieldIds.filter(
                  (fieldId) => (fieldId !== activeFieldId),
                );

              newParentSection.fieldIds.splice(currentParentSection.fieldIds.indexOf(overFieldId), 0, activeFieldId);

              return {
                ...prevFormStructure,
                sections: {
                  ...prevFormStructure.sections,
                  [currentParentSectionId]: currentParentSection,
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

                  const currentParentSectionId = (prevFormStructure.fields[PLACEHOLDER_FIELD_ID] ?? {}).parentSectionId;

                  if (currentParentSectionId) {
                    const currentParentSection = {
                      ...prevFormStructure.sections[currentParentSectionId],
                    };

                    // If placeholder element is already defined, remove it from the previous parent section
                    currentParentSection.fieldIds =
                      currentParentSection.fieldIds.filter(
                        (fieldId) => (fieldId !== PLACEHOLDER_FIELD_ID),
                      );

                    return {
                      ...prevFormStructure,
                      sections: {
                        ...prevFormStructure.sections,
                        [newParentSectionId]: newParentSection,
                        [currentParentSectionId]: currentParentSection,
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
                        name: PLACEHOLDER_FIELD_ID,
                        typeId: +active.id as FormElementTypeId,
                        parentSectionId: newParentSectionId,
                        required: false,
                      },
                    },
                  };
                }

                return prevFormStructure;
              } else if (overElementType === "field") {
                //   const overFieldId = over.id as string;
                //   const newParentSectionId = prevFormStructure.fields[overFieldId].parentSectionId;
                //   const newParentSection = { ...prevFormStructure.sections[newParentSectionId] };
                //
                //   if (newParentSectionId === currentParentSectionId) {
                //     newParentSection.fieldIds = arrayMove(currentParentSection.fieldIds,
                //                                           currentParentSection.fieldIds.indexOf(activeFieldId), // TODO add index attribute to Field
                //                                           currentParentSection.fieldIds.indexOf(overFieldId));
                //
                //     return {
                //       ...prevFormStructure,
                //       sections: {
                //         ...prevFormStructure.sections,
                //         [newParentSectionId]: newParentSection,
                //       },
                //     };
                //   }
                //
                //   currentParentSection.fieldIds =
                //     currentParentSection.fieldIds.filter(
                //       (fieldId) => (fieldId !== activeFieldId),
                //     );
                //
                //   newParentSection.fieldIds.splice(currentParentSection.fieldIds.indexOf(overFieldId), 0, activeFieldId);
                //
                //   return {
                //     ...prevFormStructure,
                //     sections: {
                //       ...prevFormStructure.sections,
                //       [currentParentSectionId]: currentParentSection,
                //       [newParentSectionId]: newParentSection,
                //     },
                //     fields: {
                //       ...prevFormStructure.fields,
                //       [activeFieldId]: {
                //         ...formStructure.fields[activeFieldId],
                //         parentSectionId: newParentSectionId,
                //       },
                //     },
                //   };
              }
            } else {
              // If placeholder element is already defined, remove it from the previous parent section
              if (PLACEHOLDER_FIELD_ID in prevFormStructure.fields) {
                const parentSectionId = prevFormStructure.fields[PLACEHOLDER_FIELD_ID].parentSectionId;
                const parentSection = { ...prevFormStructure.sections[parentSectionId] };

                parentSection.fieldIds =
                  parentSection.fieldIds.filter(
                    (fieldId) => (fieldId !== PLACEHOLDER_FIELD_ID),
                  );

                delete prevFormStructure.fields[PLACEHOLDER_FIELD_ID];

                return {
                  ...prevFormStructure,
                  sections: {
                    ...prevFormStructure.sections,
                    [parentSectionId]: parentSection,
                  },
                  fields: {
                    ...prevFormStructure.fields,
                  },
                };
              }
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
          if (PLACEHOLDER_FIELD_ID in prevFormStructure.fields) {
            const placeholderFieldTypeId = prevFormStructure.fields[PLACEHOLDER_FIELD_ID].typeId;
            const parentSectionId = prevFormStructure.fields[PLACEHOLDER_FIELD_ID].parentSectionId;

            const editedParentSection = { ...prevFormStructure.sections[parentSectionId] };

            editedParentSection.fieldIds = editedParentSection.fieldIds.filter(
              (fieldId) => (fieldId !== PLACEHOLDER_FIELD_ID),
            );

            delete prevFormStructure.fields[PLACEHOLDER_FIELD_ID];

            const newConcreteFieldId = `${Object.keys(prevFormStructure.fields).length}`;

            editedParentSection.fieldIds.push(newConcreteFieldId); //TODO only when parentSection.fieldIds.length == 0

            return {
              ...prevFormStructure,
              sections: {
                ...prevFormStructure.sections,
                [parentSectionId]: editedParentSection,
              },
              fields: {
                ...prevFormStructure.fields,
                [newConcreteFieldId]: {
                  id: newConcreteFieldId,
                  name: `field_${uuid4()}`, // TODO adapt to type-based prefix
                  typeId: placeholderFieldTypeId,
                  parentSectionId,
                  required: false,
                },
              },
            };
          }

          return prevFormStructure;
        });
      }
    }

    setDragging(false);
  };

  return (
    <FormSandboxContext.Provider value={{ draggingState, setDragging }}>
      <DndContext sensors={sensors}
                  collisionDetection={
                    draggingState.draggingElement?.type ?
                      COLLISION_DETECTION[draggingState.draggingElement.type] :
                      pointerWithin
                  }
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}>
        <div>
          <FormManagementActions />
          <FormElementCatalog />
        </div>
        <FormStructureElement />
        {DRAG_OVERLAYS[draggingState.draggingElement?.type!]}
      </DndContext>
    </FormSandboxContext.Provider>
  );
}

export { FormSandbox };