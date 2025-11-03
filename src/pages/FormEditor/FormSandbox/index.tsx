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
import { ReactNode } from "react";
import { FieldDragOverlay } from "./DragOverlay/FieldDragOverlay";
import { useFormStructureContext } from "../context/FormStructureContext";
import { FormElementTypeId } from "../../../utils/interfaces";

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

const PLACEHOLDER_FIELD_ID:string = "__PLACEHOLDER__" as const;

function FormSandbox() {
  const { draggingState, setDragging } = useFormDraggingState();
  const { setFormStructure } = useFormStructureContext();

  const sensors = useSensors(
    useSensor(PointerSensor),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      if (over && (active.data.current as DraggableElementData).elementType === "section") {
        setFormStructure((prevFormStructure) => {
          let sectionId: string;

          if ((over.data.current as DraggableElementData).elementType === "section") {
            sectionId = over.id as string;
          } else if ((over.data.current as DraggableElementData).elementType === "field") {
            return prevFormStructure;
            // sectionId = prevFormStructure.fields[over.id].parentSectionId;
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
        });
      } else if ((active.data.current as DraggableElementData).elementType === "catalogItem") {
        if (over && (over.data.current as DraggableElementData).elementType === "section") {
          setFormStructure((prevFormStructure) => {
            if (prevFormStructure.sections[over.id].fieldIds.length == 0) {

              // insert placeholder into the current section
              prevFormStructure.sections[over.id].fieldIds = [PLACEHOLDER_FIELD_ID];

              if (prevFormStructure.fields[PLACEHOLDER_FIELD_ID]) {
                // If placeholder element is already defined, remove it from the previous parent section
                prevFormStructure.sections[prevFormStructure.fields[PLACEHOLDER_FIELD_ID].parentSectionId].fieldIds.filter(
                  (fieldId) => (fieldId !== PLACEHOLDER_FIELD_ID),
                );

                return {
                  ...prevFormStructure,
                  sections: {
                    ...prevFormStructure.sections,
                  },
                  fields: {
                    ...prevFormStructure.fields,
                  },
                };

              }

              return {
                ...prevFormStructure,
                sections: {
                  ...prevFormStructure.sections,
                },
                fields: {
                  ...prevFormStructure.fields,
                  [PLACEHOLDER_FIELD_ID]: {
                    id: PLACEHOLDER_FIELD_ID,
                    name: PLACEHOLDER_FIELD_ID, // TODO change
                    typeId: +active.id as FormElementTypeId,
                    parentSectionId: over.id as string,
                    required: false,
                  },
                },
              };
            }

            return prevFormStructure;
          });
        } else {
          setFormStructure((prevFormStructure) => {
            if (prevFormStructure.fields[PLACEHOLDER_FIELD_ID]) {
              // If placeholder element is already defined, remove it from the previous parent section
              prevFormStructure.sections[prevFormStructure.fields[PLACEHOLDER_FIELD_ID].parentSectionId].fieldIds.filter(
                (fieldId) => (fieldId !== PLACEHOLDER_FIELD_ID),
              );

              delete prevFormStructure.fields[PLACEHOLDER_FIELD_ID];

              return {
                ...prevFormStructure,
                sections: {
                  ...prevFormStructure.sections,
                },
                fields: {
                  ...prevFormStructure.fields,
                },
              };
            }

            return prevFormStructure;
          });
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {

    }
  };

  return (
    <FormSandboxContext.Provider value={{ draggingState, setDragging }}>
      <DndContext sensors={sensors}
                  collisionDetection={
                    draggingState.draggingElement?.type ?
                      COLLISION_DETECTION[draggingState.draggingElement?.type] :
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