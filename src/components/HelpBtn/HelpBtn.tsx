import { Tooltip, useTheme } from "@mui/material";
import { HelpButton } from "./styled";
import { QuestionMark } from "@mui/icons-material";

const HelpBtn = ({ showHelpCard }) => {
  const theme = useTheme();

  return (
    <Tooltip placement="right-start" title={<span className="tooltip-span">עזרה ותמיכה טכנית</span>}>
      <HelpButton className="helpp" onClick={showHelpCard}>
        <QuestionMark />
      </HelpButton>
    </Tooltip>
  );
};

export default HelpBtn;
