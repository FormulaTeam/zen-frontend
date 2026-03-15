import {
  AccessTime,
  CheckBox,
  DateRange,
  DragHandle,
  FileCopyOutlined,
  InsertDriveFile,
  InsertLink,
  List,
  LocationOn,
  Menu,
  MoreVert,
  Numbers,
} from "@mui/icons-material";
import { FieldsIcons } from "../utils/interfaces";

export const FORM_ELEMENT_ICONS: FieldsIcons = {
  menu: <Menu />,
  dragHandle: <DragHandle />,
  moreVert: <MoreVert />,
  link: <InsertLink />,
  dateRange: <DateRange />,
  accessTime: <AccessTime />,
  location: <LocationOn />,
  checkbox: <CheckBox />,
  list: <List />,
  numbers: <Numbers />,
  file: <InsertDriveFile />,
  forms: <FileCopyOutlined />,
};
