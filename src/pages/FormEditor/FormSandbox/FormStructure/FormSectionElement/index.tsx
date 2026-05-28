import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AccordionDetails, Button, FormControl, FormHelperText, Tooltip } from "@mui/material";
import { FormField, useFormStructureContext } from "../../../context/FormStructureContext";
import styles from "./style.module.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AlertMsg from "@components/AlertMsg/AlertMsg";

import { texts } from "@utils/texts";
import { useContext } from "react";
import { FormEditorContext } from "@src/pages/FormEditor/context/FormEditorContext";
import { useConfirmDeleteExistingField } from "@src/pages/FormEditor/hooks/useConfirmDeleteExistingField";
import { FormFieldElement } from "../FormFieldElement";
import { DraggableElementData } from "../../context/FormSandboxContext";
import { useDndContext } from "@dnd-kit/core";
import { FormFieldData } from "../../../schemas/fields";
import { OverflowTooltip } from "@components/OverflowTooltip";
import {
  SectionTitleText,
  StyledAccordion,
  StyledAccordionSummary,
  ResizeHandleWrapper,
  ResizeHandleBar,
  EmptyPlaceholderText,
  StyledResizable,
  ExpandIcon,
  DeleteIcon,
  CatalogArrowIcon,
  SectionTitleInput,
} from "./styled";

interface Props {
  id: string;
}

