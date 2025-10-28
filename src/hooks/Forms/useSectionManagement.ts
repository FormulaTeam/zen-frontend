import { useCallback, useState } from "react";
import { FormField, Section } from "../../utils/interfaces";
import { texts } from "../../utils/texts";
import { DraggableLocation } from "@hello-pangea/dnd";

interface UseSectionManagementProps {
  initialSections?: Section[];
  formFields: FormField[];
  setFormFields: React.Dispatch<React.SetStateAction<FormField[]>>;
  validateUnsavedChanges: () => void;
  setAlertMsgs: React.Dispatch<React.SetStateAction<string[]>>;
  setShowAlertMsg: (show: boolean) => void;
  setCurrentSectionId: (id: string) => void;
  setShowButtonsOnPopup: (show: boolean) => void;
}

export function useSectionManagement({
                                       formFields,
                                       setFormFields,
                                       validateUnsavedChanges,
                                       setAlertMsgs,
                                       setShowAlertMsg,
                                       setCurrentSectionId,
                                       setShowButtonsOnPopup,
                                     }: UseSectionManagementProps) {
  const [sections, setSections] = useState<Section[]>([]);

  const upsertSection = (newSection: Section, prevSections: Section[]) => {
    const filtered = prevSections.filter((s) => s.id !== newSection.id);
    return [...filtered, newSection].sort((a, b) => a.order - b.order);
  };

  const addSection = useCallback(() => {
    setSections((prev) => {
      const maxOrder = Math.max(...prev.map((s) => s.order), -1);
      const newSection = {
        id: `section_${Date.now()}`,
        name: texts.heb.undefinedSection,
        collapsed: false,
        order: maxOrder + 1,
      };
      return upsertSection(newSection, prev);
    });
  }, []);

  const removeSection = useCallback(
    (id: string) => {
      setSections((prev) => prev.filter((s) => s.id !== id));

      setFormFields((prev) => {
        const updatedFields = prev.filter((field) => field.sectionId !== id);
        validateUnsavedChanges();
        return updatedFields;
      });

      setAlertMsgs([]);
      setShowAlertMsg(false);
      setCurrentSectionId("");
    },
    [setFormFields, setAlertMsgs, setShowAlertMsg, setCurrentSectionId],
  );

  const renameSection = useCallback(
    (id: string, name: string) => {
      const trimmedName = name?.trim();
      if (!trimmedName) {
        setAlertMsgs((prev) => [...prev, texts.heb.emptySectionNameAlert]);
        setShowAlertMsg(true);
        return false;
      }

      setSections((prev) => {
        const section = prev.find((s) => s.id === id);
        if (section?.name === trimmedName) return prev;
        return upsertSection({ ...section!, name: trimmedName }, prev);
      });

      setFormFields((prev) => {
        const updatedFields = prev.map((field) =>
          field.sectionId === id ? { ...field, sectionName: trimmedName } : field,
        );
        validateUnsavedChanges();
        return updatedFields;
      });

      setShowAlertMsg(false);
      setShowButtonsOnPopup(false);
      return true;
    },
    [setFormFields, validateUnsavedChanges, setAlertMsgs, setShowAlertMsg, setShowButtonsOnPopup],
  );

  const changeSectionDescription = useCallback(
    (id: string, desc: string) => {
      setSections((prev) => {
        const section = prev.find((s) => s.id === id);
        return section ? upsertSection({ ...section, description: desc }, prev) : prev;
      });

      setFormFields((prev) => {
        const updatedFields = prev.map((field) =>
          field.sectionId === id ? { ...field, sectionDescription: desc } : field,
        );
        validateUnsavedChanges();
        return updatedFields;
      });
    },
    [setFormFields],
  );

  const toggleCollapse = useCallback((id: string) => {
    setSections((prev) => {
      const section = prev.find((s) => s.id === id);
      return section ? upsertSection({ ...section, collapsed: !section.collapsed }, prev) : prev;
    });
  }, []);

  const orderSections = (fields: FormField[]) => {
    const sectionOrderMap = new Map<string, number>();
    fields.forEach((field) => {
      if (field.sectionId && !sectionOrderMap.has(field.sectionId)) {
        sectionOrderMap.set(field.sectionId, field.sectionOrder || 0);
      }
    });

    setSections((prev) => {
      let sectionMap = new Map<string, Section>();

      // Start from current sections
      prev.forEach((section) => {
        sectionMap.set(section.id, {
          ...section,
          order: sectionOrderMap.get(section.id) ?? section.order,
        });
      });

      // Add or update from fields (overwrite if already exists)
      fields.forEach((field) => {
        if (!field.sectionId) return;
        sectionMap.set(field.sectionId, {
          id: field.sectionId,
          name: field.sectionName || texts.heb.undefinedSection,
          collapsed: sectionMap.get(field.sectionId)?.collapsed ?? false,
          order: sectionOrderMap.get(field.sectionId) ?? 0,
          description: sectionMap.get(field.sectionId)?.description ?? "",
        });
      });

      return Array.from(sectionMap.values()).sort((a, b) => a.order - b.order);
    });
  };

  const anounceRemoveSection = useCallback(
    (sectionId: string) => {
      setShowAlertMsg(true);
      if (sections.length === 1) {
        setAlertMsgs((prev) => [...prev, texts.heb.cantRemoveLastSection]);
        return;
      }
      const relatedFieldsCount = formFields.filter((field) => field.sectionId === sectionId).length;
      if (relatedFieldsCount > 0) {
        setAlertMsgs((prev) => [...prev, texts.heb.removeSectionAlert]);
        setCurrentSectionId(sectionId);
      } else {
        removeSection(sectionId);
      }
    },
    [sections.length, formFields, setAlertMsgs, setShowAlertMsg, setCurrentSectionId],
  );

  const moveSection = (source: DraggableLocation, destination: DraggableLocation) => {
    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    const uniqueSectionOrders = [...new Set(formFields.map((f) => f.sectionOrder ?? 0))].sort(
      (a, b) => a - b,
    );

    const updatedSectionOrders = [...uniqueSectionOrders];
    const [moved] = updatedSectionOrders.splice(sourceIndex, 1);
    updatedSectionOrders.splice(destinationIndex, 0, moved);

    const updatedFormFields = formFields.map((field) => {
      const currentOrder = field.sectionOrder ?? 0;
      const newOrder = updatedSectionOrders.indexOf(currentOrder);
      return { ...field, sectionOrder: newOrder };
    });

    setFormFields(updatedFormFields);
    validateUnsavedChanges();

    setSections((prev) => {
      const reordered = [...prev];
      const [movedSection] = reordered.splice(sourceIndex, 1);
      reordered.splice(destinationIndex, 0, movedSection);
      return reordered.map((section, index) => ({ ...section, order: index }));
    });
  };

  const handleScrollToLastSection = () => {
    if (sections.length === 0) return;
    const lastSection = sections[sections.length - 1];
    const el = document.getElementById(lastSection.id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return {
    sections,
    setSections,
    addSection,
    removeSection,
    renameSection,
    toggleCollapse,
    changeSectionDescription,
    orderSections,
    anounceRemoveSection,
    moveSection,
    handleScrollToLastSection,
  };
}
