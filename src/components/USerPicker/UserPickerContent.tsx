import React, { useState } from "react";
import SharedUser from "./SharedUser";
import {
  Autocomplete,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  useTheme,
} from "@mui/material";
import male from "../../images/man4.png";
import ReactLoading from "react-loading";
import ClearIcon from "@mui/icons-material/Clear";
import AutocompleteItem from "./AutocompleteItem";
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
} from "./styled";
import { ROLE_CATALOG } from "../../consts/roles";

interface UserPickerProps {
  loading: boolean;
  shareWithOptionsUsers: any[];
  selectedShareWith: any[];
  formCreator: any;
  removeUserFromShare: (user: any) => void;
  handleRoleChange: (event: any, newValue: any, user: any) => void;
  handleValueChange: (event: any, newValue: any) => void;
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

  console.log('selectedShareWith:', selectedShareWith);
  const creatorRole = ROLE_CATALOG.find((r) => r.role_id === formCreator?.role_id);

  const onInputChange = (event: any, value: string) => {
    setInputValue(value);
    if (inputValue && inputValue.length >= 2) {
      handleInputChange(event, inputValue);
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
      <Autocomplete
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
          const first = option?.firstName || "";
          const last = option?.lastName || "";
          const userUPN = option?.upn || option?.UPN || option?.id || "";
          const displayName = option?.displayName || "";
          return `${userUPN} ${first} ${last} ${displayName}`.trim();
        }}
        renderOption={(props: any, user: any) => {
          const upn = (user?.upn || user?.mail || user?.id || "").toLowerCase();

          const formCreatorUpn = formCreator?.upn?.toLowerCase() || "";
          const formCreatorId = formCreator?.id?.toLowerCase() || "";

          const isSelected =
            // Check if user is the form creator
            (formCreatorUpn && formCreatorUpn === upn) ||
            (formCreatorId && formCreatorId === upn) ||
            // Check if user is in selectedShareWith
            selectedShareWith.some((u) => {
              const uUpn = u.upn?.toLowerCase() || "";
              const uId = u.id?.toLowerCase() || "";
              return uUpn === upn || uId === upn;
            });

          const { key, ...restProps } = props;

          return (
            <li
              key={key}
              {...restProps}
              style={{
                ...restProps.style,
                opacity: isSelected ? 0.5 : 1,
                pointerEvents: isSelected ? "none" : "auto", // prevent click
              }}>
              <AutocompleteItem
                user={{ ...user, isSelected }}
                displayName={user?.displayName || ""}
                upn={upn}
                currentPermissions={
                  ROLE_CATALOG.find(
                    (r) =>
                      r.role_id ===
                      selectedShareWith.find((u) => {
                        const uId = u.id?.toLowerCase() || "";
                        const uUpn = u.upn?.toLowerCase() || "";
                        return uId === user.id?.toLowerCase() || uUpn === user.upn?.toLowerCase();
                      })?.role_id,
                  )?.roleName
                }
              />
            </li>
          );
        }}
        sx={{
          width: "309px",
          "& .MuiInputBase-root": {
            height: "40px",
            borderRadius: "4px",
            padding: "7px 8px",
            borderWidth: "1px",
          }, "& .MuiInputLabel-root:not(.MuiInputLabel-shrink)": {
            top: "50%",
            transform: "translate(14px, -50%) scale(1)",
          },
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
        <CreatorContainer bgc={theme.palette.background?.default}>
          <UserInfo>
            <UserAvatar src={male} alt="Creator" />
            <UserDetails>
              <Typography style={{ fontWeight: 500, fontSize: "16px" }}>
                {formCreator?.displayName || formCreator.upn}
              </Typography>
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
