import React, { useEffect, useRef, useState } from "react";
import {
  Draggable,
  DraggableProvided,
  DraggableProvidedDragHandleProps,
  Droppable,
  DroppableProvided,
} from "@hello-pangea/dnd";
import {
  EmptyMessageWrapper,
  FieldsColumn,
  ResizeHandle,
  SectionContainer,
} from "./sections.styled";
import { Box, Tooltip, Typography, useTheme } from "@mui/material";
import { Add, DragHandle } from "@mui/icons-material";
import { texts } from "../../utils/texts";
import { Section } from "../../utils/interfaces";
import {
  FORM_FIELD_PREFIX,
  FORM_FIELDS_PREFIX,
  NOT_A_SECTION_ID,
} from "../../utils/sections/consts";
import { FormFieldDto } from "../../types/shared";

type EditorFieldExtra = {
  sectionId?: string;
  sectionOrder?: number;
  sectionName?: string;
  sectionDescription?: string;
};

type EditorFormField = FormFieldDto & {
  extra?: EditorFieldExtra;
};

interface FormFieldsListProps {
  formFields: EditorFormField[];
  getFormProperty: (
    formField: EditorFormField,
    dragHandleProps: DraggableProvidedDragHandleProps,
  ) => React.ReactNode;
  section: Section;
}

const getFieldExtra = (field: EditorFormField): EditorFieldExtra =>
  (field.extra as EditorFieldExtra | undefined) ?? {};

const replaceSectionIdPrefix = (sectionId?: string) => {
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
  const lastFieldId = useRef<string | null>(null);
  const previousLastFieldId = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isResizing = useRef(false);

  const [sectionHeight, setSectionHeight] = useState<number | null>(null);

  const filteredFields = formFields
    .filter((field) => {
      const fieldSectionId = replaceSectionIdPrefix(getFieldExtra(field).sectionId);
      return (
        fieldSectionId === section.id ||
        (replaceSectionIdPrefix(section.id) === NOT_A_SECTION_ID &&
          fieldSectionId === NOT_A_SECTION_ID)
      );
    })
    .sort((a, b) => a.index - b.index);

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
    if (lastFieldRef.current && previousLastFieldId.current !== lastFieldId.current) {
      lastFieldRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
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
  }, [sectionHeight]);

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
                  {filteredFields.map((field, idx) => {
                    const isLastField = idx === filteredFields.length - 1;

                    return (
                      <Draggable
                        draggableId={FORM_FIELD_PREFIX + field.id}
                        key={field.id}
                        index={idx}>
                        {(provided: DraggableProvided) => {
                          const id = "formField-div-" + field.id;

                          return (
                            <Box
                              key={field.id}
                              ref={(el) => {
                                if (isLastField) {
                                  previousLastFieldId.current = lastFieldId.current;
                                  lastFieldId.current = field.id;
                                  lastFieldRef.current = el as HTMLDivElement | null;
                                }
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
