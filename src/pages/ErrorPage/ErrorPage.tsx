import { useNavigate } from "react-router-dom";
import bg404 from "../../images/404_blue.png";
import { Button } from "@mui/material";
import "./ErrorPage.scss";
import { theme } from "../../theme/theme";

function ErrorPage({}) {
  const navigate = useNavigate();

  return (
    <div className="error-page-container">
      <div className="error-lbls-div">
        <img src={bg404} className="error-top" />
        <label className="error-lbl">העמוד המבוקש לא נמצא</label>
        <label className="error-lbl">או שאין לך את ההרשאות הנחוצות בשבילו...</label>

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
