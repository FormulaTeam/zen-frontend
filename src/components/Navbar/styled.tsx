import styled from "styled-components";
import { AppBar, Toolbar, Button } from "@mui/material";

interface AppBarProps {
  $bgColor: string;
  $isPink?: boolean;
  $stripeOpacity?: number;
}

interface ButtonProps {
  $bgColor: string;
  $hoverColor: string;
}

export const NavAppBar = styled(AppBar)<AppBarProps>`
  position: relative;
  overflow: hidden;
  background-color: ${({ $bgColor, $isPink }) => ($isPink ? "#FF69B4" : $bgColor)} !important;
  height: 60px;
  transition: background-color 0.5s ease;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05) !important;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
      -45deg,
      rgba(255, 255, 255, ${({ $stripeOpacity }) => $stripeOpacity ?? 0.16}) 0,
      rgba(255, 255, 255, ${({ $stripeOpacity }) => $stripeOpacity ?? 0.16}) 10px,
      rgba(255, 255, 255, 0) 10px,
      rgba(255, 255, 255, 0) 20px
    );
    pointer-events: none;
  }
`;

export const NavToolbar = styled(Toolbar)`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  height: 60px;
  min-height: 60px !important;
  align-items: center;
`;

export const LogoContainer = styled.a<{ disabled: boolean }>`
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  display: flex;
  align-items: center;
  text-decoration: none;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 15px;
  flex: 1;
  justify-content: flex-end;
  align-items: center;
`;

export const EnvironmentBadge = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(0, 0, 0, 0.18);
  color: #fff;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
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
