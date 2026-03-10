import React from "react";
import { Tooltip, useTheme } from "@mui/material";
import {
  DescriptionDiv,
  ItemCreatedEditedDiv,
  TextTitle,
  TextTitleValueDiv,
  TextValue,
} from "./styled";
import moment from "moment";
import { DEFAULT_DATE_FORMAT } from "../../utils/utils";
import { FormOverview } from "../../utils/interfaces";

interface CardCreationDetailsProps {
  form: FormOverview;
}

const CardCreationDetails: React.FC<CardCreationDetailsProps> = ({ form }) => {
  const theme = useTheme();
  return (
    <DescriptionDiv>
      <ItemCreatedEditedDiv>
        <TextTitleValueDiv isFirst>
          <TextTitle style={{ color: theme.palette.text.secondary }}>נוצר על ידי</TextTitle>

          <Tooltip
            placement="top-start"
            title={<span className="tooltip-span">{form.created_by.upn}</span>}>
            <TextValue className="text-value form-created-by" style={{ color: theme.palette.text.secondary }}>
              {form.created_by.name}
            </TextValue>
          </Tooltip>
        </TextTitleValueDiv>

        <TextTitleValueDiv>
          {form.lastInteractionAt && (form.responsesCount ?? 0) > 0 && (
            <TextTitle style={{ color: theme.palette.text.secondary }}>תגובה אחרונה</TextTitle>
          )}
          {form.lastInteractionAt && (form.responsesCount ?? 0) > 0 ? (
            <TextValue className="text-value" style={{ color: theme.palette.text.secondary }}>
              {moment(form.lastInteractionAt).format(DEFAULT_DATE_FORMAT)}
            </TextValue>
          ) : (
            <TextValue style={{ color: theme.palette.text.secondary }}></TextValue>
          )}
        </TextTitleValueDiv>
      </ItemCreatedEditedDiv>
    </DescriptionDiv>
  );
};

export default CardCreationDetails;
