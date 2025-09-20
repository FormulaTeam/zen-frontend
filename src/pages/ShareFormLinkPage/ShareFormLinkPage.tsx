import { useParams } from "react-router-dom";
import ReactLoading from "react-loading";
import "./ShareFormLinkPage.scss";
import { useEffect } from "react";
import { useTheme } from "@mui/material/styles";

function ShareFormLinkPage({}) {
  const { form_id } = useParams();
  const theme = useTheme();
  /** when page first renders */
  useEffect(() => {
    let formId: any = form_id;
    if (formId) {
      formId = parseInt(formId);
      if (formId) {
        formId = parseInt(formId);
      }
    }
  }, []);

  return (
    <div className="share-link-page-container">
      <div className="share-link-lbls-div">
        <ReactLoading type={"spinningBubbles"} color={theme.palette.primary.main} />
        <label className="share-link-lbl">מאשר פרטים...</label>
      </div>
    </div>
  );
}

export default ShareFormLinkPage;
