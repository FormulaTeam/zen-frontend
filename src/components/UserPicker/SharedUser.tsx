import React from "react";
import { useTheme, Avatar, Box } from "@mui/material";
import { Close } from "@mui/icons-material";
import {
  SharedUserContainer,
  UserInfo,
  UserDetails,
  UserName,
  UserUPN,
  RoleLabel,
  StyledIconButton,
} from "./styled";
import RolesAutocomplete from "./RolesAutocomplete";

const SharedUser = ({ user, roles, handleRoleChange, removeUserFromShare }) => {
  const theme = useTheme();
  const name = user?.displayName;
  const upn = user?.upn || user?.mail || user?.id || "";
  
  // Find the current role for the user
  const roleObj =
    user?.role_id !== undefined && user?.role_id
      ? roles.find((r) => r.role_id === user.role_id)
      : null;
  const roleName = roleObj?.roleName || "";
  const isValid = user?.role_id !== undefined && user?.role_id;

  const getInitials = (name?: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <SharedUserContainer>
      <UserInfo>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            fontSize: "0.875rem",
            bgcolor: "#fff",
            color: "#64748b",
            fontWeight: 600,
            border: "1px solid #e2e8f0",
          }}>
          {getInitials(name || upn)}
        </Avatar>
        <UserDetails>
          <UserName>{name}</UserName>
          <UserUPN>{upn}</UserUPN>
        </UserDetails>
      </UserInfo>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Always show RolesAutocomplete to allow editing, but hide input if valid (controlled by parent) */}
        <RolesAutocomplete
          isDisabled={false}
          handleRoleChange={handleRoleChange}
          user={user}
          initialValue={roleObj}
        />

        {/* Always show the X button, just disable it for current user */}
        <StyledIconButton
          $customColor={theme.palette.button?.primaryText}
          onClick={() => removeUserFromShare(user)}
          size="small">
          <Close fontSize="small" />
        </StyledIconButton>
      </Box>
    </SharedUserContainer>
  );
};

export default SharedUser;
