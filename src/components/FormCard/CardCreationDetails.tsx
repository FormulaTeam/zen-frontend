import React from "react";
import { Box, Tooltip, useTheme } from "@mui/material";
import {
  ItemCreatedEditedDiv,
  TextTitle,
  TextValue,
} from "./styled";
import { FormOverview } from "../../utils/interfaces";

interface CardCreationDetailsProps {
  form: FormOverview;
}

const CardCreationDetails = ({ form }: CardCreationDetailsProps) => {
  const theme = useTheme();

  return (
    <ItemCreatedEditedDiv>
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
        <TextTitle sx={{ color: "text.secondary" }}>נוצר על ידי</TextTitle>

        <Tooltip
          placement="top-start"
          title={<span className="tooltip-span">{form.createdBy.upn}</span>}>
          <TextValue
            className="text-value form-created-by"
            sx={{ color: "text.secondary" }}>
            {form.createdBy.name}
          </TextValue>
        </Tooltip>
      </Box>
    </ItemCreatedEditedDiv>
  );
};

export default CardCreationDetails;
