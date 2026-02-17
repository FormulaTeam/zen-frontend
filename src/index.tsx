import ReactDOM from "react-dom/client";
import App from "./App";
import createCache from "@emotion/cache";
import rtlPlugin from "@mui/stylis-plugin-rtl";
import { CssBaseline, GlobalStyles } from "@mui/material";
import { prefixer } from "stylis";
import { ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import { theme } from "./theme/theme";
import "./index.scss";
import "./polyfills";
import * as _ from "lodash";
import "material-icons/iconfont/material-icons.css";

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
          "*": {
            margin: 0,
            borderRadius: theme.borders.base,
          },
          "::-webkit-scrollbar-track": {
            backgroundColor: theme.palette.background.default,
          },

          "::-webkit-scrollbar": {
            width: theme.scrollBar.width,
            height: theme.scrollBar.height,
            backgroundColor: theme.scrollBar.color,
          },

          "::-webkit-scrollbar-thumb": {
            backgroundColor: theme.scrollBar.color,
            borderRadius: theme.scrollBar.borderRadius,
          },
        })}
      />
      <CssBaseline />
      <App />
    </CacheProvider>
  </ThemeProvider>,
);
