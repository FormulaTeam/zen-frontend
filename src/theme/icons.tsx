import TrashIcon from "../icons/trash.svg";
import DotsIcon from "../icons/dots.svg";
import CopyIcon from "../icons/copy.svg";
import EditIcon from "../icons/edit.svg";
import ShareIcon from "../icons/share.svg";
import ArrowBackIcon from "../icons/back.svg";
import PencilIcon from "../images/pencil2.png";
import MetroSyncedIcon from "../icons/metroSynced.svg";
import MetroUnsyncedIcon from "../icons/metroUnsynced.svg";
import ExcelIcon from "../icons/excel.svg";
import ExcelGrayIcon from "../icons/excelGray.svg";
import ImportIcon from "../icons/import-light.svg";
import ExportIcon from "../icons/export-light.svg";
import ExportCardIcon from "../images/export.png";
import SyncGrayIcon from "../images/sync.png";
import ShareGrayIcon from "../images/share.png";
import CommentsIcon from "../images/stash_comments.png";
import SourceIcon from "../icons/source.svg";
import SyncIcon from "../icons/sync.svg";

// field icons
import CalendarIcon from "../icons/fields/calendar.svg";
import CheckboxIcon from "../icons/fields/checkbox.svg";
import FileIcon from "../icons/fields/file.svg";
import LocationIcon from "../icons/fields/pin.svg";
import NumberIcon from "../icons/fields/number.svg";
import TextIcon from "../icons/fields/text.svg";
import MultilineIcon from "../icons/fields/multiline.svg";
import TimeIcon from "../icons/fields/time.svg";
import LinkIcon from "../icons/fields/hyperlink.svg";

import React from "react";

export const icons = {
  delete: TrashIcon,
  edit: EditIcon,
  copy: CopyIcon,
  metroSynced: MetroSyncedIcon,
  metroUnsynced: MetroUnsyncedIcon,
  excel: ExcelIcon,
  excelGray: ExcelGrayIcon,
  sync: SyncIcon,
  source: SourceIcon,
  import: ImportIcon,
  export: ExportIcon,
  share: ShareIcon,
  menuDots: DotsIcon,
  arrowBack: ArrowBackIcon,
  exportCard: ExportCardIcon,
  pencil: PencilIcon,
  syncGray: SyncGrayIcon,
  shareGray: ShareGrayIcon,
  comments: CommentsIcon,
};

export const fieldIcons = {
  date: CalendarIcon,
  checkbox: CheckboxIcon,
  file: FileIcon,
  location: LocationIcon,
  multiline: MultilineIcon,
  number: NumberIcon,
  text: TextIcon,
  time: TimeIcon,
  link: LinkIcon,
};

export type IconName = keyof typeof icons;
export type FieldIconName = keyof typeof fieldIcons;

interface CustomIconProps {
  iconName?: IconName | FieldIconName;
  style?: React.CSSProperties;
  onClick?: () => void;
  forcePointer?: boolean;
}

export const CustomIcon = ({ iconName, style, onClick, forcePointer }: CustomIconProps) => {
  const defaultStyle: React.CSSProperties = {
    cursor: onClick || forcePointer ? "pointer" : "default",
  };

  if (iconName && iconName in icons) {
    return <img src={icons[iconName]} style={{ ...defaultStyle, ...style }} onClick={onClick} />;
  } else if (iconName && iconName in fieldIcons) {
    return (
      <img src={fieldIcons[iconName]} onClick={onClick} style={{ ...defaultStyle, ...style }} />
    );
  }
  return <img src={fieldIcons.text} style={{ ...defaultStyle, ...style }} onClick={onClick} />;
};
