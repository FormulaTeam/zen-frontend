import { Droppable, Draggable, DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import {
  Autocomplete,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { fieldsIcons } from "../FieldsIcons";
import { useEffect, useState } from "react";
import { Add, Info, Search, Settings } from "@mui/icons-material";
import BaseFormInput from "../BaseFormInput/BaseFormInput";
import { texts } from "../../utils/texts";

function FormItemList({
  items,
  addItemToFormFields,
  customFields,
  addSection,
  openConditionsPopup,
}) {
  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredFields, setFilteredFields] = useState(items);
  const [filteredCustomFields, setFilteredCustomFields] = useState(customFields);

  useEffect(() => {
    const categories: string[] = Array.from(
      new Set(customFields.filter((item) => item.category).map((item) => item.category)),
    );
    setCategories(categories);
  }, [customFields]);

  useEffect(() => {
    setFilteredFields(
      items.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (selectedCategories.length === 0 || selectedCategories.includes(item.category)),
      ),
    );
    setFilteredCustomFields(
      customFields.filter(
        (item) =>
          item.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (selectedCategories.length === 0 || selectedCategories.includes(item.category)),
      ),
    );
  }, [searchTerm, selectedCategories, items, customFields]);

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
        <Tooltip title="ניהול תנאים לשדות ומקטעים - קבע מתי שדות יופיעו או יוסתרו בהתבסס על תשובות של שדות אחרים">
          <Info color="disabled" sx={{ cursor: "pointer" }} />
        </Tooltip>
      </Box>
      <Box
        mb={0}
        textAlign="right"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={1}></Box>
      <BaseFormInput
        slotProps={{
          input: {
            endAdornment: <Search />,
          },
        }}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setFilteredFields(
            customFields.filter((item) =>
              item.displayName?.toLowerCase().includes(e.target.value.toLowerCase()),
            ),
          );
        }}
        variant="standard"
        label="חיפוש שדה טופס.."
      />

      <Autocomplete
        fullWidth
        disablePortal
        onChange={(e, val) => {
          setSelectedCategories(val);
        }}
        value={selectedCategories || []}
        size="small"
        options={categories}
        loadingText="מחפש..."
        multiple
        slotProps={{
          chip: {
            sx: {
              ".MuiSvgIcon-root": {
                m: "auto 2px",
              },
            },
          },
        }}
        renderInput={(params) => (
          <TextField onChange={() => {}} {...params} label="חיפוש קטגוריה" />
        )}
      />

      {filteredFields.length > 0 && (
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
                {filteredFields.map((item, index) => (
                  <Draggable
                    draggableId={`c1_item_${item.typeId}_${index}`}
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
                            addItemToFormFields(item, 1000);
                          }
                        }}>
                        <Typography>{fieldsIcons[item.icon]}</Typography>
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
        </>
      )}

      {categories.length > 0 &&
        categories.map(
          (category, index) =>
            filteredCustomFields.filter((item) => item.category === category).length > 0 && (
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
                      {filteredCustomFields
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
                                <Typography>{fieldsIcons[item.icon]}</Typography>
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

      {filteredCustomFields.length === 0 && filteredFields.length === 0 && (
        <Typography>לא נמצאו שדות</Typography>
      )}
    </Box>
  );
}

export default FormItemList;
