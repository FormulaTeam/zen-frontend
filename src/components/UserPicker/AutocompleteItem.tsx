import React from "react";
import { Avatar, Box } from "@mui/material";
import {
  AutoCompleteDisplayName,
  AutoCompleteInfo,
  AutoCompleteOption,
  AutoCompleteUPN,
  RoleOption,
} from "./styled";

interface AutocompleteItemProps {
  user: any;
  displayName: string;
  upn: string;
  currentPermissions?: any;
  [key: string]: any; // Allow additional props
}

const AutocompleteItem: React.FC<AutocompleteItemProps> = ({
  user,
  displayName,
  upn,
  currentPermissions,
  ...props
}) => {
  const getInitials = (name?: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <AutoCompleteOption
      {...props}
      key={"user_" + user?.id}
      style={{ cursor: user?.isSelected ? "default" : "pointer" }}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          fontSize: "0.75rem",
          bgcolor: "#f1f5f9",
          color: "#64748b",
          fontWeight: 600,
          border: "1px solid #e2e8f0",
          mr: 1,
        }}>
        {getInitials(displayName || upn)}
      </Avatar>
      <AutoCompleteInfo>
        <AutoCompleteDisplayName>{displayName}</AutoCompleteDisplayName>
        <AutoCompleteUPN>{upn}</AutoCompleteUPN>
      </AutoCompleteInfo>
      {currentPermissions && (
        <RoleOption {...props} key={"role_" + currentPermissions}>
          <span title={currentPermissions}>{currentPermissions}</span>
        </RoleOption>
      )}
    </AutoCompleteOption>
  );
};

export default AutocompleteItem;
