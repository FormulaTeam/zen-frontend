import React from "react";
import { useTheme } from "@mui/material";
import male from "../../images/man4.png";
import { Close } from "@mui/icons-material";
import {
  SharedUserContainer,
  UserInfo,
  UserAvatar,
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
  return (
    <SharedUserContainer>
      <UserInfo>
        <UserAvatar src={male} alt="User" />
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
          <RolesAutocomplete isDisabled={false} handleRoleChange={handleRoleChange} user={user} />
        )}

        {/* Always show the X button, just disable it for current user */}
        <StyledIconButton
          color={theme.palette.button?.primaryText}
          onClick={() => removeUserFromShare(user)}
          size="small">
          <Close fontSize="small" />
        </StyledIconButton>
      </UserInfo>
    </SharedUserContainer>
  );
};

export default SharedUser;
