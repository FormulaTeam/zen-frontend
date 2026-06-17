import { Autocomplete, IconButton, TextField, Typography, styled as muiStyled } from "@mui/material";
import styled from "styled-components";

export const AutoCompleteOption = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  width: 100%;
  gap: 8px;
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
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  background-color: #fff;
  
  &:hover {
    border-color: #cbd5e0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
`;

export const UserUPN = styled.span`
  font-size: 12px;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

export const UserName = styled(Typography)`
  font-weight: 500;
  font-size: 14px !important;
  color: #1e293b;
`;

export const RoleLabel = styled.span<{ $isCreator?: boolean; color: string }>`
  background-color: #f1f5f9;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
  cursor: ${({ $isCreator }) => ($isCreator ? "default" : "pointer")};
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;

  &:hover {
    background-color: ${({ $isCreator }) => ($isCreator ? "#f1f5f9" : "#eff6ff")};
    border-color: #bfdbfe;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
`;

export const RoleOption = styled.div`
  padding: 10px 14px;
  width: 100%;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #f8fafc;
  }
`;

export const StyledIconButton = styled(IconButton) <{ $customColor?: string }>`
  color: #94a3b8 !important;
  margin-left: 4px;
  &:hover {
    background-color: #fee2e2;
    color: #ef4444 !important;
  }
`;

export const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 200px;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  margin: 0;
`;

export const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
  margin-top: 4px;
  padding: 4px 2px;
`;

export const CreatorContainer = styled.div<{ $bgc: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: #f8fafc;
  border: 1px dashed #cbd5e0;
`;

export const StyledAutocomplete = styled(Autocomplete)`
  width: 150px;

  & .MuiInputBase-root {
    height: 38px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 8px;
    background-color: #ffffff;
    border: 1.5px solid #cbd5e1;
    transition: all 0.2s ease;
    padding: 0 12px !important;
    cursor: pointer;

    &:hover {
      border-color: #94a3b8;
      background-color: #f8fafc;
    }

    &.Mui-focused {
      border-color: #2563eb;
      background-color: #fff;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    & .MuiOutlinedInput-notchedOutline {
      border: none;
    }

    & input {
      cursor: pointer !important;
    }
  }

  & .MuiAutocomplete-endAdornment {
    left: 8px !important;
    right: auto !important;
  }
` as typeof Autocomplete;

export const StyledTextField = styled(TextField)`
  & .MuiInputBase-root {
    font-size: 13px;
    font-weight: 500;
  }
`;

export const UserPickerAutocomplete = muiStyled(Autocomplete)({
  width: "100%",
  "& .MuiInputBase-root": {
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    padding: "6px 16px !important",
    border: "1.5px solid #e2e8f0",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "14px",
    
    "&:hover": {
      borderColor: "#cbd5e0",
      backgroundColor: "#f1f5f9",
    },
    
    "&.Mui-focused": {
      backgroundColor: "#fff",
      borderColor: "#1E88E5",
      boxShadow: "0 0 0 4px rgba(30, 136, 229, 0.1)",
    },
    
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },

    "& .MuiAutocomplete-input": {
      padding: "4px 0 !important",
    }
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
