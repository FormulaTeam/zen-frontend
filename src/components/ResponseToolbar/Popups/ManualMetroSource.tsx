import React from "react";
import PopupContent from "../PopupContent";
import BasePopup from "../../BasePopup/BasePopup";
import Loader from "./Loader";

interface ManualMetroSourceProps {
  form: any;
  setShowMetroInputsPopup: (value: boolean) => void;
  metroInputsPopupLoading: boolean;
  sourceKey: string;
  setSourceKey: (value: string) => void;
  appKey: string;
  setAppKey: (value: string) => void;
  clusterURL: string;
  setClusterURL: (value: string) => void;
  saveMetroData: () => void;
  copySchemaToClipboard: () => void;
}

const ManualMetroSource: React.FC<ManualMetroSourceProps> = ({
  setShowMetroInputsPopup,
  metroInputsPopupLoading,
  sourceKey,
  setSourceKey,
  appKey,
  setAppKey,
  clusterURL,
  setClusterURL,
  saveMetroData,
  copySchemaToClipboard,
}) => {
  return (
    <BasePopup
      open={true}
      onClose={() => setShowMetroInputsPopup(false)}
      title="יצירת מקור ידני"
      content={
        metroInputsPopupLoading ? (
          <Loader />
        ) : (
          <PopupContent
            sourceKey={sourceKey}
            setSourceKey={setSourceKey}
            appKey={appKey}
            setAppKey={setAppKey}
            clusterURL={clusterURL}
            setClusterURL={setClusterURL}
          />
        )
      }
      mainButton={{ text: "שמירה", onClick: saveMetroData, disabled: !sourceKey || !clusterURL }}
      cancelButton={{ text: "העתקת סכמה", onClick: copySchemaToClipboard }}
    />
  );
};

export default ManualMetroSource;
