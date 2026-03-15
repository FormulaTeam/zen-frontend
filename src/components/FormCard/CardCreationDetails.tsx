import React from "react";
import { Tooltip, useTheme } from "@mui/material";
import {
  DeatailsDiv,
  ItemCreatedEditedDiv,
  TextTitle,
  TextTitleValueDiv,
  TextValue,
} from "./styled";
import moment from "moment";
import { DEFAULT_DATE_TIME_FORMAT } from "../../utils/utils";
import { FormOverview } from "../../utils/interfaces";

interface CardCreationDetailsProps {
  form: FormOverview;
}

const CardCreationDetails: React.FC<CardCreationDetailsProps> = ({ form }) => {
  const theme = useTheme();
  return (
    <DeatailsDiv>
      <ItemCreatedEditedDiv>
        <TextTitleValueDiv>
          <TextTitle style={{ color: theme.palette.text.secondary }}>{`נוצר על ידי \b`}</TextTitle>

          <Tooltip
            placement="top-start"
            title={<span className="tooltip-span">{form.createdBy.upn}</span>}>
            <TextValue className="text-value form-created-by" style={{ color: theme.palette.text.secondary }}>
              {form.createdBy.name}
            </TextValue>
          </Tooltip>
        </TextTitleValueDiv>

        <TextTitleValueDiv>
          {form.lastInteractionAt && (form.responsesCount ?? 0) > 0 && (
            <TextTitle style={{ color: theme.palette.text.secondary }}>פעילות אחרונה ב-</TextTitle>
          )}
          {form.lastInteractionAt && (form.responsesCount ?? 0) > 0 ? (
            <TextValue className="text-value" style={{ color: theme.palette.text.secondary }}>
              {moment(form.lastInteractionAt).format(`${DEFAULT_DATE_TIME_FORMAT}`)}
            </TextValue>
          ) : (
            <TextValue style={{ color: theme.palette.text.secondary }}></TextValue>
          )}
        </TextTitleValueDiv>
      </ItemCreatedEditedDiv>
    </DeatailsDiv>
  );
};

export default CardCreationDetails;
