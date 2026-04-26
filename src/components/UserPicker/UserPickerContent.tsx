import React, { useState } from "react";
import SharedUser from "./SharedUser";
import {
  TextField,
  IconButton,
  InputAdornment,
  useTheme,
} from "@mui/material";
import male from "../../images/man4.png";
import ReactLoading from "react-loading";
import ClearIcon from "@mui/icons-material/Clear";
import AutocompleteItem from "./AutocompleteItem";
import { ROLE_CATALOG } from "../../consts/roles";
import { SharePickerUser } from "@src/hooks/useUserPicker";
import {
  Container,
  CreatorContainer,
  LoaderContainer,
  RoleLabel,
  UserAvatar,
  UserDetails,
  UserInfo,
  UsersList,
  UserUPN,
  UserPickerAutocomplete,
  AutocompleteListItem,
  CreatorName,
} from "./styled";

interface UserPickerProps {
  loading: boolean;
  shareWithOptionsUsers: SharePickerUser[];
  selectedShareWith: SharePickerUser[];
  formCreator: SharePickerUser | null;
  removeUserFromShare: (user: any) => void;
  handleRoleChange: (event: any, newValue: any, user: SharePickerUser) => void;
  handleValueChange: (event: any, newValue: SharePickerUser) => void;
  handleInputChange: (event: any, value: string) => void;
}

const UserPickerContent: React.FC<UserPickerProps> = ({
  loading,
  shareWithOptionsUsers,
  formCreator,
  selectedShareWith,
  handleValueChange,
  handleInputChange,
  handleRoleChange,
  removeUserFromShare,
}) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState("");

  const creatorRole = ROLE_CATALOG.find((r) => r.role_id === formCreator?.role_id);;

  const onInputChange = (event: any, value: string) => {
    setInputValue(value);
    if (value && value.length >= 2) {
      handleInputChange(event, value);
    } else {
      handleInputChange(event, "");
    }
  };

  const handleClear = () => {
    setInputValue("");
    handleInputChange(null, "");
  };

  const onChange = (event: any, newValue: any) => {
    if (!newValue) return;

    const alreadyExists = selectedShareWith.some(
      (u) => (u.upn && u.upn === newValue.upn) || (u.id && u.id === newValue.id),
    );

    if (!alreadyExists) {
      handleValueChange(event, newValue);
    }
    setInputValue("");
  };

  return loading ? (
    <LoaderContainer>
      <ReactLoading type={"spinningBubbles"} color={theme.palette.primary.main} />
    </LoaderContainer>
  ) : (
    <Container>
      <UserPickerAutocomplete
        isOptionEqualToValue={(option, value) => option?.id === value?.id}
        value={null}
        options={inputValue.length >= 2 ? shareWithOptionsUsers : []} // הצגת תוצאות רק מעל 2 תווים
        clearOnBlur={false}
        id="shareWithAutocomplete"
        multiple={false}
        inputValue={inputValue}
        onInputChange={onInputChange}
        onChange={onChange}
        noOptionsText={inputValue.length < 2 ? "הקלד לפחות 2 תווים" : "לא נמצאו משתמשים"}
        getOptionLabel={(option: any) => {
          const userUPN = option?.upn || option?.UPN || option?.id || "";
          const displayName = option?.displayName || option?.name || "";
          return `${userUPN} ${displayName}`.trim();
        }}
        renderOption={(props: any, user: any) => {
          const upn: string = user?.upn.toLowerCase();
          const id: string = String(user?.id || "").toLowerCase();
          const formCreatorUpn: string = formCreator?.upn?.toLowerCase() || "";

          const isSelected: boolean =
            (formCreatorUpn && formCreatorUpn === upn) ||
            // Check if user is in selectedShareWith
            selectedShareWith.some((user: SharePickerUser) => {
              const userUpn: string = user.upn?.toLowerCase() || "";
              const userId: string = String(user.id || "").toLowerCase();

              return userUpn === upn || userId === id;
            });

          const { key, ...restProps } = props;

          return (
            <AutocompleteListItem
              key={key}
              {...restProps}
              $isSelected={isSelected}
            >
              <AutocompleteItem
                user={{ ...user, isSelected }}
                displayName={user?.displayName || user?.name || ""}
                upn={upn}
                currentPermissions={
                  ROLE_CATALOG.find(
                    (r) =>
                      r.role_id ===
                      selectedShareWith.find((u) => {
                        const uId = String(u.id || "").toLowerCase();
                        const uUpn = u.upn?.toLowerCase() || "";
                        return uId === String(user?.id || "").toLowerCase() || uUpn === upn;
                      })?.role_id,
                  )?.roleName
                }
              />
            </AutocompleteListItem>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="חיפוש משתמשים"
            variant="outlined"
            fullWidth
            size="small"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {inputValue && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClear} size="small">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <UsersList>
        {/* Creator user */}
        <CreatorContainer $bgc={theme.palette.background?.default}>
          <UserInfo>
            <UserAvatar src={male} alt="Creator" />
            <UserDetails>
              <CreatorName>
                {formCreator?.displayName || formCreator?.upn}
              </CreatorName>
              <UserUPN>{formCreator?.upn}</UserUPN>
            </UserDetails>
          </UserInfo>
          <RoleLabel $isCreator={true} color={theme.palette.primary.main}>
            {creatorRole?.roleName || "הרשאה"}
          </RoleLabel>
        </CreatorContainer>

        {/* Mapped users */}
        {selectedShareWith?.map((user, index) => (
          <SharedUser
            key={user?.id || index}
            user={user}
            roles={ROLE_CATALOG}
            handleRoleChange={handleRoleChange}
            removeUserFromShare={removeUserFromShare}
          />
        ))}
      </UsersList>
    </Container>
  );
};

export default UserPickerContent;
