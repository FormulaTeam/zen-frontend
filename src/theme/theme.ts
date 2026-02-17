import { createTheme, responsiveFontSizes } from "@mui/material";
import { heIL } from "@mui/x-data-grid-pro/locales";
import { heIL as coreHeIL } from "@mui/material/locale";

const fontRegular = {
  fontFamily: "assistant",
  src: `
    url('/fonts/Assistant-Regular.ttf') format('truetype')
  `,
  fontWeight: "normal",
  fontStyle: "normal",
};
const fontBold = {
  fontFamily: "assistant",
  src: `
    url('/fonts/Assistant-Bold.ttf') format('truetype')
  `,
  fontWeight: "bold",
  fontStyle: "normal",
};

const palette = {
  type: "light",
  primary: {
    main: "#1976D2",
  },
  secondary: {
    main: "#1976D224",
    contrastText: "#000000",
  },
  background: {
    default: "#FAFAFA",
    paper: "#FFFFFF",
    success: "#00B050",
  },
  white: "#f9f9f9",
  text: {
    primary: "#000000",
    secondary: "#85878D",
  },
  hint: "#BDBDBD",
  divider: "#85878D",
  input: {
    primaryText: "#666666",
    secondaryText: "#85878D",
    darkText: "#000000DE",
    border: "#D9D9D9",
  },
  button: {
    primaryText: "#666666",
    disabled: "#cccccc",
  },
  error: {
    main: "#DB0004",
  },
  shadow: "#1976D21A",
  tableHeader: "#d5e6f6",
};

export let theme = createTheme(
  {
    direction: "rtl",
    typography: {
      fontFamily: "assistant, sans-serif",
      fontSize: 16,
    },
    palette,
    components: {},
    borders: {
      base: "0px",
      lg: "8px",
      color: "#dcdcdc",
    },
    scrollBar: {
      width: "3px",
      height: "5px",
      color: "#c3c0c0",
      borderRadius: "9999px",
    },
    darkPaper: "#f1f1f14d",
  },
  coreHeIL,
  heIL,
);

// moved components overrides so we can use palette default colors in overrides styles
theme.components = {
  MuiCssBaseline: {
    styleOverrides: {
      "@global": {
        "@font-face": [fontRegular, fontBold],
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableTouchRipple: true,
      disableFocusRipple: true,
      disableRipple: true,
    },
    styleOverrides: {
      root: {
        borderRadius: "8px",
        boxShadow: "none",
        ":hover": {
          boxShadow: "none",
        },
      },
      startIcon: {
        margin: 0,
      },
    },
    variants: [
      {
        props: { variant: "customIcon" },
        style: {
          borderRadius: "100px",
          minWidth: 0,
          height: "45px",
          width: "45px",
          padding: "10px",
          ":hover": {
            backgroundColor: theme.palette.shadow,
          },
        },
      },
    ],
  },
  MuiDialog: {
    styleOverrides: {
      root: {
        "& .MuiDialogTitle-root": {
          fontSize: "24px",
        },
      },
      paper: {
        padding: "40px",
        borderRadius: "16px",
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        "&": {
          direction: "rtl",
          fontSize: "1rem",
          "&.font-lg": {
            fontSize: "1.25rem",
          },
        },
      },
    },
  },
  MuiTextField: {
    variants: [
      {
        props: { variant: "outlined" },
        style: {
          backgroundColor: theme.palette.background.paper,
          borderRadius: "8px",
          "& .MuiOutlinedInput-root": {
            borderColor: palette.input.border,
          },
          "& input": {},
          color: theme.palette.primary.dark,
        },
      },
    ],
    styleOverrides: {
      root: {
        "&.formField-number.MuiOutlinedInput-notchedOutline": {
          padding: "revert",
          boxSizing: "content-box",
          width: "90%",
          height: "1.4375em",
          direction: "ltr",
        },
        "input[type='number'], .MuiFormHelperText-root": {
          unicodeBidi: "plaintext",
          textAlign: "left",
        },
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        padding: "1rem",
      },
      indicator: {
        backgroundColor: palette.white,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        color: "black",
        "&:hover": {},
        "&.Mui-selected": {
          color: palette.primary.main,
          fontWeight: 600,
        },
      },
    },
  },
  MuiTypography: {
    variants: [
      {
        props: { variant: "subtitle1" },
        style: {
          fontSize: "16px",
          fontWeight: 400,
          color: theme.palette.text.secondary,
        },
      },
    ],
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        position: "relative",
        backgroundColor: theme.palette.primary.main,
        boxShadow: `0px 4px 20.4px 0px ${theme.palette.shadow}`,
        borderRadius: 0,
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        padding: 9,
        "& .MuiSwitch-track": {
          borderRadius: 22 / 2,
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            width: 15,
            height: 15,
          },
        },
        "& .MuiSwitch-thumb": {
          boxShadow: "none",
          width: 14,
          height: 14,
          margin: 3,
        },
      },
    },
  },
  MuiInput: {
    styleOverrides: {
      root: {
        "&::before": {
          borderColor: palette.input.border,
        },
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        padding: 0.5,
        fontSize: 20,
      },
    },
  },
  MuiSvgIcon: {
    styleOverrides: {
      root: {
        fontSize: "inherit",
      },
    },
  },
  MuiFormControl: {
    defaultProps: {
      size: "small",
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: "8px",
        boxShadow: `0px 4px 20.4px 0px ${theme.palette.shadow}`,
      },
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      root: {
        zIndex: 1000,
        "&.MuiInputBase-input": { direction: "rtl", marginTop: "5px" },
        "&.MuiAutocomplete-root .MuiOutlinedInput-root": {
          borderRadius: "8px",
          fontWeight: 600,
        },
      },
      listbox: {
        border: "1px solid #eee",
        borderRadius: "5px",
        fontSize: "15px",
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        color: theme.palette.text.primary,
      },
    },
  },
  MuiSelect: {
    defaultProps: {
      MenuProps: {
        disableScrollLock: true,
      },
    },
  },
};
theme = responsiveFontSizes(theme);
declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    customIcon: true;
  }
}
declare module "@mui/material/" {
  interface Palette {
    hint?: string;
    shadow?: string;
    input?: {
      primaryText: string;
      secondaryText: string;
      darkText: string;
      border: string;
    };
    button?: {
      primaryText: string;
      disabled: string;
    };
    white: string;
    tableHeader?: string;
  }

  interface SimplePaletteOptions {
    hint?: string;
    shadow?: string;
    input?: {
      primaryText: string;
      secondaryText: string;
      darkText: string;
      border: string;
    };
    white: string;
    tableHeader?: string;
  }
}
