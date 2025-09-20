import React from "react";
import styled from "styled-components";
import Loader from "react-loading";

const Overlay = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const LoadingOverlay: React.FC = () => {
  return (
    <Overlay>
      <Loader type="spinningBubbles" color="#1976d2" height={80} width={80} />
    </Overlay>
  );
};

export default LoadingOverlay;
