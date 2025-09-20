import React from "react";
import { useTheme } from "@mui/material";
import ReactLoading from "react-loading";

const Loader: React.FC = () => {
  const theme = useTheme();

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
      <ReactLoading type={"spinningBubbles"} color={theme.palette.primary.main} />
    </div>
  );
};

export default Loader;
