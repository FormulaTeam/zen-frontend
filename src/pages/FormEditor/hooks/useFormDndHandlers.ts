import { FormField, useFormStructureContext } from "../context/FormStructureContext";
import { DragCancelEvent, DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { DraggableElementData, DraggingElement } from "../FormSandbox/context/FormSandboxContext";
import { arrayMove } from "@dnd-kit/sortable";
import { PLACEHOLDER_FIELD_ID } from "../context/constants";
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

    if (activeElementType === "field" && (!over || overElementType === "section")) {
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
              const newParentSection = { ...prevFormStructure.sections[newParentSectionId] };

              if (newParentSection.fieldIds.length == 0 && newParentSection.expanded) {
                return prevFormStructure;
              }
            }
            if (overElementType === "sectionBottom") {
              return prevFormStructure;
            }
            if (overElementType === "field") {
              const overFieldId = over.id as string;
              const newParentSectionId = prevFormStructure.fields[overFieldId].parentSectionId;
              const newParentSection = {
                ...prevFormStructure.sections[newParentSectionId],
                fieldIds: [...prevFormStructure.sections[newParentSectionId].fieldIds],
              };

              if (newParentSectionId === oldParentSectionId) {
                const movedFieldIds = moveItem(
                  oldParentSection.fieldIds,
                  oldParentSection.fieldIds.indexOf(activeFieldId),
                  oldParentSection.fieldIds.indexOf(overFieldId),
                );

                if (!movedFieldIds) {
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
              newParentSection.fieldIds.splice(newParentSection.fieldIds.indexOf(overFieldId), 0, activeFieldId);

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
                  const oldParentSectionId = fields[PLACEHOLDER_FIELD_ID].parentSectionId;
                  const oldParentSection = {
                    ...sections[oldParentSectionId],
                    fieldIds: [...sections[oldParentSectionId].fieldIds],
                  };

                  oldParentSection.fieldIds = oldParentSection.fieldIds.filter(
                    (fieldId) => fieldId !== PLACEHOLDER_FIELD_ID,
                  );
                  sections[oldParentSectionId] = oldParentSection;

                  fields[PLACEHOLDER_FIELD_ID] = {
                    ...fields[PLACEHOLDER_FIELD_ID],
                    parentSectionId: sectionId,
                  };

                  targetSection.fieldIds.push(PLACEHOLDER_FIELD_ID);
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

                  fields[PLACEHOLDER_FIELD_ID].parentSectionId = newParentSectionId;
                } else {
                  const movedFieldIds = moveItem(
                    newParentSection.fieldIds,
                    newParentSection.fieldIds.indexOf(PLACEHOLDER_FIELD_ID),
                    newParentSection.fieldIds.indexOf(over.id as string),
                  );

                  if (!movedFieldIds) {
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

    if (over && active.id !== over.id) {
      const activeElementType = (active.data.current as DraggableElementData).elementType;
      const overElementType = (over.data.current as DraggableElementData | undefined)?.elementType;

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

          if (!targetSectionId || targetSectionId === oldParentSectionId) {
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

          oldParentSection.fieldIds = oldParentSection.fieldIds.filter(
            (fieldId) => fieldId !== activeFieldId,
          );

          if (overElementType === "field") {
            const overFieldIndex = newParentSection.fieldIds.indexOf(over.id as string);
            const insertIndex = overFieldIndex === -1 ? newParentSection.fieldIds.length : overFieldIndex;

            newParentSection.fieldIds.splice(insertIndex, 0, activeFieldId);
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

      if (activeElementType === "catalogItem") {
        setFormStructure((prevFormStructure) => {
          const fields = { ...prevFormStructure.fields };

          if (PLACEHOLDER_FIELD_ID in fields) {
            const placeholderFieldTypeId = fields[PLACEHOLDER_FIELD_ID].data.typeId;
            const parentSectionId = fields[PLACEHOLDER_FIELD_ID].parentSectionId;

            delete fields[PLACEHOLDER_FIELD_ID];

            const newField: FormField = {
              id: generateFieldId(),
              parentSectionId,
              data: generateNewFieldData(placeholderFieldTypeId),
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

          return removePlaceholderField(prevFormStructure);
        });
      }
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
