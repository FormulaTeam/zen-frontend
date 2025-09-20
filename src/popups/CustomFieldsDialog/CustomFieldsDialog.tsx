import {
  Box,
  Dialog,
  Grid,
  Icon,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { CustomFormField } from "../../utils/interfaces";
import { fieldsIcons } from "../../components/FieldsIcons";
import { Search } from "@mui/icons-material";
import "./CustomFieldsDialog.scss";
interface CustomFieldsSidebarProps {
  open: boolean;
  items: Partial<CustomFormField>[];
  onItemSelect: (item: Partial<CustomFormField>, destinationIndex: number) => void;
  onClose: () => void;
}

export const CustomFieldsDialog: React.FC<CustomFieldsSidebarProps> = ({
  open,
  items,
  onItemSelect,
  onClose,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const categories = Array.from(
    new Set(items.filter((item) => item.category).map((item) => item.category)),
  );
  const [filteredFields, setFilteredFields] = useState(items);

  useEffect(() => {
    const filtered = items.filter((item) => {
      const matchesSearch = item.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedTab === 0 || item.category === categories[selectedTab - 1];
      return matchesSearch && matchesCategory;
    });
    setFilteredFields(filtered);
  }, [selectedTab, items, searchTerm]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Dialog fullWidth maxWidth={"lg"} open={open} onClose={onClose}>
      <Box component={"div"} className="custom-fields-dialog">
        <Box sx={{ display: "flex", flexDirection: "row", gap: 1, height: "100%" }}>
          <Tabs
            orientation="vertical"
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            sx={{
              flexShrink: 0,
              minWidth: 250,
            }}>
            <Tab label="הכל" className="custom-fields-tabs" />
            {categories.map((category, index) => (
              <Tab key={index} label={category as string} className="custom-fields-tabs" />
            ))}
          </Tabs>
          <Grid container sx={{ flexGrow: 1, flexWrap: "nowrap", flexDirection: "column" }}>
            <Grid>
              <TextField
                variant="standard"
                placeholder="חיפוש שדה..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  padding: 2,
                  alignSelf: "end",
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid className="custom-fields-dialog-content" role="tabpanel">
              {filteredFields.map((item, itemIndex) => (
                <Paper
                  className="custom-fields-dialog-item"
                  elevation={1}
                  key={itemIndex}
                  onClick={() => {
                    onItemSelect(item, 0);
                    onClose();
                  }}>
                  {fieldsIcons[item.icon ?? 0]}
                  <Typography sx={{ overflow: "auto" }}>{item.name}</Typography>
                </Paper>
              ))}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Dialog>
  );
};
