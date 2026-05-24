import { Box, Button, Typography, Card, Icon } from "@mui/material";
import styled from "styled-components";
import { styled as muiStyled } from "@mui/material/styles";

export const ItemCreatedEditedDiv = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const TextTitleValueDiv = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-left: 5%;
`;

export const TextTitle = muiStyled("span")(({ theme }) => ({
  fontWeight: 400,
  fontSize: "14px !important",
  minWidth: "max-content",
  color: "#62748E",
}));

export const TextValue = muiStyled("span")(({ theme }) => ({
  fontWeight: 400,
  fontSize: "14px !important",
  color: "#62748E",
}));

export const DescriptionDiv = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  margin-top: 4px;
  margin-left: 5px;
  min-height: 30px;
  max-height: 30px;
  overflow-y: auto;
  width: 100%;
`;

export const DeatailsDiv = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  margin-left: 5px;
  min-height: 42px;
  max-height: 42px;
  overflow-y: auto;
  width: 100%;
`;

export const ItemDescription = styled(Typography)`
  font-weight: 400;
  color: #020618;
  font-size: 15px !important;
`;

export const FormIconWrapper = muiStyled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  minWidth: "32px",
  color: "#020618",
  "& svg": {
    fontSize: "32px",
  },
  "& img": {
    height: "28px",
    width: "28px",
    objectFit: "contain",
  },
}));

export const StyledCard = styled(Card)`
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 24px 16px 24px;
  width: 100%;
  min-height: 220px;
`;

export const ItemImgAndTitles = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  overflow-x: auto;
`;

export const ItemTitles = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
`;

export const ItemTitleAndNum = styled(Box)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ItemTitle = styled(Typography)`
  font-size: 20px !important;
  cursor: pointer;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-weight: 600 !important;
`;

export const ItemResponsesNum = styled(Typography)`
  min-width: max-content;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-weight: 600 !important;
  font-size: 14px !important;
`;

export const ItemBottomDiv = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow-x: auto;
  width: 100%;
`;

export const ItemBtnsDiv = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  min-height: 28px;
`;

export const ItemButton = styled(Button)`
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  font-size: 15px !important;
  white-space: nowrap;
  text-align: center;
  min-width: 100px;
`;

export const ItemIconsDiv = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;

  .item-icon {
    margin-right: 5px;
    cursor: pointer;
  }

  .item-icon-disabled {
    margin-right: 5px;
    filter: grayscale(100%);
  }
`;

export const LoadingSyncIconBox = styled(Box)`
  width: 20px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 5px;
`;

export const GrayShareIcon = styled.img`
  width: 15px;
  height: 15px;
  opacity: 0.3;
  cursor: pointer;
`;
