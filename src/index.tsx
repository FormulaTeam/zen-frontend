import ReactDOM from "react-dom/client";
import App from "./App";
import createCache from "@emotion/cache";
import rtlPlugin from "@mui/stylis-plugin-rtl";
import { CssBaseline, GlobalStyles } from "@mui/material";
import { prefixer } from "stylis";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/theme";
import "./index.scss";
import "./polyfills";
import "material-icons/iconfont/material-icons.css";
import { CacheProvider } from "@emotion/react";

const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <ThemeProvider theme={theme}>
    <CacheProvider value={cacheRtl}>
      <GlobalStyles
        styles={(theme) => ({
          "html, body": {
            overflow: "hidden !important",
            height: "100%",
            width: "100%",
            margin: 0,
            padding: 0,
          },
          "*": {
            margin: 0,
            borderRadius: theme.borders.base,
            scrollbarWidth: "none !important",
            msOverflowStyle: "none !important",
            "&::-webkit-scrollbar": {
              width: "0 !important",
              height: "0 !important",
            },
          },

          ".MuiDataGrid-virtualScroller, .MuiTableContainer-root, .MuiDataGrid-virtualScrollerContent, .MuiDataGrid-scrollbar--horizontal": {
            scrollbarWidth: "auto !important",
            msOverflowStyle: "auto !important",
            "&::-webkit-scrollbar": {
              width: "0 !important",
              height: "16px !important",
              display: "block !important",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f1f1f1 !important",
              display: "block !important",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: `${theme.scrollBar.color} !important`,
              borderRadius: "10px !important",
              display: "block !important",
              border: "4px solid #f1f1f1 !important",
            },
          },

          ".response-page, .sandboxContainer, .main-page-container, .response-page .MuiContainer-root": {
            scrollbarWidth: "auto !important",
            msOverflowStyle: "auto !important",
            "&::-webkit-scrollbar": {
              width: "8px !important",
              height: "8px !important",
              display: "block !important",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f1f1f1 !important",
              display: "block !important",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: `${theme.scrollBar.color} !important`,
              borderRadius: "10px !important",
              display: "block !important",
              border: "2px solid #f1f1f1 !important",
            },
          },
        })}
      />
      <CssBaseline />
      <App />
    </CacheProvider>
  </ThemeProvider>,
);