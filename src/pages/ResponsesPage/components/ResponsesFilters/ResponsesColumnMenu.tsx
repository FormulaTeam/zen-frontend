import React from "react";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { Badge, ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { GridColumnMenu, GridColumnMenuProps } from "@mui/x-data-grid-pro";

interface FilterToggleMenuItemProps {
  hideMenu?: () => void;
  showFilters?: boolean;
  activeFiltersCount?: number;
  disabled?: boolean;
  onToggleFilters?: () => void;
}

const FilterToggleMenuItem: React.FC<FilterToggleMenuItemProps> = ({
  hideMenu,
  showFilters,
  activeFiltersCount = 0,
  disabled,
  onToggleFilters,
}) => {
  return (
    <MenuItem
      disabled={disabled}
      onClick={() => {
        onToggleFilters?.();
        hideMenu?.();
      }}>
      <ListItemIcon>
        <Badge
          badgeContent={activeFiltersCount}
          color="primary"
          invisible={activeFiltersCount === 0}>
          {showFilters ? <FilterAltOffIcon fontSize="small" /> : <FilterAltIcon fontSize="small" />}
        </Badge>
      </ListItemIcon>

      <ListItemText primary={showFilters ? "הסתר סינון" : "הצג סינון"} />
    </MenuItem>
  );
};

interface ClearFiltersMenuItemProps {
  hideMenu?: () => void;
  activeFiltersCount?: number;
  disabled?: boolean;
  onClearFilters?: () => void;
}

const ClearFiltersMenuItem: React.FC<ClearFiltersMenuItemProps> = ({
  hideMenu,
  activeFiltersCount = 0,
  disabled,
  onClearFilters,
}) => {
  if (activeFiltersCount === 0) {
    return null;
  }

  return (
    <MenuItem
      disabled={disabled}
      onClick={() => {
        onClearFilters?.();
        hideMenu?.();
      }}>
      <ListItemIcon>
        <FilterAltOutlinedIcon fontSize="small" />
      </ListItemIcon>

      <ListItemText primary="נקה סינון" />
    </MenuItem>
  );
};

export type ResponsesColumnMenuProps = GridColumnMenuProps & {
  showFilters?: boolean;
  activeFiltersCount?: number;
  disabled?: boolean;
  onToggleFilters?: () => void;
  onClearFilters?: () => void;
};

export const ResponsesColumnMenu: React.FC<ResponsesColumnMenuProps> = (props) => {
  const {
    showFilters,
    activeFiltersCount = 0,
    disabled,
    onToggleFilters,
    onClearFilters,
    slots,
    slotProps,
    ...gridColumnMenuProps
  } = props as any;

  return (
    <GridColumnMenu
      {...gridColumnMenuProps}
      sx={{
        "& .MuiDivider-root": {
          display: "none",
        },
        "& .MuiDivider-root:first-of-type": {
          display: "block",
        },
      }}
      slots={{
        ...slots,
        columnMenuColumnsItem: null,
        columnMenuFilterItem: null,
        columnMenuPinningItem: null,
        columnMenuHideItem: null,
        columnMenuFilterToggleItem: FilterToggleMenuItem as any,
        columnMenuClearFiltersItem: ClearFiltersMenuItem as any,
      }}
      slotProps={{
        ...slotProps,
        columnMenuFilterToggleItem: {
          displayOrder: 20,
          showFilters,
          activeFiltersCount,
          disabled,
          onToggleFilters,
        },
        columnMenuClearFiltersItem: {
          displayOrder: 21,
          activeFiltersCount,
          disabled,
          onClearFilters,
        },
      }}
    />
  );
};
