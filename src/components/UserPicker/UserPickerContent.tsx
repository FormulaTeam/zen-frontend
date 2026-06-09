import React from "react";
import SharedUser from "./SharedUser";
import {
  TextField,
  IconButton,
  InputAdornment,
  useTheme,
  CircularProgress,
  Avatar,
  Box,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import AutocompleteItem from "./AutocompleteItem";
import { ROLE_CATALOG } from "../../consts/roles";
import { SharePickerUser } from "@src/hooks/useUserPicker";
import {
  Container,
  CreatorContainer,
  LoaderContainer,
  RoleLabel,
  UserDetails,
  UserInfo,
  UsersList,
  UserUPN,
  UserPickerAutocomplete,
  AutocompleteListItem,
  CreatorName,
} from "./styled";
import { useSearchUsersQuery } from "../../api/usersApi";

interface UserPickerProps {
  loading: boolean;
  selectedShareWith: SharePickerUser[];
  formCreator: SharePickerUser | null;
  removeUserFromShare: (user: any) => void;
  handleRoleChange: (event: any, newValue: any, user: SharePickerUser) => void;
  handleValueChange: (event: any, newValue: SharePickerUser) => void;
  searchQuery: string;
  handleSearchQueryChange: (event: any, value: string) => void;
}

const UserPickerContent: React.FC<UserPickerProps> = ({
  loading,
  formCreator,
  selectedShareWith,
  handleValueChange,
  handleSearchQueryChange,
  handleRoleChange,
  removeUserFromShare,
  searchQuery,
}) => {
  const theme = useTheme();

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } = useSearchUsersQuery(searchQuery);

  const searchResults = data?.pages.flat() || [];

  const creatorRole = ROLE_CATALOG.find((r) => r.role_id === formCreator?.role_id);

  const onInputChange = (event: any, value: string) => {
    handleSearchQueryChange(event, value);
  };

  const handleClear = () => {
    handleSearchQueryChange(null, "");
  };

  const onChange = (event: any, newValue: any) => {
    if (!newValue) return;

    const alreadyExists = selectedShareWith.some(
      (u) => (u.upn && u.upn === newValue.upn) || (u.id && u.id === newValue.id),
    );

    if (!alreadyExists) {
      handleValueChange(event, newValue);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleScroll = (event: React.SyntheticEvent) => {
    const listboxNode = event.currentTarget;
    const scrollPosition = listboxNode.scrollTop + listboxNode.clientHeight;
    const isAtBottom = listboxNode.scrollHeight - scrollPosition <= 10;
    
    if (isAtBottom && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  return loading ? (
    <LoaderContainer>
      <CircularProgress size={40} thickness={4} sx={{ color: "#2563eb" }} />
    </LoaderContainer>
  ) : (
    <Container>
      <UserPickerAutocomplete
        isOptionEqualToValue={(option, value) => option?.id === value?.id}
        value={null}
        options={searchQuery.length >= 2 ? searchResults : []}
        clearOnBlur={false}
        id="shareWithAutocomplete"
        multiple={false}
        forcePopupIcon={false} // This removes the dropdown arrow
        inputValue={searchQuery}
        onInputChange={onInputChange}
        onChange={onChange}
        noOptionsText={searchQuery.length < 2 ? "הקלד לפחות 2 תווים" : (isLoading ? <CircularProgress size={20} /> : "לא נמצאו משתמשים")}
        getOptionLabel={(option: any) => {
          const userUPN = option?.upn || option?.UPN || option?.id || "";
          const displayName = option?.displayName || option?.name || "";
          return `${userUPN} ${displayName}`.trim();
        }}
        ListboxProps={{
          onScroll: handleScroll,
          style: { maxHeight: "200px" }
        }}
        renderOption={(props: any, user: any) => {
          const upn: string = user?.upn?.toLowerCase() || "";
          const id: string = String(user?.id || "").toLowerCase();
          const formCreatorUpn: string = formCreator?.upn?.toLowerCase() || "";

          const isSelected: boolean =
            (formCreatorUpn && formCreatorUpn === upn) ||
            selectedShareWith.some((user: SharePickerUser) => {
              const userUpn: string = user.upn?.toLowerCase() || "";
              const userId: string = String(user.id || "").toLowerCase();

              return userUpn === upn || userId === id;
            });

          const { key, ...restProps } = props;

          return (
            <AutocompleteListItem key={key} {...restProps} $isSelected={isSelected}>
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
            placeholder="חיפוש משתמשים להוספה"
            variant="outlined"
            fullWidth
            size="small"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: 0.5, mr: 1 }}>
                  <SearchIcon sx={{ color: "#94a3b8", fontSize: "1.2rem" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {searchQuery && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClear} size="small" sx={{ mr: -0.5 }}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
              sx: {
                pr: "8px !important",
              },
            }}
          />
        )}
      />

      <UsersList>
        <CreatorContainer $bgc={theme.palette.background?.default}>
          <UserInfo>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: "0.875rem",
                bgcolor: "#f1f5f9",
                color: "#64748b",
                fontWeight: 600,
                border: "1px solid #e2e8f0",
              }}>
              {getInitials(formCreator?.displayName || formCreator?.upn)}
            </Avatar>
            <UserDetails>
              <CreatorName>{formCreator?.displayName || formCreator?.upn}</CreatorName>
              <UserUPN>{formCreator?.upn}</UserUPN>
            </UserDetails>
          </UserInfo>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 500 }}>
              יוצר הטופס
            </Typography>
            <RoleLabel $isCreator={true} color={theme.palette.primary.main}>
              {creatorRole?.roleName || "מנהל"}
            </RoleLabel>
          </Box>
        </CreatorContainer>

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
