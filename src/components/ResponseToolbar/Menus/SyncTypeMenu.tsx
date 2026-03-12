import { ListItemText, Menu, MenuItem } from "@mui/material";
import React from "react";

const SyncTypeMenu = ({
  anchorElSourceType,
  handleCloseMoreActions,
  handleAutomaticSource,
}) => {
  return (
    <Menu
      id="demo-positioned-menu"
      aria-labelledby="demo-positioned-button"
      anchorEl={anchorElSourceType}
      open={anchorElSourceType !== null}
      onClose={handleCloseMoreActions}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}>
      <MenuItem onClick={handleAutomaticSource}>
        <ListItemText>אוטומטי</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default SyncTypeMenu;
