import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { BookOpen, ChevronDown, CircleQuestionMark, MessageCircle, Ticket } from "lucide-react";

type QuestionItem = {
  question: string;
  answer: string;
};

interface SupportPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide?: () => void;
  onOpenTicket?: () => void;
  onContactUs?: () => void;
}

const questions: QuestionItem[] = [
  {
    question: "איך יוצרים טופס חדש?",
    answer: "כדי ליצור טופס חדש, לחצו על כפתור ״טופס חדש״ במסך הראשי והגדירו את השדות הרצויים.",
  },
  {
    question: "מה ההבדל בין שם פנימי לשם תצוגה?",
    answer: "שם תצוגה הוא השם שמוצג למשתמשים. שם פנימי משמש לזיהוי השדה במערכת ובאינטגרציות.",
  },
  {
    question: "מהי מיקרו-אינטראקציה?",
    answer:
      "מיקרו-אינטראקציה היא תגובה קטנה בממשק, כמו אנימציה, שינוי צבע או חיווי קצר שמסביר למשתמש שפעולה בוצעה.",
  },
  {
    question: "איך מנהלים הרשאות לטופס?",
    answer: "נכנסים לניהול הרשאות מתוך הטופס ובוחרים אילו משתמשים או תפקידים יקבלו גישה.",
  },
  {
    question: "איך משחזרים טופס שנמחק?",
    answer: "דרך עמוד השחזור ניתן לראות טפסים שנמחקו ולשחזר אותם בהתאם להרשאות המשתמש.",
  },
];

const StyledDialog = styled(Dialog)(() => ({
  "& .MuiPaper-root": {
    width: "920px",
    maxWidth: "calc(100vw - 48px)",
    maxHeight: "min(760px, calc(100vh - 48px))",
    borderRadius: "24px",
    backgroundColor: "#F1F5F9",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    direction: "ltr",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(() => ({
  position: "relative",
  padding: "34px 36px 18px",
  textAlign: "center",
}));

const CloseButton = styled(IconButton)(() => ({
  position: "absolute",
  right: "24px",
  left: "auto",
  top: "24px",
  width: "36px",
  height: "36px",
  padding: 0,
  color: "#111827",
  backgroundColor: "transparent",
  borderRadius: 0,

  "&:hover": {
    backgroundColor: "transparent",
    color: "#475569",
  },

  "& svg": {
    fontSize: "30px",
  },
}));

const TitleText = styled(Typography)(() => ({
  fontWeight: 800,
  fontSize: "32px",
  lineHeight: "42px",
  color: "#020617",
  letterSpacing: "-0.02em",
}));

const SubtitleText = styled(Typography)(() => ({
  marginTop: "8px",
  color: "#62748E",
  fontWeight: 400,
  fontSize: "18px",
  lineHeight: "28px",
  textAlign: "left",
  direction: "ltr",
}));

const Content = styled(DialogContent)(() => ({
  padding: "14px 36px 0",
  flex: 1,
  minHeight: 0,
  maxHeight: "min(500px, calc(100vh - 270px))",
  overflowY: "auto",
  overflowX: "hidden",

  "&::-webkit-scrollbar": {
    width: "10px",
  },

  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#D8E2EF",
    borderRadius: "999px",
  },

  "&::-webkit-scrollbar-track": {
    backgroundColor: "transparent",
  },
}));

const QuestionsCard = styled(Box)(() => ({
  width: "100%",
  borderRadius: "8px",
  backgroundColor: "#F8FBFF",
  overflow: "hidden",
  border: "1px solid rgba(216, 226, 239, 0.7)",
}));

const QuestionRow = styled("button")<{ $isOpen?: boolean }>(({ $isOpen }) => ({
  width: "100%",
  minHeight: "74px",
  border: "none",
  borderBottom: "1px solid #E2E8F0",
  backgroundColor: $isOpen ? "#FFFFFF" : "#F8FBFF",
  display: "flex",
  flexDirection: "row-reverse",
  alignItems: "center",
  gap: "14px",
  padding: "0 22px",
  cursor: "pointer",
  direction: "ltr",
  textAlign: "right",
  color: "#020617",

  "&:hover": {
    backgroundColor: "#FFFFFF",
  },

  "&:last-of-type": {
    borderBottom: "none",
  },
}));

const ChevronIcon = styled(ChevronDown)<{ $isOpen?: boolean }>(({ $isOpen }) => ({
  width: "22px",
  height: "22px",
  minWidth: "22px",
  color: "#020617",
  transform: $isOpen ? "rotate(180deg)" : "rotate(0deg)",
  transition: "transform 160ms ease",
}));

const QuestionTitle = styled(Typography)(() => ({
  flex: 1,
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: 700,
  color: "#020617",
  direction: "ltr",
  textAlign: "left",
}));

const AnswerBox = styled(Box)(() => ({
  padding: "0 22px 24px 22px",
  backgroundColor: "#FFFFFF",
  borderBottom: "1px solid #E2E8F0",
  textAlign: "right",
  direction: "ltr",
}));

const AnswerText = styled(Typography)(() => ({
  color: "#020617",
  fontSize: "17px",
  lineHeight: "30px",
  fontWeight: 400,
  direction: "ltr",
  textAlign: "left",
}));

const FooterRow = styled(DialogActions)(() => ({
  padding: "18px 36px 34px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "18px",
  direction: "ltr",
}));

const NeedMoreHelp = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "#020617",
  fontSize: "18px",
  lineHeight: "26px",
  fontWeight: 800,
  whiteSpace: "nowrap",

  "& svg": {
    width: "22px",
    height: "22px",
  },
}));

