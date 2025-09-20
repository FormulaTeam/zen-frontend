import { Box, Paper } from "@mui/material";
import styled from "styled-components";

export const StyledListHeader = styled.div`
  padding: 16px;
  margin: 8px 0;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
export const StyledListItem = styled(Paper)`
  padding: 16px;
  margin: 8px 0;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
export const FormInfo = styled(Box)`
  display: flex;
  flex-direction: column;
`;

export const FormTitleBox = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const RestoreButtonWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
`;

export const Img = styled.img`
  margin-left: 10px;
  height: 20px;
`;

export const StrongText = styled.strong`
  color: ${({ color }) => color};
`;

export const HeaderWrapper = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const CheckboxWrapper = styled("div")`
  display: flex;
  align-items: center;
  padding: 0;
  width: 40px;
`;

export const FlexRowItem = styled("div")`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;
