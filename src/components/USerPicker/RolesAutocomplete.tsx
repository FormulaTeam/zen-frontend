import React from "react";
import { RoleOption, StyledAutocomplete, StyledTextField } from "./styled";
import { Role, User } from "../../utils/interfaces";
import { useAuth } from "../../contexts/AuthContext";

interface RolesAutocompleteProps {
  isDisabled: boolean;
  handleRoleChange: (event: any, newValue: Role | null, user: User | null) => void;
}

const RolesAutocomplete: React.FC<RolesAutocompleteProps> = ({ isDisabled, handleRoleChange }) => {
  const { roles, user } = useAuth();

  return (
    <StyledAutocomplete
      isOptionEqualToValue={(option: Role, value: Role) =>
        option?.roleName === value?.roleName || option?.role_id === value?.role_id
      }
      value={undefined}
      options={roles}
      disableClearable={true}
      onChange={(event, newValue) => handleRoleChange(event, newValue, user)}
      multiple={false}
      disabled={isDisabled}
      getOptionLabel={(option: Role) => {
        if (typeof option === "object") {
          return option.roleName || "";
        } else {
          let roleObj = roles.find((r) => r.role_id === option);
          return roleObj?.roleName || "";
        }
      }}
      sx={{
        width: "120px",
        "& .MuiInputBase-root": {
          height: "32px",
          fontSize: "14px",
          border: "1px solid #ccc",
        },
      }}
      renderInput={(params) => (
        <StyledTextField
          {...params}
          label=""
          placeholder="הרשאות"
          variant="outlined"
          fullWidth
          size="small"
        />
      )}
      renderOption={(props: any, option: Role) => {
        let roleName = option.roleName || "";
        return (
          <RoleOption {...props} key={"role_" + roleName}>
            <span title={option?.role_description || ""}>{roleName}</span>
          </RoleOption>
        );
      }}
    />
  );
};

export default RolesAutocomplete;
