import React from "react";
import { GridColumnMenu, GridColumnMenuProps } from "@mui/x-data-grid-pro";

export const ResponsesColumnMenu: React.FC<GridColumnMenuProps> = (props) => {
  const { slots, slotProps, ...gridColumnMenuProps } = props as any;

  return (
    <GridColumnMenu
      {...gridColumnMenuProps}
      slots={{
        ...slots,
        columnMenuColumnsItem: null,
        columnMenuFilterItem: null,
        columnMenuPinningItem: null,
        columnMenuHideItem: null,
      }}
      slotProps={slotProps}
    />
  );
};
