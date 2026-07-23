import { BookOpen, MessageCircle, Ticket } from "lucide-react";
import {
  ActionButton,
  Actions,
  FooterRow,
  NeedMoreHelp,
  PrimaryActionButton,
} from "./SupportPopup.styles";

interface SupportPopupFooterProps {
  onOpenGuide?: () => void;
  onOpenTicket?: () => void;
  onContactUs?: () => void;
}

const SupportPopupFooter = ({
  onOpenGuide,
  onOpenTicket,
  onContactUs,
}: SupportPopupFooterProps) => {
  return (
    <FooterRow>
      <NeedMoreHelp>
        <span>צריכים עזרה נוספת?</span>
      </NeedMoreHelp>

      <Actions>
        <PrimaryActionButton variant="contained" disableElevation onClick={onContactUs}>
          כתבו לנו
          <MessageCircle />
        </PrimaryActionButton>

        <ActionButton variant="outlined" disableElevation onClick={onOpenTicket}>
          Ticket פתיחת
          <Ticket />
        </ActionButton>

        <ActionButton variant="outlined" disableElevation onClick={onOpenGuide}>
          מדריך שימוש
          <BookOpen />
        </ActionButton>
      </Actions>
    </FooterRow>
  );
};

export default SupportPopupFooter;
