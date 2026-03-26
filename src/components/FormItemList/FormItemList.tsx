import { Draggable, DraggableProvided, DraggableStateSnapshot, Droppable } from "@hello-pangea/dnd";
import { Box, Button, Paper, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { FORM_ELEMENT_ICONS } from "../FORM_ELEMENT_ICONS";
import { useEffect, useState } from "react";
import { Add, Info, Settings } from "@mui/icons-material";
import { texts } from "../../utils/texts";
import { FormElements } from "../../utils/interfaces";

interface Props {
  items: Partial<FormElements>;
  addItemToFormFields: any;
  customFields: any;
  addSection: any;
  openConditionsPopup: any;
}

function FormItemList({
  items,
  addItemToFormFields,
  customFields,
  addSection,
  openConditionsPopup,
}: Props) {
  const theme = useTheme();

  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const categories: string[] = Array.from(
      new Set(customFields.filter((item) => item.category).map((item) => item.category)),
    );
    setCategories(categories);
  }, [customFields]);

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      gap={2}
      sx={{
        position: "sticky",
        top: "164px",
        zIndex: 10,
      }}>
      <Box
        mb={0}
        textAlign="right"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={1}>
        <Button variant="contained" startIcon={<Add />} onClick={addSection}>
          {texts.heb.createSection}
        </Button>
        <Tooltip title={texts.heb.createSectionAnnounce}>
          <Info color="disabled" sx={{ cursor: "pointer" }} />
        </Tooltip>{" "}
        <Button variant="contained" onClick={openConditionsPopup}>
          <Settings
            sx={{
              marginLeft: "4px",
            }}
          />{" "}
          {texts.heb.manageConditions}
        </Button>
        <Tooltip title={texts.heb.createConditionsAnnounce}>
          <Info color="disabled" sx={{ cursor: "pointer" }} />
        </Tooltip>
      </Box>
      {Object.keys(items).length > 0 && (
        <>
          <Typography variant="subtitle1">שדות מובנים</Typography>
          <Droppable droppableId="items" isDropDisabled={true}>
            {(provided) => (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.5rem",
                  backgroundColor: theme.palette.background.default,
                  borderRadius: "8px",
                  flexWrap: "wrap",
                }}
                ref={provided.innerRef}>
                {Object.keys(items).map((elementId, index) => (
                  <Draggable
                    draggableId={`c1_item_${elementId}_${index}`}
                    key={`item_${index}`}
                    index={index}
                    isDragDisabled={false}>
                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                      <Stack
                        alignItems={"center"}
                        justifyContent={"center"}
                        textAlign={"center"}
                        component={Paper}
                        sx={{
                          "&:hover": {
                            backgroundColor: theme.palette.background.default,
                          },
                          width: "31%",
                          height: "95px",
                          fontSize: "14px",
                          padding: "0.5rem",
                          boxShadow: `0px 4px 20.4px 0px ${theme.palette.shadow}`,
                        }}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        id={"item-div-" + index}
                        style={{
                          ...provided.draggableProps.style,
                        }}
                        onClick={() => {
                          if (!snapshot.isDragging) {
                            addItemToFormFields({ ...items[elementId], typeId: +elementId }, 1000);
                          }
                        }}>
                        <Typography>{FORM_ELEMENT_ICONS[items[elementId].icon]}</Typography>
                        <Typography variant="subtitle2" sx={{ overflowY: "auto" }}>
                          {items[elementId].name}
                        </Typography>
                      </Stack>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </>
      )}

      {categories.length > 0 &&
        categories.map(
          (category, index) =>
            customFields.filter((item) => item.category === category).length > 0 && (
              <Box key={index} display={"flex"} flexDirection={"column"} gap={2}>
                <Typography key={`${index}_0`} variant="subtitle1">
                  {category}
                </Typography>
                <Droppable key={`${index}_1`} droppableId={`cat_${index}`} isDropDisabled={true}>
                  {(provided) => (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "0.5rem",
                        backgroundColor: theme.palette.background.default,
                        borderRadius: "8px",
                        flexWrap: "wrap",
                      }}
                      ref={provided.innerRef}>
                      {customFields
                        .filter((item) => item.category === category)
                        .map((item, index) => (
                          <Draggable
                            draggableId={`c1_item_${customFields.indexOf(item)}`}
                            key={`item_${customFields.indexOf(item)}`}
                            index={customFields.indexOf(item)}
                            isDragDisabled={false}>
                            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                              <Stack
                                alignItems={"center"}
                                justifyContent={"center"}
                                textAlign={"center"}
                                component={Paper}
                                key={index}
                                sx={{
                                  "&:hover": {
                                    backgroundColor: theme.palette.background.default,
                                  },
                                  width: "31%",
                                  height: "95px",
                                  fontSize: "14px",
                                  padding: "0.5rem",
                                  boxShadow: `0px 4px 20.4px 0px ${theme.palette.shadow}`,
                                }}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                id={"item-div-" + index}
                                style={{
                                  ...provided.draggableProps.style,
                                }}
                                onClick={() => {
                                  if (!snapshot.isDragging) {
                                    addItemToFormFields(item, 1000);
                                  }
                                }}>
                                <Typography>{FORM_ELEMENT_ICONS[item.icon]}</Typography>
                                <Typography variant="subtitle2" sx={{ overflowY: "auto" }}>
                                  {item.name}
                                </Typography>
                              </Stack>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>
            ),
        )}

      {customFields.length === 0 && Object.keys(items).length === 0 && (
        <Typography>לא נמצאו שדות</Typography>
      )}
    </Box>
  );
}

export default FormItemList;
