import { FormField, FormStructure, useFormStructureContext } from "../context/FormStructureContext";
import { DragCancelEvent, DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { DraggableElementData, DraggingElement } from "../FormSandbox/context/FormSandboxContext";
import { arrayMove } from "@dnd-kit/sortable";
import { FORM_STRUCTURE_DROPPABLE_ID, PLACEHOLDER_FIELD_ID } from "../context/constants";
import { FormFieldTypeId } from "../../../utils/interfaces";
import { generateFieldId, generateNewFieldData } from "../utils";
import { useCallback, useState } from "react";

const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number): T[] | null => {
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return null;
  }

  return arrayMove(items, fromIndex, toIndex);
};

const removePlaceholderField = (
  prevFormStructure: ReturnType<typeof useFormStructureContext>["formStructure"],
) => {
  if (!(PLACEHOLDER_FIELD_ID in prevFormStructure.fields)) {
    return prevFormStructure;
  }

  const fields = { ...prevFormStructure.fields };
  const parentSectionId = fields[PLACEHOLDER_FIELD_ID].parentSectionId;
  const parentSection = {
    ...prevFormStructure.sections[parentSectionId],
    fieldIds: prevFormStructure.sections[parentSectionId].fieldIds.filter(
      (fieldId) => fieldId !== PLACEHOLDER_FIELD_ID,
    ),
  };

  delete fields[PLACEHOLDER_FIELD_ID];

  return {
    ...prevFormStructure,
    sections: {
      ...prevFormStructure.sections,
      [parentSectionId]: parentSection,
    },
    fields,
  };
};

const isOverFormStructure = (event: DragOverEvent | DragEndEvent): boolean => (
  event.collisions?.some((collision) => collision.id === FORM_STRUCTURE_DROPPABLE_ID) ?? false
);

const isCollidingWithId = (event: DragOverEvent | DragEndEvent, id: string): boolean => (
  event.collisions?.some((collision) => collision.id === id) ?? false
);

const isDraggingBelowFieldMiddle = (event: DragOverEvent | DragEndEvent): boolean => {
  const activeRect = event.active.rect.current.translated;
  const overRect = event.over?.rect;

  if (!activeRect || !overRect) {
    return false;
  }

  return activeRect.top + activeRect.height / 2 > overRect.top + overRect.height / 2;
};

const getFieldInsertIndex = (
  event: DragOverEvent | DragEndEvent,
  fieldIds: string[],
  overFieldId: string,
  movingFieldId?: string,
): number => {
  const fieldIdsWithoutMovingField = movingFieldId
    ? fieldIds.filter((fieldId) => fieldId !== movingFieldId)
    : fieldIds;
  const overFieldIndex = fieldIdsWithoutMovingField.indexOf(overFieldId);

  if (overFieldIndex === -1) {
    return fieldIdsWithoutMovingField.length;
  }

  return overFieldIndex + (isDraggingBelowFieldMiddle(event) ? 1 : 0);
};

const shouldKeepPlaceholderInCurrentSection = (
  formStructure: FormStructure,
  event: DragOverEvent,
  nextSectionId: string,
): boolean => {
  const placeholder = formStructure.fields[PLACEHOLDER_FIELD_ID];

  if (!placeholder || placeholder.parentSectionId === nextSectionId) {
    return false;
  }

  return (
    isCollidingWithId(event, PLACEHOLDER_FIELD_ID) ||
    isCollidingWithId(event, placeholder.parentSectionId) ||
    isCollidingWithId(event, `${placeholder.parentSectionId}-bottom-drop-zone`)
  );
};

