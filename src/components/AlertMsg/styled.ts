import styled from "styled-components";
import { CheckCircle, Close } from "@mui/icons-material";
import ErrorIcon from "@mui/icons-material/Error";

export const Container = styled.div`
  position: fixed;
  top: 0%;
  left: 0%;
  z-index: 22222;
  width: 100vw;
  height: 100vw;
  background-color: rgba(0, 0, 0, 0.181);
`;

export const Popup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 22223;
  width: 30vw;
  padding: 0 1vw;
  min-height: 300px;
  max-height: 90vh;
  background-color: #f5f5f5;
  border-radius: 20px;
  box-shadow: gray 0 0 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  direction: rtl;
`;

export const CloseBtn = styled(Close)`
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;
`;

export const CloseLeftBtn = styled(Close)`
  position: absolute;
  top: 15px;
  left: 15px;
  cursor: pointer;
`;

export const SuccessIcon = styled(CheckCircle)`
  width: 100px;
  font-size: 5rem !important;
  color: green;
`;
export const AlertIcon = styled(ErrorIcon)`
  width: 100px;
  font-size: 5rem !important;
  color: red;
`;

export const Message = styled.label`
  width: 100%;
  margin-top: 10px;
  text-align: center;
  font-size: 1.5rem !important;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 30px;
`;
