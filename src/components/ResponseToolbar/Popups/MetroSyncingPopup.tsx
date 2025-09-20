import React from "react";
import BasePopup from "../../BasePopup/BasePopup";
import syncGif from "../../../images/sync.gif";
import mGif from "../../../images/m.gif";
import { GifsWrapper, MGif, SyncGif } from "./styled";

interface MetroSyncingPopupProps {
  setShowMetroPopup: (value: boolean) => void;
}

const MetroSyncingPopup: React.FC<MetroSyncingPopupProps> = ({ setShowMetroPopup }) => {
  return (
    <BasePopup
      open
      onClose={() => setShowMetroPopup(false)}
      title="סנכרון נתונים למטרו"
      content={
        <GifsWrapper>
          <SyncGif src={syncGif} />
          <MGif src={mGif} />
        </GifsWrapper>
      }
    />
  );
};

export default MetroSyncingPopup;
