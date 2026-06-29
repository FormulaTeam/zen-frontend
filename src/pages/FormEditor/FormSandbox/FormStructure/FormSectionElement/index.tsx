import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AccordionDetails, Button, FormControl, FormHelperText, Tooltip } from "@mui/material";
import { FormField, useFormStructureContext } from "../../../context/FormStructureContext";
import styles from "./style.module.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConfirmDeleteDialog from "@components/BasePopup/ConfirmDeleteDialog";

import { texts } from "@utils/texts";
import { useContext } from "react";
import { FormEditorContext } from "@src/pages/FormEditor/context/FormEditorContext";
import { useConfirmDeleteExistingField } from "@src/pages/FormEditor/hooks/useConfirmDeleteExistingField";
import { FormFieldElement } from "../FormFieldElement";
import { DraggableElementData } from "../../context/FormSandboxContext";
import { useDndContext, useDroppable } from "@dnd-kit/core";
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
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

interface Props {
  id: string;
}

function FormSectionElement({ id }: Props) {
  const {
    formStructure,
    deleteSection,
    renameSection,
    toggleSectionExpanded,
    deleteField,
    setFieldData,
  } = useFormStructureContext();

  const { active: draggingElement } = useDndContext();

  const self = formStructure.sections[id];
  const activeElementType = (draggingElement?.data.current as DraggableElementData | undefined)
    ?.elementType;

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
    disabled: activeElementType !== undefined && activeElementType !== "section",
  });
  const { setNodeRef: setBottomDropZoneRef } = useDroppable({
    id: `${id}-bottom-drop-zone`,
    data: {
      elementType: "sectionBottom",
      sectionId: id,
    } as DraggableElementData,
    disabled: !self.expanded || self.fieldIds.length === 0 || activeElementType === "section",
  });

  const { originalFieldIds } = useContext(FormEditorContext) || {};
  const { requestConfirm, ConfirmDialog } = useConfirmDeleteExistingField();

  const isLastSection = Object.keys(formStructure.sections).length <= 1;

  const [showAlertMsg, setShowAlertMsg] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isTitleHovered, setIsTitleHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const lastLengthRef = useRef(self.fieldIds.length);

  useEffect(() => {
    setNodeRef(containerRef.current);
    if (!active) {
      containerRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const prevLength = lastLengthRef.current;
    lastLengthRef.current = self.fieldIds.length;

    // Only auto-expand when a new field is added (length increased) AND no drag-and-drop operation is active
    if (self.fieldIds.length > prevLength && !draggingElement) {
      if (!self.expanded) {
        toggleSectionExpanded(id);
      }
    }
  }, [self.fieldIds.length, draggingElement, self.expanded, id, toggleSectionExpanded]);

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
  const sectionTitleError = useMemo(
    () => self.validationErrors?.find((error) => error !== texts.heb.emptySectionAlert) ?? null,
    [self.validationErrors],
  );
  const hasSectionTitleError = !!sectionTitleError;

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

  const sectionTitle: JSX.Element = (
    <Tooltip title={isEditingTitle ? "" : "עריכת מקטע"} placement="top">
      <div
        onMouseEnter={() => setIsTitleHovered(true)}
        onMouseLeave={() => setIsTitleHovered(false)}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();

          if (!isEditingTitle) {
            setEditedTitle(self.title);
            setIsEditingTitle(true);
          }
        }}
        style={{
          display: "inline-flex",
          alignItems: isEditingTitle ? "flex-start" : "center",
          gap: 7,
          maxWidth: "100%",
          direction: "rtl",
          cursor: isEditingTitle ? "text" : "pointer",
        }}>
        <div
          style={{
            minWidth: 0,
            maxWidth: "100%",
          }}>
          {isEditingTitle ? (
            <FormControl error={isEditedTitleEmpty || hasSectionTitleError} variant="standard">
              <SectionTitleInput
                value={editedTitle}
                autoFocus
                inputRef={titleInputRef}
                placeholder={texts.heb.undefinedSection}
                error={isEditedTitleEmpty || hasSectionTitleError}
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

              {isEditedTitleEmpty ? (
                <FormHelperText>שם מקטע הוא שדה חובה</FormHelperText>
              ) : sectionTitleError ? (
                <FormHelperText>{sectionTitleError}</FormHelperText>
              ) : null}
            </FormControl>
          ) : (
            <>
              <SectionTitleText variant="body1">
                <OverflowTooltip title={self.title || texts.heb.undefinedSection} placement="top">
                  <span className={!self.title ? styles.emptyTitle : ""}>
                    {self.title || texts.heb.undefinedSection}
                  </span>
                </OverflowTooltip>
              </SectionTitleText>

              {sectionTitleError ? (
                <FormHelperText
                  error
                  sx={{
                    m: 0,
                    mt: 0.25,
                    textAlign: "right",
                    lineHeight: 1.2,
                  }}>
                  {sectionTitleError}
                </FormHelperText>
              ) : null}
            </>
          )}
        </div>

        <EditOutlinedIcon
          sx={{
            fontSize: 21,
            color: isEditingTitle ? "primary.main" : "text.secondary",
            opacity: isEditingTitle || isTitleHovered ? 0.85 : 0.38,
            transform: isEditingTitle || isTitleHovered ? "translateX(0)" : "translateX(2px)",
            transition: "opacity 140ms ease, transform 140ms ease, color 140ms ease",
            flexShrink: 0,
            mt: isEditingTitle ? "5px" : "1px",
            pointerEvents: "none",
          }}
        />
      </div>
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

  const alertMsgDialog = (
    <ConfirmDeleteDialog
      open={showAlertMsg}
      title="מחיקת מקטע"
      message={texts.heb.removeSectionAlert}
      onConfirm={() => {
        deleteSection(id);
        setShowAlertMsg(false);
      }}
      onClose={() => setShowAlertMsg(false)}
      confirmText={texts.heb.deleteSection}
    />
  );

  const resizeHandle: JSX.Element = (
    <ResizeHandleWrapper>
      <ResizeHandleBar />
    </ResizeHandleWrapper>
  );

  const bottomDropZone: JSX.Element | null = self.fieldIds.length ? (
    <div ref={setBottomDropZoneRef} className={styles.bottomDropZone} />
  ) : null;

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
      {bottomDropZone}
    </AccordionDetails>
  );

  const emptyPlaceholder: JSX.Element = (
    <div className={styles.emptySectionPlaceholder} style={{ flexDirection: "column", gap: "8px" }}>
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
        className={`${styles.container} ${self.validationErrors?.length ? styles.sectionError : ""}`}
        expanded={self.expanded}
        ref={containerRef}
        style={style}
        {...attributes}>
        <StyledAccordionSummary ref={setActivatorNodeRef} {...listeners}>
          <div className={styles.title}>{sectionTitle}</div>
          {toggleExpandButton}
          {deleteSectionButton}
        </StyledAccordionSummary>

        {self.expanded && (
          <SortableContext
            items={self.fieldIds}
            strategy={verticalListSortingStrategy}
            disabled={activeElementType === "section"}>
            <StyledResizable
              minHeight={200}
              enable={{ bottom: !activeElementType }}
              handleComponent={{
                bottom: resizeHandle,
              }}>
              {self.fieldIds.length ? fieldsList : emptyPlaceholder}
            </StyledResizable>
          </SortableContext>
        )}
      </StyledAccordion>
    </>
  );
}

export { FormSectionElement };
