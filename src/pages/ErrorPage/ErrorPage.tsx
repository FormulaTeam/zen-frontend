import { useNavigate } from "react-router-dom";
import bg404Blue from "../../images/404_blue.png";
import bg404Green from "../../images/404_green.png";
import { Button, Typography } from "@mui/material";
import { useState } from "react";
import "./ErrorPage.scss";
import { theme } from "../../theme/theme";

function ErrorPage({}) {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);

  const handleImageClick = () => {
    setClickCount((prev) => prev + 1);
  };

  const currentImage = clickCount >= 10 ? bg404Green : bg404Blue;
  const currentTitle = clickCount >= 10 ? "כאילו... אנחנו מצאנו" : "לא מצאנו את מה שחיפשת";
  const currentSubTitle =
    clickCount >= 10 ? "פשוט לא ממש יכולים להראות לך" : "או שאולי אין לך הרשאות עבורו";

  return (
    <div className="error-page-container">
      <div className="error-lbls-div">
        <img
          src={currentImage}
          className="error-top easter-egg"
          onClick={handleImageClick}
          alt="404 Error"
        />
        <div className="error-text-content">
          <Typography className="error-lbl primary">{currentTitle}</Typography>
          <Typography className="error-lbl secondary">{currentSubTitle} </Typography>
        </div>

        <Button
          className="back-to-main-btn"
          style={{
            backgroundColor: theme.palette.primary.dark,
          }}
          onClick={() => {
            navigate("/", { replace: true });
          }}>
          חזרה לעמוד הראשי
        </Button>
      </div>
    </div>
  );
}

export default ErrorPage;
