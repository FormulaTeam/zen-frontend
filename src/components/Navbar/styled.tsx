import styled from "styled-components";
import { AppBar, Toolbar, Button } from "@mui/material";

interface AppBarProps {
  $bgColor: string;
}

interface ButtonProps {
  $bgColor: string;
  $hoverColor: string;
}

export const NavAppBar = styled(AppBar)<AppBarProps>`
  background-color: ${(props) => props.$bgColor};
`;

export const NavToolbar = styled(Toolbar)`
  display: flex;
  justify-content: space-between;
  height: 85px;
`;

export const LogoContainer = styled.div<{ disabled: boolean }>`
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 15px;
`;

export const NavButton = styled(Button)<ButtonProps>`
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 140px;
  background-color: ${({ $bgColor }) => $bgColor} !important;
  font-weight: 600;

  &:hover {
    background-color: ${({ $hoverColor }) => $hoverColor};
  }
`;
