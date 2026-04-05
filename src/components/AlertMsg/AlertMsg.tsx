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
    <Container style={{ padding: "5px 20px" }}>
      <Popup>
        <CloseBtn onClick={closePopup} />
        {isSuccess ? <SuccessIcon fontSize="large" /> : <AlertIcon fontSize="large" />}
        {msg.map((error, index: number) => (
          <Message key={index} style={{ textAlign: "center" }}>{`${msg.length > 1 ? '-' : ''} ${error}`}</Message>
        ))}
        {onOk && (
          <ButtonRow>
            <Button variant="contained" onClick={onOk}>
              {sectionId || isTabularEdit ? "אישור" : "שמירה ויציאה"}
            </Button>
            {
              onClose ? (
                <Button variant="outlined" onClick={onClose}>
                  יציאה ללא שמירה
                </Button>
              ) :
                (
                  <Button variant="outlined" onClick={closePopup}>
                    ביטול
                  </Button>
                )}
          </ButtonRow>
        )}
      </Popup>
    </Container>
  );
};

export default AlertMsg;
