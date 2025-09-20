import React, { useEffect, useRef, useState } from "react";
import {
  Draggable,
  DraggableProvided,
  DraggableProvidedDragHandleProps,
  DraggableStateSnapshot,
  Droppable,
  DroppableProvided,
} from "@hello-pangea/dnd";
import {
  EmptyMessageWrapper,
  FieldsColumn,
  ResizeHandle,
  SectionContainer,
} from "./sections.styled";
import { Box, Typography, useTheme, Tooltip } from "@mui/material";
import { Add, DragHandle } from "@mui/icons-material";
import { texts } from "../../utils/texts";
import { FormField, Section } from "../../utils/interfaces";
import {
  FORM_FIELD_PREFIX,
  FORM_FIELDS_PREFIX,
  NOT_A_SECTION_ID,
} from "../../utils/sections/consts";

interface FormFieldsListProps {
  formFields: FormField[];
  getFormProperty: (formField: FormField, dragHandleProps: DraggableProvidedDragHandleProps) => any;
  section: Section;
}

const replaceSectionIdPrefix = (sectionId: string) => {
  if (!sectionId) {
    return NOT_A_SECTION_ID;
  }
  return sectionId.replace(FORM_FIELDS_PREFIX, "");
};

export default function FormFieldsList({
  formFields,
  getFormProperty,
  section,
}: FormFieldsListProps) {
  const theme = useTheme();
  const lastFieldRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isResizing = useRef(false);

  const [sectionHeight, setSectionHeight] = useState<number | null>(null);

  const filteredFields = formFields.filter(
    (field) =>
      replaceSectionIdPrefix(field.sectionId) === section.id ||
      (replaceSectionIdPrefix(section.id) === NOT_A_SECTION_ID &&
        replaceSectionIdPrefix(field.sectionId) === NOT_A_SECTION_ID),
  );
  const isEmpty = filteredFields.length === 0;
  const dropId = section.id.includes(FORM_FIELDS_PREFIX)
    ? section.id
    : FORM_FIELDS_PREFIX + section.id;

  useEffect(() => {
    if (section.expanded && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [section.expanded]);

  useEffect(() => {
    if (lastFieldRef.current) {
      lastFieldRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [filteredFields.length]);

  useEffect(() => {
    if (containerRef.current) {
      const contentHeight = containerRef.current.scrollHeight;
      if (contentHeight > (sectionHeight || 0)) {
        setSectionHeight(contentHeight);
      }
    }
  }, [formFields.length]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing.current && containerRef.current) {
        const newHeight = e.clientY - containerRef.current.getBoundingClientRect().top;
        setSectionHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <Droppable droppableId={dropId} key={dropId}>
      {(provided: DroppableProvided, snapshot) => {
        const sectionContent = (
          <SectionContainer
            ref={(el) => {
              containerRef.current = el;
              provided.innerRef(el);
            }}
            {...provided.droppableProps}
            empty={isEmpty}
            theme={theme}
            $isDraggingOver={snapshot.isDraggingOver}
            expanded={!!section.expanded}
            style={sectionHeight !== null ? { height: sectionHeight } : {}}>
            <FieldsColumn>
              {isEmpty ? (
                <EmptyMessageWrapper>
                  <Typography variant="h4" color={theme.palette.text.disabled}>
                    {texts.heb.addByDragAndDrop}
                  </Typography>
                  <Add color="disabled" fontSize="large" />
                </EmptyMessageWrapper>
              ) : (
                <>
                  {formFields
                    .slice()
                    .sort((a, b) => a.index - b.index)
                    .map((field, idx) => {
                      if (field?.sectionId && field.sectionId.includes(FORM_FIELDS_PREFIX)) {
                        field.sectionId = replaceSectionIdPrefix(field.sectionId);
                      }

                      const belongsToCurrentSection =
                        section.id === NOT_A_SECTION_ID
                          ? field.sectionId === NOT_A_SECTION_ID
                          : field.sectionId === section.id;

                      if (!belongsToCurrentSection) return null;

                      const isLastField = idx === formFields.length - 1;

                      return (
                        <Draggable draggableId={FORM_FIELD_PREFIX + idx} key={idx} index={idx}>
                          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                            const id = "formField-div-" + idx;
                            return (
                              <Box
                                key={field.index}
                                ref={(el) => {
                                  if (isLastField)
                                    lastFieldRef.current = el as HTMLDivElement | null;
                                  provided.innerRef(el as HTMLDivElement | null);
                                }}
                                {...provided.draggableProps}
                                className="formField-div"
                                id={id}
                                sx={{ width: "100%" }}
                                style={{ ...provided.draggableProps.style }}>
                                {provided.dragHandleProps &&
                                  getFormProperty(field, provided.dragHandleProps)}
                              </Box>
                            );
                          }}
                        </Draggable>
                      );
                    })}
                  {provided.placeholder}
                </>
              )}
            </FieldsColumn>

            <Tooltip title="גרור כדי לשנות את גובה המקטע" placement="top">
              <ResizeHandle
                onMouseDown={(e) => {
                  isResizing.current = true;
                  e.preventDefault();
                }}>
                <DragHandle sx={{ color: theme.palette.text.secondary }} />
              </ResizeHandle>
            </Tooltip>
          </SectionContainer>
        );

        return snapshot.isDraggingOver ? (
          <Tooltip title="ניתן לגלול לקצוות השדה בעזרת סמן הגלילה" placement="top" arrow open>
            <Box>{sectionContent}</Box>
          </Tooltip>
        ) : (
          sectionContent
        );
      }}
    </Droppable>
  );
}
