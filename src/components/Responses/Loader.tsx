import { useTheme } from "@mui/material";
import styled from "styled-components";
import ReactLoading from "react-loading";

export const CenteredBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const Loader = () => {
  const theme = useTheme();
  return (
    <CenteredBox>
      <ReactLoading type={"spinningBubbles"} color={theme.palette.primary.main} />
    </CenteredBox>
  );
};

export default Loader;