function useFormDndHandlers() {
  const { setFormStructure } = useFormStructureContext();
  const [draggingElement, setDraggingElement] = useState<DraggingElement | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;

    setDraggingElement({
      id: active.id,
      type: (active.data.current as DraggableElementData).elementType as DraggingElement["type"],
    });
  }, [setDraggingElement]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    const activeElementType = (active.data.current as DraggableElementData).elementType;
    const overElementType = over
      ? (over.data.current as DraggableElementData | undefined)?.elementType
      : undefined;

    if (activeElementType === "field" && !over) {
      return;
    }

    if (activeElementType === "catalogItem" && !isOverFormStructure(event)) {
      setFormStructure(removePlaceholderField);
      return;
    }

    if (active.id !== over?.id && over?.id !== PLACEHOLDER_FIELD_ID) {
      setFormStructure((prevFormStructure) => {
        if (over && activeElementType === "section") {
          let sectionId: string;

          if ((over.data.current as DraggableElementData).elementType === "section") {
            sectionId = over.id as string;
          } else {
            return prevFormStructure;
          }

          const orderedSectionIds = [...prevFormStructure.orderedSectionIds];
          const movedSectionIds = moveItem(
            orderedSectionIds,
            orderedSectionIds.indexOf(active.id as string),
            orderedSectionIds.indexOf(sectionId),
          );

          if (!movedSectionIds) {
            return prevFormStructure;
          }

          return {
            ...prevFormStructure,
            orderedSectionIds: movedSectionIds,
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
              const newParentSection = {
                ...prevFormStructure.sections[newParentSectionId],
                fieldIds: [...prevFormStructure.sections[newParentSectionId].fieldIds],
              };

              if (newParentSectionId === oldParentSectionId || newParentSection.fieldIds.length > 0 || !newParentSection.expanded) {
                return prevFormStructure;
              }

              oldParentSection.fieldIds.splice(oldParentSection.fieldIds.indexOf(activeFieldId), 1);
              newParentSection.fieldIds.push(activeFieldId);

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
                    ...prevFormStructure.fields[activeFieldId],
                    parentSectionId: newParentSectionId,
                  },
                },
              };
            }
            if (overElementType === "sectionBottom") {
              const newParentSectionId = (over.data.current as DraggableElementData).sectionId;

              if (!newParentSectionId) {
                return prevFormStructure;
              }

              const newParentSection = {
                ...prevFormStructure.sections[newParentSectionId],
                fieldIds: [...prevFormStructure.sections[newParentSectionId].fieldIds],
              };

              if (newParentSectionId === oldParentSectionId) {
                const movedFieldIds = [
                  ...oldParentSection.fieldIds.filter((fieldId) => fieldId !== activeFieldId),
                  activeFieldId,
                ];

                if (movedFieldIds.join("|") === oldParentSection.fieldIds.join("|")) {
                  return prevFormStructure;
                }

                return {
                  ...prevFormStructure,
                  sections: {
                    ...prevFormStructure.sections,
                    [oldParentSectionId]: {
                      ...oldParentSection,
                      fieldIds: movedFieldIds,
                    },
                  },
                };
              }

              oldParentSection.fieldIds = oldParentSection.fieldIds.filter(
                (fieldId) => fieldId !== activeFieldId,
              );
              newParentSection.fieldIds.push(activeFieldId);

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
                    ...prevFormStructure.fields[activeFieldId],
                    parentSectionId: newParentSectionId,
                  },
                },
              };
            }
            if (overElementType === "field") {
              const overFieldId = over.id as string;
              const newParentSectionId = prevFormStructure.fields[overFieldId].parentSectionId;
              const newParentSection = {
                ...prevFormStructure.sections[newParentSectionId],
                fieldIds: [...prevFormStructure.sections[newParentSectionId].fieldIds],
              };

              if (newParentSectionId === oldParentSectionId) {
                const insertIndex = getFieldInsertIndex(
                  event,
                  oldParentSection.fieldIds,
                  overFieldId,
                  activeFieldId,
                );
                const movedFieldIds = oldParentSection.fieldIds.filter(
                  (fieldId) => fieldId !== activeFieldId,
                );

                movedFieldIds.splice(insertIndex, 0, activeFieldId);

                if (movedFieldIds.join("|") === oldParentSection.fieldIds.join("|")) {
                  return prevFormStructure;
                }

                newParentSection.fieldIds = movedFieldIds;

                return {
                  ...prevFormStructure,
                  sections: {
                    ...prevFormStructure.sections,
                    [newParentSectionId]: newParentSection,
                  },
                };
              }

              oldParentSection.fieldIds.splice(oldParentSection.fieldIds.indexOf(activeFieldId), 1);
              newParentSection.fieldIds.splice(
                getFieldInsertIndex(event, newParentSection.fieldIds, overFieldId),
                0,
                activeFieldId,
              );

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
                    ...prevFormStructure.fields[activeFieldId],
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
                if (shouldKeepPlaceholderInCurrentSection(prevFormStructure, event, newParentSectionId)) {
                  return prevFormStructure;
                }

                if (prevFormStructure.sections[newParentSectionId].fieldIds.length === 0) {
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
                          ...prevFormStructure.fields[PLACEHOLDER_FIELD_ID],
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
                        data: generateNewFieldData(+active.id as FormFieldTypeId),
                      },
                    },
                  };
                }

                return prevFormStructure;
              } else if (overElementType === "sectionBottom") {
                const sectionId = (over.data.current as DraggableElementData).sectionId;

                if (!sectionId) {
                  return prevFormStructure;
                }

                if (shouldKeepPlaceholderInCurrentSection(prevFormStructure, event, sectionId)) {
                  return prevFormStructure;
                }

                const fields = { ...prevFormStructure.fields };
                const sections = { ...prevFormStructure.sections };
                const targetSection = {
                  ...sections[sectionId],
                  fieldIds: [...sections[sectionId].fieldIds],
                };

                if (!(PLACEHOLDER_FIELD_ID in fields)) {
                  fields[PLACEHOLDER_FIELD_ID] = {
                    id: PLACEHOLDER_FIELD_ID,
                    parentSectionId: sectionId,
                    data: generateNewFieldData(+active.id as FormFieldTypeId),
                  };

                  targetSection.fieldIds.push(PLACEHOLDER_FIELD_ID);
                } else if (fields[PLACEHOLDER_FIELD_ID].parentSectionId !== sectionId) {
                  return prevFormStructure;
                } else if (targetSection.fieldIds.at(-1) !== PLACEHOLDER_FIELD_ID) {
                  targetSection.fieldIds = targetSection.fieldIds.filter(
                    (fieldId) => fieldId !== PLACEHOLDER_FIELD_ID,
                  );
                  targetSection.fieldIds.push(PLACEHOLDER_FIELD_ID);
                } else {
                  return prevFormStructure;
                }

                sections[sectionId] = targetSection;

                return {
                  ...prevFormStructure,
                  sections,
                  fields,
                };
              } else if (overElementType === "field") {
                const fields = { ...prevFormStructure.fields };
                const sections = { ...prevFormStructure.sections };

                const newParentSectionId = fields[over.id].parentSectionId;
                if (shouldKeepPlaceholderInCurrentSection(prevFormStructure, event, newParentSectionId)) {
                  return prevFormStructure;
                }

                const newParentSection = {
                  ...sections[newParentSectionId],
                  fieldIds: [...sections[newParentSectionId].fieldIds],
                };

                if (!(PLACEHOLDER_FIELD_ID in fields)) {
                  fields[PLACEHOLDER_FIELD_ID] = {
                    id: PLACEHOLDER_FIELD_ID,
                    parentSectionId: newParentSectionId,
                    data: generateNewFieldData(+active.id as FormFieldTypeId),
                  };

                  newParentSection.fieldIds.splice(
                    getFieldInsertIndex(event, newParentSection.fieldIds, over.id as string),
                    0,
                    PLACEHOLDER_FIELD_ID,
                  );
                } else if (fields[PLACEHOLDER_FIELD_ID].parentSectionId !== newParentSectionId) {
                  const oldParentSectionId = fields[PLACEHOLDER_FIELD_ID].parentSectionId;
                  const oldParentSection = {
                    ...sections[oldParentSectionId],
                    fieldIds: [...sections[oldParentSectionId].fieldIds],
                  };

                  oldParentSection.fieldIds.splice(oldParentSection.fieldIds.indexOf(PLACEHOLDER_FIELD_ID), 1);
                  sections[oldParentSectionId] = oldParentSection;

                  newParentSection.fieldIds.splice(
                    getFieldInsertIndex(event, newParentSection.fieldIds, over.id as string),
                    0,
                    PLACEHOLDER_FIELD_ID,
                  );

                  fields[PLACEHOLDER_FIELD_ID].parentSectionId = newParentSectionId;
                } else {
                  const insertIndex = getFieldInsertIndex(
                    event,
                    newParentSection.fieldIds,
                    over.id as string,
                    PLACEHOLDER_FIELD_ID,
                  );
                  const movedFieldIds = newParentSection.fieldIds.filter(
                    (fieldId) => fieldId !== PLACEHOLDER_FIELD_ID,
                  );

                  movedFieldIds.splice(insertIndex, 0, PLACEHOLDER_FIELD_ID);

                  if (movedFieldIds.join("|") === newParentSection.fieldIds.join("|")) {
                    return prevFormStructure;
                  }

                  newParentSection.fieldIds = movedFieldIds;
                }

                sections[newParentSectionId] = newParentSection;

                return {
                  ...prevFormStructure,
                  sections,
                  fields,
                };
              }

              if (overElementType === "formStructure") {
                return prevFormStructure;
              }
            } else {
              return prevFormStructure;
            }
          }
        }

        return prevFormStructure;
      });
    }
  }, [setFormStructure]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const activeElementType = (active.data.current as DraggableElementData).elementType;
    const overElementType = over
      ? (over.data.current as DraggableElementData | undefined)?.elementType
      : undefined;

    if (over && active.id !== over.id) {
      if (activeElementType === "field") {
        setFormStructure((prevFormStructure) => {
          const activeFieldId = active.id as string;
          const activeField = prevFormStructure.fields[activeFieldId];

          if (!activeField) {
            return prevFormStructure;
          }

          const oldParentSectionId = activeField.parentSectionId;
          const targetSectionId =
            overElementType === "section"
              ? (over.id as string)
              : overElementType === "sectionBottom"
                ? (over.data.current as DraggableElementData | undefined)?.sectionId
              : overElementType === "field"
                ? prevFormStructure.fields[over.id as string]?.parentSectionId
                : undefined;

          if (!targetSectionId) {
            return prevFormStructure;
          }

          const oldParentSection = {
            ...prevFormStructure.sections[oldParentSectionId],
            fieldIds: [...prevFormStructure.sections[oldParentSectionId].fieldIds],
          };
          const newParentSection = {
            ...prevFormStructure.sections[targetSectionId],
            fieldIds: [...prevFormStructure.sections[targetSectionId].fieldIds],
          };

          if (targetSectionId === oldParentSectionId) {
            const nextFieldIds = oldParentSection.fieldIds.filter(
              (fieldId) => fieldId !== activeFieldId,
            );
            const insertIndex = overElementType === "field"
              ? getFieldInsertIndex(event, oldParentSection.fieldIds, over.id as string, activeFieldId)
              : nextFieldIds.length;

            nextFieldIds.splice(insertIndex, 0, activeFieldId);

            if (nextFieldIds.join("|") === oldParentSection.fieldIds.join("|")) {
              return prevFormStructure;
            }

            return {
              ...prevFormStructure,
              sections: {
                ...prevFormStructure.sections,
                [oldParentSectionId]: {
                  ...oldParentSection,
                  fieldIds: nextFieldIds,
                },
              },
            };
          }

          oldParentSection.fieldIds = oldParentSection.fieldIds.filter(
            (fieldId) => fieldId !== activeFieldId,
          );

          if (overElementType === "field") {
            newParentSection.fieldIds.splice(
              getFieldInsertIndex(event, newParentSection.fieldIds, over.id as string),
              0,
              activeFieldId,
            );
          } else {
            newParentSection.fieldIds.push(activeFieldId);
          }

          return {
            ...prevFormStructure,
            sections: {
              ...prevFormStructure.sections,
              [oldParentSectionId]: oldParentSection,
              [targetSectionId]: newParentSection,
            },
            fields: {
              ...prevFormStructure.fields,
              [activeFieldId]: {
                ...activeField,
                parentSectionId: targetSectionId,
              },
            },
          };
        });
      }

    }

    if (activeElementType === "catalogItem") {
      setFormStructure((prevFormStructure) => {
        const fields = { ...prevFormStructure.fields };
        const placeholder = fields[PLACEHOLDER_FIELD_ID];
        const newFieldTypeId = placeholder?.data.typeId ?? (+active.id as FormFieldTypeId);

        if (placeholder) {
          const sections = { ...prevFormStructure.sections };
          const targetSectionId = placeholder.parentSectionId;
          const targetSection = {
            ...sections[targetSectionId],
            fieldIds: [...sections[targetSectionId].fieldIds],
          };

          const newField: FormField = {
            id: generateFieldId(),
            parentSectionId: targetSectionId,
            data: generateNewFieldData(newFieldTypeId),
          };

          delete fields[PLACEHOLDER_FIELD_ID];
          fields[newField.id] = newField;

          const placeholderIndex = targetSection.fieldIds.indexOf(PLACEHOLDER_FIELD_ID);
          if (placeholderIndex === -1) {
            targetSection.fieldIds.push(newField.id);
          } else {
            targetSection.fieldIds.splice(placeholderIndex, 1, newField.id);
          }

          sections[targetSectionId] = targetSection;

          return {
            ...prevFormStructure,
            sections,
            fields,
          };
        }

        const isValidFormDropTarget =
          over &&
          active.id !== over.id &&
          isOverFormStructure(event) &&
          (overElementType === "section" || overElementType === "sectionBottom" || overElementType === "field");

        if (isValidFormDropTarget) {
          const targetSectionId =
            overElementType === "section"
              ? (over?.id as string)
              : overElementType === "sectionBottom"
                ? (over?.data.current as DraggableElementData | undefined)?.sectionId
              : overElementType === "field"
                ? prevFormStructure.fields[over?.id as string]?.parentSectionId
              : undefined;

          if (!targetSectionId) {
            return removePlaceholderField(prevFormStructure);
          }

          const sections = { ...prevFormStructure.sections };
          const targetSection = {
            ...sections[targetSectionId],
            fieldIds: [...sections[targetSectionId].fieldIds],
          };
          const newField: FormField = {
            id: generateFieldId(),
            parentSectionId: targetSectionId,
            data: generateNewFieldData(newFieldTypeId),
          };

          fields[newField.id] = newField;

          if (overElementType === "field") {
            targetSection.fieldIds.splice(
              getFieldInsertIndex(event, targetSection.fieldIds, over?.id as string),
              0,
              newField.id,
            );
          } else {
            targetSection.fieldIds.push(newField.id);
          }

          sections[targetSectionId] = targetSection;

          return {
            ...prevFormStructure,
            sections,
            fields,
          };
        }

        return removePlaceholderField(prevFormStructure);
      });
    }

    setDraggingElement(null);
  }, [setDraggingElement, setFormStructure]);

  const handleDragCancel = useCallback((event: DragCancelEvent) => {
    const activeElementType = (event.active.data.current as DraggableElementData).elementType;

    if (activeElementType === "catalogItem") {
      setFormStructure(removePlaceholderField);
    }

    setDraggingElement(null);
  }, [setDraggingElement, setFormStructure]);

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    draggingElement,
  };
}

export { useFormDndHandlers };
