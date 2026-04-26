import { Autocomplete, IconButton, TextField, Typography, styled as muiStyled } from "@mui/material";
import styled from "styled-components";

export const AutoCompleteOption = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  width: 100%;
  gap: 8px;
`;

export const AutoCompleteImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

export const AutoCompleteInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const AutoCompleteDisplayName = styled.span`
  font-weight: 500;
`;

export const AutoCompleteUPN = styled.span`
  font-size: 12px;
  color: #666;
`;

export const SharedUserContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 425px;
  height: 56px;
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

export const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const UserUPN = styled.span`
  font-size: 12px;
  color: #666;
`;

export const UserName = styled(Typography)`
  font-weight: 500;
  font-size: 16px !important;
`;

export const RoleLabel = styled.span<{ $isCreator?: boolean; color: string }>`
  background-color: #e3f2fd;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  color: ${({ color }) => color};
  cursor: ${({ $isCreator }) => ($isCreator ? "default" : "pointer")};
`;

export const RoleOption = styled.div`
  padding: 8px 12px;
  width: 100%;
`;

export const StyledIconButton = styled(IconButton) <{ $customColor?: string }>`
  color: ${({ $customColor }) => $customColor} !important;
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;

export const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
  flex-direction: column;
  align-items: center;
  width: 425px;
  height: 200px;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 425px;
  margin: 2px;
`;

export const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
  margin-top: 8px;
  align-items: center;
`;

export const CreatorContainer = styled.div<{ $bgc: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 425px;
  height: 56px;
  padding: 8px 16px;
  border-radius: 4px;
  background-color: ${(props) => props.$bgc};
`;

export const StyledAutocomplete = styled(Autocomplete)`
  width: 120px;

  & .MuiInputBase-root {
    height: 32px;
    font-size: 14px;
    border: 1px solid #ccc;
  }
` as typeof Autocomplete;

export const StyledTextField = styled(TextField)`
  & .MuiInputBase-root {
    font-size: 14px;
  }
`;

export const UserPickerAutocomplete = muiStyled(Autocomplete)({
  width: "309px",
  "& .MuiInputBase-root": {
    height: "40px",
    borderRadius: "4px",
    padding: "7px 8px",
    borderWidth: "1px",
  },
  "& .MuiInputLabel-root:not(.MuiInputLabel-shrink)": {
    top: "50%",
    transform: "translate(14px, -50%) scale(1)",
  },
}) as typeof Autocomplete;

export const AutocompleteListItem = muiStyled("li")<{ $isSelected?: boolean }>(({ $isSelected }) => ({
  opacity: $isSelected ? 0.5 : 1,
  pointerEvents: $isSelected ? "none" : "auto",
}));

export const CreatorName = muiStyled(Typography)({
  fontWeight: 500,
  fontSize: "16px !important",
});

export const ReasonsContainer = muiStyled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
});
