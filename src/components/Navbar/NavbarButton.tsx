import React from "react";
import { NavButton } from "./styled";

interface NavbarButtonProps {
  onClick: () => void;
  bgColor: string;
  hoverColor: string;
  title: string;
  icon: React.ReactNode;
}

const NavbarButton: React.FC<NavbarButtonProps> = ({
  onClick,
  bgColor,
  hoverColor,
  title,
  icon,
}) => {
  return (
    <NavButton onClick={onClick} $bgColor={bgColor} $hoverColor={hoverColor}>
      {title}
      {icon}
    </NavButton>
  );
};

export default NavbarButton;
