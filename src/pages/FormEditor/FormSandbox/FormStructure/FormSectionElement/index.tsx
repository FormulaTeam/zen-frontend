import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Accordion, AccordionDetails, AccordionSummary, Button, TextField, Typography } from "@mui/material";
import { useFormStructureContext } from "../../../context/FormStructureContext";
import styles from "./style.module.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Close,
  DeleteOutlined,
  DriveFileRenameOutline,
  ExpandMore,
  KeyboardDoubleArrowRight,
} from "@mui/icons-material";
import { FormFieldElement } from "../FormFieldElement";
import { DraggableElementData } from "../../context/FormSandboxContext";
import { useDndContext } from "@dnd-kit/core";
import { FormFieldData } from "../../../schemas/fields";
import { Resizable } from "re-resizable";

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
  } = useSortable({ id, data: { elementType: "section" } as DraggableElementData });

  const {
    formStructure,
    deleteSection,
    renameSection,
    toggleSectionExpanded,
    deleteField,
    setFieldData,
  } = useFormStructureContext();
  const { active: draggingElement } = useDndContext();

  const isLastSection = Object.keys(formStructure.sections).length <= 1;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  const self = useMemo(() => formStructure.sections[id], [formStructure.sections, id]);

  const containerRef = useRef<HTMLDivElement>(null);

  const titleInputRef = useRef<HTMLDivElement>(null);

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

  const handleFieldDataChange = useCallback((fieldId: string) => (data: Partial<FormFieldData>) => setFieldData(fieldId, data), [setFieldData]);

  return (
    <Accordion className={styles.container}
      expanded={self.expanded}
      sx={{
        backgroundColor: "transparent",
        boxShadow: "none",
      }}
      ref={containerRef}
      style={style}
      {...attributes}>
      <AccordionSummary ref={setActivatorNodeRef}
        onClick={(e) => e.preventDefault()}
        sx={{
          minHeight: 0,
          "&.Mui-focusVisible": {
            backgroundColor: "transparent",
          },
          "&.MuiAccordionSummary-root": {
            padding: 0,
          },
          "& .MuiAccordionSummary-content": {
            "&.Mui-expanded": {
              margin: 0,
            },
            cursor: "grab",
            margin: 0,
            padding: "14px 20px",
            alignItems: "center",
          },
        }}
        {...listeners}>
        <div className={styles.title}>
          {
            isEditingTitle ? (
              <>
                <TextField value={editedTitle}
                  variant={"standard"}
                  inputRef={titleInputRef}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setEditedTitle(e.target.value)} />
                <Button className={styles.button}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(_) => {
                    renameSection(id, editedTitle);
                    setIsEditingTitle(false);
                  }}>
                  <Check sx={{ fontSize: 20, color: "#308e63" }} />
                </Button>
                <Button className={styles.button}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(_) => {
                    setIsEditingTitle(false);
                  }}>
                  <Close sx={{ fontSize: 20, color: "#a54160" }} />
                </Button>
              </>
            ) : (
              <>
                <Typography variant={"body1"}>{self.title}</Typography>
                <Button className={styles.button}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(_) => {
                    setEditedTitle(self.title);
                    setIsEditingTitle(true);
                  }}>
                  <DriveFileRenameOutline sx={{ fontSize: 20, color: "#506f9e" }} />
                </Button>
              </>
            )
          }
        </div>
        <Button className={styles.button}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            toggleSectionExpanded(id);
            e.stopPropagation();
          }}>
          <ExpandMore sx={{ fontSize: 25 }} style={{ rotate: self.expanded ? "180deg" : "0deg" }} />
        </Button>
        <Button className={styles.button}
          disabled={isLastSection}
          color={'error'}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            deleteSection(id);
            e.stopPropagation();
          }}>
          <DeleteOutlined sx={{ fontSize: 25, color: isLastSection ? "#85878D" : "#b53442" }} />
        </Button>
      </AccordionSummary>
      <SortableContext items={formStructure.sections[id].fieldIds}
        strategy={verticalListSortingStrategy}
        disabled={(draggingElement?.data.current as DraggableElementData)?.elementType === "section"}>
        <Resizable minHeight={200}
          enable={{ bottom: true }}
          style={{
            display: "flex",
            position: "relative",
            paddingBottom: 20,
          }}
          handleComponent={{
            bottom: (
              <div style={{
                position: "absolute",
                bottom: 4,
                width: "100%",
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FAFAFA",
                cursor: "s-resize",
              }}>
                <div style={{
                  width: 48,
                  height: 4,
                  background: "#a3a7ae",
                  borderRadius: 4,
                }} />
              </div>
            ),
          }}>
          {
            self.fieldIds.length ? (
              <AccordionDetails className={styles.content}>
                {
                  self.fieldIds.map((fieldId) => <FormFieldElement key={fieldId}
                    field={formStructure.fields[fieldId]}
                    onDataChange={handleFieldDataChange(fieldId)}
                    onDelete={() => deleteField(fieldId)} />)
                }
              </AccordionDetails>
            ) :
              (
                <div className={styles.emptySectionPlaceholder}>
                  <KeyboardDoubleArrowRight className={styles.catalogArrowIcon}
                    sx={{
                      fontSize: 35,
                      marginTop: 0.5,
                      marginInlineEnd: 1,
                      color: "#A3A6AE",
                    }} />
                  <Typography color={"#a7abb1"} variant={"h5"} align={"center"} sx={{ userSelect: "none" }}>
                    ניתן להוסיף שדה למקטע באמצעות גרירה מקטלוג השדות בצד
                  </Typography>
                </div>
              )
          }
        </Resizable>
      </SortableContext>
    </Accordion>
  )
    ;
}

export { FormSectionElement };