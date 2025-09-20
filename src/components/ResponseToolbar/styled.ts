import styled from "styled-components";


export const Wrapper = styled("div")`
  text-align: right;
  color: #000000;
`;

export const Paragraph = styled("div")`
  margin-bottom: 16px;
  font-size: 16px;
  line-height: 1.5;
`;

export const NumberedLine = styled("div")`
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-top: 8px;
`;

export const NumberLabel = styled("label")`
  font-weight: bold;
`;

export const LineLabel = styled("label")`
  flex: 1;
`;

export const ErrorBox = styled("div")`
  color: red;
  margin-top: 16px;
  padding: 8px;
  border: 1px solid red;
  border-radius: 4px;
`;
