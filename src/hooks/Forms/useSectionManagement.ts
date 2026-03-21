import { useCallback, useState } from "react";
import { Section } from "../../utils/interfaces";
import { texts } from "../../utils/texts";
import { DraggableLocation } from "@hello-pangea/dnd";
import { FormFieldDto } from "../../types/shared";

type SectionFieldExtra = {
  sectionId?: string;
  sectionOrder?: number;
  sectionName?: string;
  sectionDescription?: string;
};

type EditorFormField = FormFieldDto & {
  extra?: SectionFieldExtra;
};

interface UseSectionManagementProps {
  initialSections?: Section[];
  formFields: EditorFormField[];
  setFormFields: React.Dispatch<React.SetStateAction<EditorFormField[]>>;
  validateUnsavedChanges: () => void;
  setAlertMsgs: React.Dispatch<React.SetStateAction<string[]>>;
  setShowAlertMsg: (show: boolean) => void;
  setCurrentSectionId: (id: string) => void;
  setShowButtonsOnPopup: (show: boolean) => void;
}

const getFieldExtra = (field: EditorFormField): SectionFieldExtra =>
  (field.extra as SectionFieldExtra | undefined) ?? {};

const updateFieldExtra = (
  field: EditorFormField,
  patch: Partial<SectionFieldExtra>,
): EditorFormField => ({
  ...field,
  extra: {
    ...getFieldExtra(field),
    ...patch,
  },
});

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
        const updatedFields = prev.filter((field) => getFieldExtra(field).sectionId !== id);
        validateUnsavedChanges();
        return updatedFields;
      });

      setAlertMsgs([]);
      setShowAlertMsg(false);
      setCurrentSectionId("");
    },
    [setFormFields, validateUnsavedChanges, setAlertMsgs, setShowAlertMsg, setCurrentSectionId],
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
          getFieldExtra(field).sectionId === id
            ? updateFieldExtra(field, { sectionName: trimmedName })
            : field,
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
          getFieldExtra(field).sectionId === id
            ? updateFieldExtra(field, { sectionDescription: desc })
            : field,
        );
        validateUnsavedChanges();
        return updatedFields;
      });
    },
    [setFormFields, validateUnsavedChanges],
  );

  const toggleCollapse = useCallback((id: string) => {
    setSections((prev) => {
      const section = prev.find((s) => s.id === id);
      return section ? upsertSection({ ...section, collapsed: !section.collapsed }, prev) : prev;
    });
  }, []);

  const orderSections = (fields: EditorFormField[]) => {
    const sectionOrderMap = new Map<string, number>();

    fields.forEach((field) => {
      const extra = getFieldExtra(field);
      if (extra.sectionId && !sectionOrderMap.has(extra.sectionId)) {
        sectionOrderMap.set(extra.sectionId, extra.sectionOrder || 0);
      }
    });

    setSections((prev) => {
      const sectionMap = new Map<string, Section>();

      prev.forEach((section) => {
        sectionMap.set(section.id, {
          ...section,
          order: sectionOrderMap.get(section.id) ?? section.order,
        });
      });

      fields.forEach((field) => {
        const extra = getFieldExtra(field);
        if (!extra.sectionId) return;

        sectionMap.set(extra.sectionId, {
          id: extra.sectionId,
          name: extra.sectionName || texts.heb.undefinedSection,
          collapsed: sectionMap.get(extra.sectionId)?.collapsed ?? false,
          order: sectionOrderMap.get(extra.sectionId) ?? 0,
          description:
            sectionMap.get(extra.sectionId)?.description ?? extra.sectionDescription ?? "",
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

      const relatedFieldsCount = formFields.filter(
        (field) => getFieldExtra(field).sectionId === sectionId,
      ).length;

      if (relatedFieldsCount > 0) {
        setAlertMsgs((prev) => [...prev, texts.heb.removeSectionAlert]);
        setCurrentSectionId(sectionId);
      } else {
        removeSection(sectionId);
      }
    },
    [
      sections.length,
      formFields,
      setAlertMsgs,
      setShowAlertMsg,
      setCurrentSectionId,
      removeSection,
    ],
  );

  const moveSection = (source: DraggableLocation, destination: DraggableLocation) => {
    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    const uniqueSectionOrders = [
      ...new Set(formFields.map((f) => getFieldExtra(f).sectionOrder ?? 0)),
    ].sort((a, b) => a - b);

    const updatedSectionOrders = [...uniqueSectionOrders];
    const [moved] = updatedSectionOrders.splice(sourceIndex, 1);
    updatedSectionOrders.splice(destinationIndex, 0, moved);

    const updatedFormFields = formFields.map((field) => {
      const currentOrder = getFieldExtra(field).sectionOrder ?? 0;
      const newOrder = updatedSectionOrders.indexOf(currentOrder);

      return updateFieldExtra(field, {
        sectionOrder: newOrder,
      });
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
