import React from "react";
import { NavButton } from "./styled";

interface NavbarButtonProps {
  onClick: () => void;
  bgColor: string;
  hoverColor: string;
  title: string;
  icon: React.ReactNode;
  dataTestId?: string;
}

const NavbarButton: React.FC<NavbarButtonProps> = ({
  onClick,
  bgColor,
  hoverColor,
  title,
  icon,
  dataTestId,
}) => {
  return (
    <NavButton data-testid={dataTestId} onClick={onClick} $bgColor={bgColor} $hoverColor={hoverColor}>
      {title}
      {icon}
    </NavButton>
  );
};

export default NavbarButton;
