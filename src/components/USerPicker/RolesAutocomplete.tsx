import React from "react";
import { RoleOption, StyledAutocomplete, StyledTextField } from "./styled";
import { ROLE_CATALOG } from "../../consts/roles";

interface RolesAutocompleteProps {
  isDisabled: boolean;
  handleRoleChange: (event: any, newValue: any) => void;
  width?: string | number;
}

const RolesAutocomplete: React.FC<RolesAutocompleteProps> = ({ isDisabled, handleRoleChange, width }) => {
  return (
    <StyledAutocomplete
      isOptionEqualToValue={(option: any, value: any) =>
        option?.roleName === value?.roleName || option?.role_id === value?.role_id
      }
      value={undefined}
      options={ROLE_CATALOG}
      disableClearable={true}
      onChange={(event, newValue) => handleRoleChange(event, newValue)}
      multiple={false}
      disabled={isDisabled}
      getOptionLabel={(option: any) => {
        if (typeof option === "object") {
          return option.roleName || "";
        } else {
          let roleObj = ROLE_CATALOG.find((r) => r.role_id === option);
          return roleObj?.roleName || "";
        }
      }}
      sx={{
        width: width || "120px",
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
          size="medium"
        />
      )}
      renderOption={(props: any, option: any) => {
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
