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
import { Form } from "../../utils/interfaces";

interface CardCreationDetailsProps {
  form: Form;
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
            title={<span className="tooltip-span">{form.created_by}</span>}>
            <TextValue className="text-value" style={{ color: theme.palette.text.secondary }}>
              {form?.created_by_name ?? form.created_by}
            </TextValue>
          </Tooltip>
        </TextTitleValueDiv>

        <TextTitleValueDiv>
          {form.lastUpdatedResponse && form.numberOfResponses > 0 && (
            <TextTitle style={{ color: theme.palette.text.secondary }}>תגובה אחרונה</TextTitle>
          )}
          {form.lastUpdatedResponse && form.numberOfResponses > 0 ? (
            <TextValue className="text-value" style={{ color: theme.palette.text.secondary }}>
              {moment(form.lastUpdatedResponse).format(DEFAULT_DATE_FORMAT)}
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
