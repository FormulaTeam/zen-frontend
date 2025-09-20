import React from "react";
import { Button } from "@mui/material";
import { AlertIcon, ButtonRow, CloseBtn, Container, Message, Popup, SuccessIcon } from "./styled";

interface AlertMsgProps {
  msg: string[];
  closePopup: () => void;
  onOk?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  isSuccess?: boolean;
  sectionId?: string;
  isTabularEdit?: boolean;
}

const AlertMsg: React.FC<AlertMsgProps> = ({
  msg,
  closePopup,
  onOk,
  onClose,
  isSuccess = false,
  sectionId = "",
  isTabularEdit = false,
}) => {
  return (
    <Container>
      <Popup>
        <CloseBtn onClick={closePopup} />
        {isSuccess ? <SuccessIcon fontSize="large" /> : <AlertIcon fontSize="large" />}
        {msg.map((error, index: number) => (
          <Message key={index}>{error}</Message>
        ))}
        {onOk && (
          <ButtonRow>
            <Button variant="contained" onClick={onOk}>
              {sectionId || isTabularEdit ? "אישור" : "שמירה ויציאה"}
            </Button>
            <Button variant="outlined" onClick={closePopup}>
              ביטול
            </Button>
            {onClose && (
              <Button variant="contained" onClick={onClose}>
                יציאה ללא שמירה
              </Button>
            )}
          </ButtonRow>
        )}
      </Popup>
    </Container>
  );
};

export default AlertMsg;
