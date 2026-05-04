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
  const title = isSuccess ? "הפעולה הושלמה בהצלחה" : "יש לתקן את השגיאות לפני השמירה";
  const subtitle = isSuccess
    ? "הנתונים נשמרו בהצלחה"
    : msg.length > 1
      ? `נמצאו ${msg.length} בעיות שצריך לתקן`
      : "נמצאה בעיה אחת שצריך לתקן";

  const iconColor = isSuccess ? "#2e7d32" : "#d32f2f";
  const iconBackground = isSuccess ? "#edf7ed" : "#fdecec";
  const cardBorderColor = isSuccess ? "#c8e6c9" : "#f2c7c7";
  const cardBackground = isSuccess ? "#fbfffb" : "#fffafa";

  return (
    <Container
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        padding: 16,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        zIndex: 9999,
        backgroundColor: "rgba(17, 24, 39, 0.32)",
      }}>
      <Popup
        style={{
          position: "relative",
          top: "auto",
          left: "auto",
          right: "auto",
          bottom: "auto",
          transform: "none",
          width: "min(560px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 32px)",
          boxSizing: "border-box",
          padding: 0,
          borderRadius: 22,
          backgroundColor: "#ffffff",
          boxShadow: "0 22px 65px rgba(0, 0, 0, 0.22)",
          border: "1px solid #e3e7ee",
          direction: "rtl",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          overflow: "hidden",
          margin: 0,
        }}>
        <CloseBtn
          onClick={closePopup}
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            width: 34,
            height: 34,
            borderRadius: "50%",
            backgroundColor: "#f6f7f9",
            color: "#4b5563",
            zIndex: 2,
          }}
        />

        <div
          style={{
            padding: "30px 34px 22px",
            borderBottom: "1px solid #edf0f5",
            background: "linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)",
          }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              paddingLeft: 38,
            }}>
            <div
              style={{
                width: 58,
                height: 58,
                minWidth: 58,
                borderRadius: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: iconBackground,
                color: iconColor,
              }}>
              {isSuccess ? <SuccessIcon fontSize="large" /> : <AlertIcon fontSize="large" />}
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.3,
                }}>
                {title}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 17,
                  color: "#4b5563",
                  lineHeight: 1.45,
                  fontWeight: 400,
                }}>
                {subtitle}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            maxHeight: "min(390px, calc(100vh - 290px))",
            overflowY: "auto",
            padding: "18px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            backgroundColor: "#ffffff",
          }}>
          {msg.map((error, index: number) => {
            const { fieldName, message, detail } = normalizeAlertMessage(error);

            return (
              <Message
                key={index}
                style={{
                  margin: 0,
                  padding: "16px 18px",
                  borderRadius: 16,
                  backgroundColor: cardBackground,
                  border: `1px solid ${cardBorderColor}`,
                  textAlign: "right",
                  color: "#111827",
                  boxShadow: "0 2px 8px rgba(17, 24, 39, 0.04)",
                }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: iconColor,
                      marginTop: 9,
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 18,
                        lineHeight: 1.45,
                        fontWeight: 700,
                        color: "#111827",
                      }}>
                      {fieldName ? (
                        <>
                          <span>{fieldName}</span>
                          <span style={{ color: "#6b7280", fontWeight: 600 }}> — </span>
                        </>
                      ) : null}
                      {message}
                    </div>

                    {!isSuccess && detail && (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 17,
                          lineHeight: 1.6,
                          color: "#374151",
                          fontWeight: 400,
                        }}>
                        {detail}
                      </div>
                    )}
                  </div>
                </div>
              </Message>
            );
          })}
        </div>

        <div
          style={{
            padding: "18px 22px 22px",
            borderTop: "1px solid #edf0f5",
            backgroundColor: "#fafbfc",
          }}>
          {onOk ? (
            <ButtonRow
              style={{
                marginTop: 0,
                display: "flex",
                justifyContent: "center",
                gap: 12,
                flexWrap: "wrap",
              }}>
              <Button
                variant="contained"
                onClick={onOk}
                sx={{
                  borderRadius: "12px",
                  px: 4,
                  py: 1.2,
                  fontSize: 16,
                  fontWeight: 700,
                  boxShadow: "none",
                }}>
                {sectionId || isTabularEdit ? "אישור" : "שמירה ויציאה"}
              </Button>

              {onClose ? (
                <Button
                  variant="outlined"
                  onClick={onClose}
                  sx={{
                    borderRadius: "12px",
                    px: 4,
                    py: 1.2,
                    fontSize: 16,
                    fontWeight: 700,
                  }}>
                  יציאה ללא שמירה
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={closePopup}
                  sx={{
                    borderRadius: "12px",
                    px: 4,
                    py: 1.2,
                    fontSize: 16,
                    fontWeight: 700,
                  }}>
                  ביטול
                </Button>
              )}
            </ButtonRow>
          ) : (
            <Button
              variant="contained"
              onClick={closePopup}
              sx={{
                display: "block",
                mx: "auto",
                borderRadius: "12px",
                px: 5,
                py: 1.2,
                fontSize: 16,
                fontWeight: 700,
                boxShadow: "none",
              }}>
              הבנתי
            </Button>
          )}
        </div>
      </Popup>
    </Container>
  );
};

export default AlertMsg;
