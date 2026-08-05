import type { SxProps, Theme } from "@mui/material";

export const optionAutocompleteSlotProps = {
  clearIndicator: {
    title: "",
    sx: {
      display: "none",
    },
  },
  popupIndicator: {
    title: "",
    sx: {
      width: 20,
      height: 20,
      padding: 0,
      margin: 0,
      color: "#64748b",

      "& .MuiSvgIcon-root": {
        fontSize: 18,
      },

      "&:hover": {
        backgroundColor: "#f1f5f9",
        color: "#334155",
      },
    },
  },
  popper: {
    placement: "bottom-start" as const,
    sx: {
      minWidth: 190,
      maxWidth: "calc(100vw - 32px)",

      "& .MuiAutocomplete-paper": {
        mt: "4px",
        borderRadius: "10px",
        border: "1px solid #d7e4f2",
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.1)",
        overflow: "hidden",
        direction: "ltr",
        maxHeight: "300px",
      },

      "& .MuiAutocomplete-listbox": {
        p: "4px",
        maxHeight: "280px",
        overflowY: "auto",
        overflowX: "hidden",
        overscrollBehavior: "contain",
        direction: "ltr",
        textAlign: "left",
      },

      "& .MuiAutocomplete-option": {
        minHeight: "34px",
        borderRadius: "7px",
        mx: 0,
        my: "1px",
        px: "9px",
        py: "6px",
        fontSize: "0.95rem",
        direction: "ltr",
        textAlign: "left",

        "&[aria-selected='true']": {
          backgroundColor: "#eef4ff",
          fontWeight: 600,
        },

        "&.Mui-focused": {
          backgroundColor: "#f8fafc",
        },
      },
    },
  },
} as const;

export const getMultiOptionAutocompleteSx = (hasSelectedValues: boolean): SxProps<Theme> => ({
  "& .MuiAutocomplete-inputRoot": {
    flexWrap: "nowrap",
    alignItems: "center",
    overflow: "hidden",
    paddingInlineStart: "8px !important",
    paddingInlineEnd: "28px !important",
  },
  "& .MuiAutocomplete-input": {
    flex: hasSelectedValues ? "0 0 0" : "1 1 auto",
    width: hasSelectedValues ? "0 !important" : "auto !important",
    minWidth: hasSelectedValues ? "0 !important" : "42px !important",
  },
});

export const selectedOptionsTextSx: SxProps<Theme> = {
  minWidth: 0,
  maxWidth: "100%",
  flex: "1 1 auto",
  alignSelf: "center",
  lineHeight: 1.4,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  direction: "ltr",
  textAlign: "left",
};

export const timePickerPopperSx: SxProps<Theme> = {
  "& .MuiMultiSectionDigitalClock-root": {
    direction: "rtl",
  },
  "& .MuiMultiSectionDigitalClockSection-item, & .MuiClockNumber-root": {
    fontSize: "13.5px",
  },
};

export const compactDateTimeLayoutSx: SxProps<Theme> = {
  direction: "ltr !important",
  width: "476px !important",
  minWidth: "476px !important",
  maxWidth: "476px !important",
  boxSizing: "border-box",

  "& .MuiPickersLayout-contentWrapper": {
    direction: "ltr !important",
    display: "flex !important",
    flexDirection: "row-reverse !important",
    alignItems: "stretch",
    width: "476px !important",
    minWidth: "476px !important",
    maxWidth: "476px !important",
  },

  "& .MuiDateCalendar-root": {
    width: "320px !important",
    minWidth: "320px !important",
    maxWidth: "320px !important",
    flex: "0 0 320px !important",
    margin: "0 auto",
  },

  "& .MuiMultiSectionDigitalClock-root": {
    direction: "ltr !important",
    display: "flex !important",
    flexDirection: "row-reverse !important",
    justifyContent: "center !important",
    gap: "8px",
    width: "156px !important",
    minWidth: "156px !important",
    maxWidth: "156px !important",
    flex: "0 0 156px !important",
    boxSizing: "border-box",
    padding: "8px 6px",
  },

  "& .MuiMultiSectionDigitalClockSection-root": {
    width: "48px !important",
    minWidth: "48px !important",
    maxWidth: "48px !important",
    flex: "0 0 48px !important",
    padding: "3px 0 !important",
    margin: "0 !important",
    scrollbarWidth: "none",
  },

  "& .MuiMultiSectionDigitalClockSection-root::-webkit-scrollbar": {
    display: "none",
  },

  "& .MuiMultiSectionDigitalClockSection-root::before, & .MuiMultiSectionDigitalClockSection-root::after":
    {
      display: "none !important",
      height: "0 !important",
      minHeight: "0 !important",
      maxHeight: "0 !important",
    },

  "& .MuiMultiSectionDigitalClockSection-item": {
    width: "42px !important",
    minWidth: "42px !important",
    maxWidth: "42px !important",
    height: "30px",
    marginLeft: "auto !important",
    marginRight: "auto !important",
    borderRadius: "8px",
    justifyContent: "center !important",
    fontSize: "13.5px",
  },

  "& .MuiClockNumber-root": {
    fontSize: "13.5px",
  },
};

export const dateTimePickerPopperSx: SxProps<Theme> = {
  "& .MuiPaper-root": {
    width: "476px !important",
    minWidth: "476px !important",
    maxWidth: "476px !important",
    overflow: "hidden !important",
  },
  "& .MuiPickersLayout-root": compactDateTimeLayoutSx,
};
