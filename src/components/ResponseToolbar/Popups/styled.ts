import styled from "styled-components";

export const StatusWrapper = styled("div")`
  text-align: right;
`;

export const StatusTitle = styled("h3")`
  margin-bottom: 16px;
`;

export const ErrorList = styled("ul")`
  list-style-position: inside;
  padding: 0;
`;

export const ErrorItem = styled("li")`
  color: red;
  margin: 8px 0;
`;


export const GifsWrapper = styled("div")`
  width: 400px;
  height: 250px;
  position: relative;
`;

export const SyncGif = styled("img")`
  width: 250px;
  position: absolute;
  top: 0;
  left: 80px;
  z-index: 10000;
`;

export const MGif = styled("img")`
  width: 100px;
  position: absolute;
  top: 80px;
  left: 155px;
  z-index: 10001;
`;