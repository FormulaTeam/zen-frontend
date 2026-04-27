import React from "react";
import male from "../../images/man4.png";
import {
  AutoCompleteDisplayName,
  AutoCompleteImage,
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
  return (
    <AutoCompleteOption
      {...props}
      key={"user_" + user?.id}
      style={{ cursor: user?.isSelected ? "default" : "pointer" }}>
      <AutoCompleteImage src={male} alt="User" />
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
