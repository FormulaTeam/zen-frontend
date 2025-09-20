import { Box, Toolbar, useTheme } from "@mui/material";

function Layout({ main, sidebar, toolbar }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        minHeight: "100%",
        backgroundColor: theme.palette.background.default,
        display: "flex",
        flexDirection: "column",
      }}>
      <Toolbar
        sx={{
          "&.MuiToolbar-root": {
            zIndex: 1300, // Ensure toolbar is above other content
          },
          position: "sticky",
          top: 0,
          flexShrink: 0,
        }}>
        {toolbar}
      </Toolbar>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          p: 4,
          gap: 3,
        }}>
        <Box sx={{ p: 1, width: 330, flexShrink: 0 }}>{sidebar}</Box>
        <Box
          sx={{
            flexGrow: 1,
            position: "relative",
            overflowY: "auto",
          }}>
          {main}
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