const Actions = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  direction: "rtl",
}));

const ActionButton = styled(Button)(() => ({
  minWidth: "156px",
  height: "42px",
  padding: "0 16px",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: 700,
  textTransform: "none",
  color: "#020617",
  borderColor: "#d8e2ef",
  backgroundColor: "#ffffff",
  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
  gap: "8px",

  "& svg": {
    width: "21px",
    height: "21px",
  },

  "&:hover": {
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 10px rgba(15, 23, 42, 0.1)",
  },
}));

const PrimaryActionButton = styled(Button)(({ theme }) => ({
  minWidth: "120px",
  height: "42px",
  padding: "0 18px",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: 700,
  textTransform: "none",
  backgroundColor: theme.palette.primary.main,
  color: "#ffffff",
  boxShadow: "none",
  gap: "8px",

  "& svg": {
    width: "21px",
    height: "21px",
  },

  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: "none",
  },
}));

const SupportPopup: React.FC<SupportPopupProps> = ({
  isOpen,
  onClose,
  onOpenGuide,
  onOpenTicket,
  onContactUs,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(1);

  const handleToggleQuestion = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <StyledDialog open={isOpen} onClose={onClose} scroll="paper">
      <StyledDialogTitle>
        <CloseButton aria-label="סגירה" onClick={onClose}>
          <CloseIcon />
        </CloseButton>

        <TitleText>שאלות נפוצות</TitleText>
        <SubtitleText>כאן ניתן למצוא תשובות לשאלות הנפוצות ביותר על המערכת.</SubtitleText>
      </StyledDialogTitle>

      <Content>
        <QuestionsCard>
          {questions.map((item, index) => {
            const isOpenQuestion = openIndex === index;

            return (
              <Box key={item.question}>
                <QuestionRow
                  type="button"
                  $isOpen={isOpenQuestion}
                  onClick={() => handleToggleQuestion(index)}>
                  <ChevronIcon $isOpen={isOpenQuestion} />

                  <QuestionTitle>{item.question}</QuestionTitle>
                </QuestionRow>

                {isOpenQuestion && (
                  <AnswerBox>
                    <AnswerText>{item.answer}</AnswerText>
                  </AnswerBox>
                )}
              </Box>
            );
          })}
        </QuestionsCard>
      </Content>

      <FooterRow>
        <NeedMoreHelp>
          <CircleQuestionMark />
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
    </StyledDialog>
  );
};

export default SupportPopup;
