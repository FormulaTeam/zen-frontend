import React from "react";
import { Button } from "@mui/material";
import { AlertIcon, ButtonRow, CloseBtn, Container, Message, Popup, SuccessIcon } from "./styled";

export type AlertMessage =
  | string
  | {
      fieldName?: string;
      message: string;
      detail?: string;
    };

interface AlertMsgProps {
  msg: AlertMessage[];
  closePopup: () => void;
  onOk?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  isSuccess?: boolean;
  sectionId?: string;
  isTabularEdit?: boolean;
}

const normalizeAlertMessage = (
  error: AlertMessage,
): {
  fieldName?: string;
  message: string;
  detail?: string;
} => {
  if (typeof error !== "string") {
    return error;
  }

  const separatorIndex = error.indexOf(":");

  if (separatorIndex === -1) {
    return { message: error.trim() };
  }

  return {
    fieldName: error.slice(0, separatorIndex).trim(),
    message: error.slice(separatorIndex + 1).trim(),
  };
};

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

        {msg.map((error, index: number) => {
          const { fieldName, message, detail } = normalizeAlertMessage(error);

          return (
            <Message key={index} style={{ textAlign: "center" }}>
              <div>
                {msg.length > 1 ? "- " : ""}
                {fieldName ? `${fieldName}: ` : ""}
                {message}
              </div>

              {!isSuccess && detail && (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: "#666",
                    fontWeight: 400,
                  }}>
                  {detail}
                </div>
              )}
            </Message>
          );
        })}

        {onOk && (
          <ButtonRow>
            <Button variant="contained" onClick={onOk}>
              {sectionId || isTabularEdit ? "אישור" : "שמירה ויציאה"}
            </Button>

            {onClose ? (
              <Button variant="outlined" onClick={onClose}>
                יציאה ללא שמירה
              </Button>
            ) : (
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
