import React from "react";
import { Autocomplete, TextField, useTheme } from "@mui/material";
import male from "../../images/man4.png";
import female from "../../images/female3.png";
import { Close } from "@mui/icons-material";
import {
  SharedUserContainer,
  UserInfo,
  UserAvatar,
  UserDetails,
  UserName,
  UserUPN,
  RoleLabel,
  RoleOption,
  StyledIconButton,
} from "./styled";
import RolesAutocomplete from "./RolesAutocomplete";

const SharedUser = ({ user, roles, handleRoleChange, removeUserFromShare, currentUser }) => {
  const theme = useTheme();
  const first = user?.firstName || "";
  const last = user?.lastName || "";
  const name = first + " " + last;
  const upn = user?.upn || user?.mail || user?.id || "";
  // Find the current role for the user
  const roleObj =
    user?.role_id !== undefined && user?.role_id !== -1
      ? roles.find((r) => r.role_id === user.role_id)
      : null;
  const roleName = roleObj?.roleName || "";
  const isValid = user?.role_id !== undefined && user?.role_id !== -1;
  const isDisabled = user?.upn === currentUser?.upn;
  return (
    <SharedUserContainer>
      <UserInfo>
        <UserAvatar src={user?.gender === "female" ? female : male} alt="User" />
        <UserDetails>
          <UserName>{name}</UserName>
          <UserUPN>{upn}</UserUPN>
        </UserDetails>
      </UserInfo>

      <UserInfo>
        {/* Display the permission dropdown or the permission label if selected */}
        {isValid ? (
          <RoleLabel
            onClick={(e) => handleRoleChange(e, "fail", user)}
            $isCreator={false}
            color={theme.palette.button?.primaryText || "#000"}>
            {roleName}
          </RoleLabel>
        ) : (
          <RolesAutocomplete
            roles={roles}
            isDisabled={isDisabled}
            handleRoleChange={handleRoleChange}
            user={user}
          />
        )}

        {/* Always show the X button, just disable it for current user */}
        <StyledIconButton
          color={isDisabled ? theme.palette.button?.disabled : theme.palette.button?.primaryText}
          disabled={isDisabled}
          onClick={() => removeUserFromShare(user)}
          size="small">
          <Close fontSize="small" />
        </StyledIconButton>
      </UserInfo>
    </SharedUserContainer>
  );
};

export default SharedUser;
