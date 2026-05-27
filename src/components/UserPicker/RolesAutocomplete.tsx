import React from "react";
import { RoleOption, StyledAutocomplete, StyledTextField } from "./styled";
import { ROLE_CATALOG } from "../../consts/roles";
import { SharePickerUser } from "@src/hooks/useUserPicker";

interface RolesAutocompleteProps {
  isDisabled: boolean;
  handleRoleChange: (event: any, newValue: any, user?: SharePickerUser) => void;
  width?: string | number;
  user?: SharePickerUser;
  excludeRoleIds?: number[];
  initialValue?: any;
}

const RolesAutocomplete: React.FC<RolesAutocompleteProps> = ({
  isDisabled,
  handleRoleChange,
  width,
  user,
  excludeRoleIds = [],
  initialValue,
}) => {
  const options =
    excludeRoleIds.length > 0
      ? ROLE_CATALOG.filter((role) => !excludeRoleIds.includes(role.role_id))
      : ROLE_CATALOG;

  return (
    <StyledAutocomplete
      isOptionEqualToValue={(option: any, value: any) =>
        option?.roleName === value?.roleName || option?.role_id === value?.role_id
      }
      value={initialValue || null}
      options={options}
      disableClearable={true}
      forcePopupIcon={false} // This removes the dropdown arrow
      onChange={(event, newValue) => handleRoleChange(event, newValue, user)}
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
      sx={{ width: width || "140px" }}
      renderInput={(params) => (
        <StyledTextField
          {...params}
          label=""
          placeholder="בחר הרשאה"
          variant="outlined"
          fullWidth
          size="small"
          inputProps={{
            ...params.inputProps,
            readOnly: true,
            sx: { cursor: "pointer" },
          }}
        />
      )}
      renderOption={(props: any, option: any) => {
        let roleName = option.roleName || "";
        const { key, ...restProps } = props;
        return (
          <li key={key} {...restProps} style={{ padding: 0 }}>
            <RoleOption>
              <span title={option?.role_description || ""}>{roleName}</span>
            </RoleOption>
          </li>
        );
      }}
    />
  );
};

export default RolesAutocomplete;