function FormSectionElement({ id }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    active,
    isDragging,
  } = useSortable({
    id,
    data: { elementType: "section" } as DraggableElementData,
    resizeObserverConfig: undefined as any,
  });

  const {
    formStructure,
    deleteSection,
    renameSection,
    toggleSectionExpanded,
    deleteField,
    setFieldData,
  } = useFormStructureContext();

  const { active: draggingElement } = useDndContext();

  const { originalFieldIds } = useContext(FormEditorContext) || {};
  const { requestConfirm, ConfirmDialog } = useConfirmDeleteExistingField();

  const isLastSection = Object.keys(formStructure.sections).length <= 1;

  const [showAlertMsg, setShowAlertMsg] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  const self = useMemo(() => formStructure.sections[id], [formStructure.sections, id]);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNodeRef(containerRef.current);
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!self.expanded) {
      toggleSectionExpanded(id);
    }
  }, [self.fieldIds.length]);

  useEffect(() => {
    active && setIsEditingTitle(false);
  }, [active]);

  useEffect(() => {
    isEditingTitle && titleInputRef.current?.focus();
  }, [isEditingTitle, titleInputRef.current]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
  };

  const isEditedTitleEmpty = editedTitle.trim().length === 0;

  const handleFieldDataChange = useCallback(
    (fieldId: string) => (data: Partial<FormFieldData>) => setFieldData(fieldId, data),
    [setFieldData],
  );

  const saveSectionTitle = useCallback(() => {
    const trimmedTitle = editedTitle.trim();

    if (!trimmedTitle) {
      return false;
    }

    renameSection(id, trimmedTitle);
    setIsEditingTitle(false);

    return true;
  }, [editedTitle, id, renameSection]);

  const cancelSectionTitleEdit = useCallback(() => {
    setEditedTitle(self.title);
    setIsEditingTitle(false);
  }, [self.title]);

  const sectionTitle: JSX.Element = isEditingTitle ? (
    <FormControl error={isEditedTitleEmpty} variant="standard">
      <SectionTitleInput
        value={editedTitle}
        autoFocus
        inputRef={titleInputRef}
        placeholder={texts.heb.undefinedSection}
        error={isEditedTitleEmpty}
        inputProps={{
          maxLength: 255,
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          setEditedTitle(e.target.value.trimStart());
        }}
        onBlur={() => {
          if (!saveSectionTitle()) {
            cancelSectionTitleEdit();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            saveSectionTitle();
          } else if (e.key === "Escape") {
            cancelSectionTitleEdit();
          }
        }}
      />

      {isEditedTitleEmpty ? <FormHelperText>שם מקטע הוא שדה חובה</FormHelperText> : null}
    </FormControl>
  ) : (
    <Tooltip title="עריכת מקטע" placement="top">
      <SectionTitleText
        variant="body1"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          setEditedTitle(self.title);
          setIsEditingTitle(true);
          e.stopPropagation();
        }}>
        <OverflowTooltip title={self.title || texts.heb.undefinedSection} placement="top">
          <span className={!self.title ? styles.emptyTitle : ""}>
            {self.title || texts.heb.undefinedSection}
          </span>
        </OverflowTooltip>
      </SectionTitleText>
    </Tooltip>
  );

  const toggleExpandButton: JSX.Element = (
    <Tooltip title={self.expanded ? "צמצום מקטע" : "הרחבת מקטע"} placement="top">
      <span style={{ display: "inline-block" }}>
        <Button
          className={styles.button}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            toggleSectionExpanded(id);
            e.stopPropagation();
          }}>
          <ExpandIcon expanded={self.expanded ? 1 : 0} />
        </Button>
      </span>
    </Tooltip>
  );

  const deleteSectionButton: JSX.Element = (
    <Tooltip
      title={isLastSection ? "לא ניתן למחוק את המקטע היחיד בטופס" : "מחיקת מקטע"}
      placement="top">
      <span style={{ display: "inline-block" }}>
        <Button
          className={styles.button}
          disabled={isLastSection}
          color="error"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            setShowAlertMsg(true);
            e.stopPropagation();
          }}>
          <DeleteIcon ownerState={{ isLastSection }} />
        </Button>
      </span>
    </Tooltip>
  );

  const alertMsgDialog = showAlertMsg && (
    <AlertMsg
      msg={[texts.heb.removeSectionAlert]}
      closePopup={() => setShowAlertMsg(false)}
      onOk={() => {
        deleteSection(id);
        setShowAlertMsg(false);
      }}
      sectionId={id}
    />
  );

  const resizeHandle: JSX.Element = (
    <ResizeHandleWrapper>
      <ResizeHandleBar />
    </ResizeHandleWrapper>
  );

  const fieldsList: JSX.Element = (
    <AccordionDetails className={styles.content}>
      {self.fieldIds.map((fieldId: string) => {
        const field: FormField = formStructure.fields[fieldId];
        const isExistingField: boolean = !!originalFieldIds && originalFieldIds.has(field?.id);

        return (
          <FormFieldElement
            key={fieldId}
            field={field}
            onDataChange={handleFieldDataChange(fieldId)}
            onDelete={() => {
              if (isExistingField) {
                requestConfirm(() => deleteField(fieldId));
              } else {
                deleteField(fieldId);
              }
            }}
          />
        );
      })}
    </AccordionDetails>
  );

  const emptyPlaceholder: JSX.Element = (
    <div className={styles.emptySectionPlaceholder}>
      <CatalogArrowIcon className={styles.catalogArrowIcon} />
      <EmptyPlaceholderText color="#a7abb1" variant="h5" align="center">
        ניתן להוסיף שדה למקטע באמצעות גרירה מקטלוג השדות בצד
      </EmptyPlaceholderText>
    </div>
  );

  return (
    <>
      {ConfirmDialog}
      {alertMsgDialog}

      <StyledAccordion
        className={styles.container}
        expanded={self.expanded}
        ref={containerRef}
        style={style}
        {...attributes}>
        <StyledAccordionSummary
          ref={setActivatorNodeRef}
          onClick={(e) => e.preventDefault()}
          {...listeners}>
          <div className={styles.title}>{sectionTitle}</div>
          {toggleExpandButton}
          {deleteSectionButton}
        </StyledAccordionSummary>

        <SortableContext
          items={formStructure.sections[id].fieldIds}
          strategy={verticalListSortingStrategy}
          disabled={
            (draggingElement?.data.current as DraggableElementData)?.elementType === "section"
          }>
          <StyledResizable
            minHeight={200}
            enable={{ bottom: true }}
            handleComponent={{
              bottom: resizeHandle,
            }}>
            {self.fieldIds.length ? fieldsList : emptyPlaceholder}
          </StyledResizable>
        </SortableContext>
      </StyledAccordion>
    </>
  );
}

export { FormSectionElement };
