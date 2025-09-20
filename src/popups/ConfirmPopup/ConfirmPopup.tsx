import React from "react";
import BasePopup from "../../components/BasePopup/BasePopup";
import deleteFormImg from "../../images/delete_form.png";
import { Typography } from "@mui/material";

interface ConfirmPopupProps {
  msg: string;
  okFunc: () => void;
  closePopup: () => void;
  okBtnText?: string;
  cancelBtnText?: string;
  title?: string;
  image?: string;
  messageType?: "error" | "warning" | "info";
}

const ConfirmPopup: React.FC<ConfirmPopupProps> = ({
  msg,
  okFunc,
  closePopup,
  okBtnText = "מחק תגובה",
  cancelBtnText = "אל תמחק",
  title,
  image = deleteFormImg,
  messageType,
}) => {
  return (
    <BasePopup
      open={true}
      onClose={closePopup}
      title={title}
      content={
        <Typography variant="body1" fontWeight="bold">
          {msg}
        </Typography>
      }
      image={image}
      mainButton={{
        text: okBtnText,
        onClick: () => {
          okFunc();
          closePopup();
        },
        color: messageType === "error" ? "error" : "primary",
      }}
      cancelButton={{
        text: cancelBtnText,
        onClick: closePopup,
      }}
    />
  );
};

export default ConfirmPopup;
