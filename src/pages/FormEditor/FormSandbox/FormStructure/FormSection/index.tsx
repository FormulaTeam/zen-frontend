import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Accordion, AccordionDetails, AccordionSummary, Button, Input, Typography } from "@mui/material";
import { useFormStructureContext } from "../../../context/FormStructureContext";
import styles from "./style.module.css";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Close,
  DeleteOutlined,
  DriveFileRenameOutline,
  ExpandMore,
  KeyboardDoubleArrowRight,
} from "@mui/icons-material";
import { FormFieldElement } from "../FormFieldElement";
import { DraggableElementData, useFormSandboxContext } from "../../../context/FormSandboxContext";

interface Props {
  id: string;

  onDrag?: (sectionId: string) => void;
  onDrop?: () => void;
}

function FormSection({ id, onDrag, onDrop }: Props) {
  const {
          attributes,
          listeners,
          setNodeRef,
          setActivatorNodeRef,
          setDroppableNodeRef,
          transform,
          transition,
          isDragging,
        } = useSortable({ id, data: { elementType: "section" } as DraggableElementData });

  const { handleDrag, handleDrop } = useFormSandboxContext("field");
  const { formStructure, deleteSection, renameSection } = useFormStructureContext();

  const self = formStructure.sections[id];
  const isLastSection = Object.keys(formStructure.sections).length <= 1;
  const [isExpanded, setIsExpanded] = useState(true);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  const titleInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNodeRef(containerRef.current);
    setDroppableNodeRef(containerRef.current);
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    isDragging ? onDrag?.(id) : onDrop?.();
  }, [isDragging, onDrag, onDrop]);

  useEffect(() => {
    isDragging && setIsEditingTitle(false);
  }, [isDragging]);

  useEffect(() => {
    isEditingTitle && titleInputRef.current?.focus();
  }, [isEditingTitle, titleInputRef.current]);

  useEffect(() => {
    isExpanded &&
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isExpanded]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
  };

  return (
    <Accordion className={styles.container}
               sx={{
                 backgroundColor: "transparent",
                 boxShadow: "none",
               }}
               ref={containerRef}
               style={style} {...attributes}
               expanded={isExpanded}>
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
                <Input value={editedTitle}
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
                        onClick={(e) => {
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
                  setIsExpanded((prev) => !prev);
                  e.stopPropagation();
                }}>
          <ExpandMore sx={{ fontSize: 25 }} style={{ rotate: isExpanded ? "180deg" : "0deg" }} />
        </Button>
        <Button className={styles.button}
                disabled={isLastSection}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  deleteSection(id);
                  e.stopPropagation();
                }}>
          <DeleteOutlined sx={{ fontSize: 25, color: isLastSection ? "#85878D" : "#b53442" }} />
        </Button>
      </AccordionSummary>
      <SortableContext items={formStructure.sections[id].fieldIds} strategy={verticalListSortingStrategy}>
        <AccordionDetails className={styles.content}>
          {
            self.fieldIds.length ?
              self.fieldIds.map((fieldId) => <FormFieldElement key={fieldId}
                                                               field={formStructure.fields[fieldId]}
                                                               onDrag={handleDrag}
                                                               onDrop={handleDrop} />)
              : (
                <div className={styles.emptySectionPlaceholder}>
                  <KeyboardDoubleArrowRight className={styles.catalogArrowIcon}
                                            sx={{
                                              fontSize: 35,
                                              marginTop: 0.5,
                                              marginInlineEnd: 1,
                                              color: "#A3A6AE",
                                            }} />
                  <Typography color={"#a7abb1"} variant={"h4"} align={"center"}>
                    להוספת שדה לטופס ניתן לגרור שדה מקטלוג השדות בצד
                  </Typography>
                </div>
              )
          }
        </AccordionDetails>
      </SortableContext>
    </Accordion>
  );
}

export { FormSection };