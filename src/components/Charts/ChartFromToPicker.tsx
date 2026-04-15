import React from "react";
import CustomDateTime from "../FormFields/CustomDateTime/CustomDateTime";
import styled from "styled-components";
import Button from "@mui/material/Button";

const DatePickersWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  zoom: 0.8;
  margin-bottom: 12px;
`;

const ClearTextButton = styled(Button)`
  font-size: 0.8rem;
  min-width: auto;
  padding: 2px 6px;
  color: #1976d2;
  text-transform: none;
`;

interface ChartFromToPickerProps {
  range: { from: string | null; to: string | null };
  handleDateChange: (key: "from" | "to", value: string | null, valid?: boolean | null) => void;
  handleClearRange: () => void;
}

const ChartFromToPicker: React.FC<ChartFromToPickerProps> = ({
  range,
  handleDateChange,
  handleClearRange,
}) => {
  return (
    <DatePickersWrapper>
      <CustomDateTime
        label="מ"
        isRequired={false}
        isDisabled={false}
        onChangeHandler={(value) => handleDateChange("from", value || null, null)}
        value={range.from}
        dateAndTime={false}
        defaultValue={undefined}
        validationMessage={null}
      />

      <CustomDateTime
        label="עד"
        isRequired={false}
        isDisabled={false}
        onChangeHandler={(value) => handleDateChange("to", value || null, null)}
        value={range.to}
        dateAndTime={false}
        defaultValue={undefined}
        validationMessage={null}
      />

      <ClearTextButton onClick={handleClearRange}>נקה</ClearTextButton>
    </DatePickersWrapper>
  );
};

export default ChartFromToPicker;
