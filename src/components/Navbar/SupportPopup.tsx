import React, { useCallback, useEffect, useRef, useState } from "react";
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
    question: "מה זה טופס?",
    answer:
      "טופס הוא התבנית שלפיה אוספים מידע במערכת.\nבתוך הטופס מגדירים את השדות שהמשתמשים ימלאו, למשל שם, תאריך, סטטוס, קובץ או בחירה מרשימה.",
  },
  {
    question: "מה זה תגובה?",
    answer:
      "תגובה היא רשומת מידע שנוצרה מתוך טופס.\nכל פעם שמשתמש ממלא טופס ושומר אותו, נוצרת תגובה חדשה. לדוגמה: בטופס “תלמידים”, כל תלמיד שנוסף הוא תגובה. ",
  },
  {
    question: "איך יוצרים טופס?",
    answer: "נכנסים למסך הטפסים, יוצרים טופס חדש, מגדירים שם, שדות וסוגי שדות, ושומרים.",
  },
  {
    question: "איך יוצרים תגובה?",
    answer: "נכנסים לטופס הרצוי, לוחצים על יצירת תגובה, ממלאים את השדות ושומרים.",
  },
  {
    question: "מה אפשר לעשות אחרי יצירת טופס?",
    answer:
      "אפשר ליצור תגובות, לערוך את הטופס, להגדיר הרשאות, לשתף, לייבא/לייצא מידע ולצפות בתגובות בטבלה.",
  },
  {
    question: "מאיפה מקבלים את המידע?",
    answer:
      "אפשר לראות את המידע בטבלת התגובות במערכת, לייצא לאקסל, או לצרוך אותו דרך Data Lake ומערכת קוביה.",
  },
  {
    question: "מה זה טופס מקושר?",
    answer:
      "זה מנגנון שמאפשר להוסיף תגובות מטופס אחד מתוך תגובה בטופס אחר.\nלדוגמה: מתוך כיתה אפשר להוסיף תלמידים.",
  },
  {
    question: "אילו הרשאות קיימות?",
    answer:
      "קיימות הרשאות כמו שליטה מלאה, ניהול תגובות, ניהול ללא מחיקה, צפייה בלבד, יצירה בלבד, ויצירה וצפייה בתגובות שלי בלבד.",
  },
  {
    question: "מה זה מקטע?",
    answer: "מקטע הוא חלוקה פנימית בטופס שמסדרת שדות לפי נושא, למשל “פרטים אישיים” או “מסמכים”.",
  },
  {
    question: "אפשר לעשות תלות בין אפשרויות?",
    answer:
      "כן. אפשר להגדיר שאפשרויות בשדה אחד ישפיעו על האפשרויות בשדה אחר.\nלדוגמה: בחירת מדינה תשפיע על רשימת הערים.",
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

const TitleText = styled("h2")(() => ({
  margin: 0,
  fontWeight: 700,
  fontSize: "34px",
  lineHeight: "48px",
  color: "#020617",
  letterSpacing: "-0.02em",
}));

const SubtitleText = styled(Typography)(() => ({
  marginTop: "8px",
  color: "#62748E",
  fontWeight: 400,
  fontSize: "20px",
  lineHeight: "30px",
  textAlign: "left",
  direction: "ltr",
}));

const Content = styled(DialogContent)(() => ({
  padding: "14px 36px 0",
  flex: 1,
  minHeight: 0,
  overflow: "hidden",
}));

const ScrollShell = styled(Box)(() => ({
  position: "relative",
  height: "420px",
  maxHeight: "calc(100vh - 300px)",
  paddingLeft: "18px",
  paddingRight: 0,
  boxSizing: "border-box",
}));

const ScrollArea = styled(Box)(() => ({
  height: "100%",
  overflowY: "auto",
  overflowX: "hidden",

  scrollbarWidth: "none",
  msOverflowStyle: "none",

  "&::-webkit-scrollbar": {
    display: "none",
  },
}));

const ScrollShadow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "$position" && prop !== "$isVisible",
})<{
  $position: "top" | "bottom";
  $isVisible: boolean;
}>(({ $position, $isVisible }) => ({
  position: "absolute",
  left: "18px",
  right: 0,
  zIndex: 2,
  height: "26px",
  pointerEvents: "none",
  opacity: $isVisible ? 1 : 0,
  transition: "opacity 140ms ease",
  top: $position === "top" ? 0 : "auto",
  bottom: $position === "bottom" ? 0 : "auto",
  background:
    $position === "top"
      ? "linear-gradient(to bottom, rgba(15, 23, 42, 0.14), rgba(15, 23, 42, 0))"
      : "linear-gradient(to top, rgba(15, 23, 42, 0.14), rgba(15, 23, 42, 0))",
}));

const VisibleScrollbar = styled(Box)(() => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: "auto",
  width: "10px",
  height: "100%",
  borderRadius: "999px",
  overflow: "hidden",
  cursor: "pointer",
}));

const VisibleScrollbarThumb = styled(Box)(() => ({
  width: "100%",
  borderRadius: "999px",
  backgroundColor: "#E2E8F0",
  transition: "height 120ms ease, opacity 120ms ease, background-color 120ms ease",
  cursor: "grab",
  userSelect: "none",
  touchAction: "none",

  "&:hover": {
    backgroundColor: "#CBD5E1",
  },

  "&:active": {
    cursor: "grabbing",
    backgroundColor: "#B8C4D4",
  },
}));

const QuestionsCard = styled(Box)(() => ({
  width: "100%",
  borderRadius: "8px",
  backgroundColor: "#F1F5F9",
  overflow: "hidden",
}));

const QuestionItemWrapper = styled(Box)(() => ({
  borderBottom: "1px solid #D8E2EF",

  "&:last-of-type": {
    borderBottom: "none",
  },
}));

const QuestionRow = styled("button")<{ $isOpen?: boolean }>(() => ({
  width: "100%",
  minHeight: "74px",
  border: "none",
  backgroundColor: "#F1F5F9",
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
    backgroundColor: "#F1F5F9",
  },

  "&:active": {
    backgroundColor: "#F1F5F9",
  },

  "&:focus": {
    outline: "none",
  },

  "&:focus-visible": {
    outline: "2px solid rgba(148, 163, 184, 0.55)",
    outlineOffset: "-2px",
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
  fontSize: "22px",
  lineHeight: "32px",
  fontWeight: 500,
  color: "#020617",
  direction: "ltr",
  textAlign: "left",
}));

const AnswerBox = styled(Box)(() => ({
  padding: "0 22px 24px 22px",
  backgroundColor: "#F1F5F9",
  textAlign: "right",
  direction: "ltr",
}));

const AnswerText = styled(Typography)(() => ({
  color: "#020617",
  fontSize: "12px",
  lineHeight: "30px",
  fontWeight: 400,
  direction: "ltr",
  textAlign: "left",
  whiteSpace: "pre-line",
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

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const SupportPopup: React.FC<SupportPopupProps> = ({
  isOpen,
  onClose,
  onOpenGuide,
  onOpenTicket,
  onContactUs,
}) => {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    startY: number;
    startThumbTop: number;
  } | null>(null);

  const [isDraggingScrollbar, setIsDraggingScrollbar] = useState(false);

  const [scrollbarState, setScrollbarState] = useState({
    isScrollable: false,
    thumbHeight: 0,
    thumbTop: 0,
    canScrollUp: false,
    canScrollDown: false,
  });

  const updateScrollbar = useCallback(() => {
    const element = scrollAreaRef.current;

    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const isScrollable = scrollHeight > clientHeight + 1;

    if (!isScrollable) {
      setScrollbarState({
        isScrollable: false,
        thumbHeight: clientHeight,
        thumbTop: 0,
        canScrollUp: false,
        canScrollDown: false,
      });
      return;
    }

    const minThumbHeight = 48;
    const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, minThumbHeight);
    const maxThumbTop = clientHeight - thumbHeight;
    const maxScrollTop = scrollHeight - clientHeight;
    const thumbTop = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

    setScrollbarState({
      isScrollable: true,
      thumbHeight,
      thumbTop,
      canScrollUp: scrollTop > 1,
      canScrollDown: scrollTop + clientHeight < scrollHeight - 1,
    });
  }, []);

  const scrollToThumbTop = useCallback(
    (thumbTop: number) => {
      const element = scrollAreaRef.current;

      if (!element) return;

      const { scrollHeight, clientHeight } = element;
      const maxScrollTop = scrollHeight - clientHeight;
      const maxThumbTop = clientHeight - scrollbarState.thumbHeight;

      if (maxScrollTop <= 0 || maxThumbTop <= 0) return;

      element.scrollTop = (thumbTop / maxThumbTop) * maxScrollTop;
      updateScrollbar();
    },
    [scrollbarState.thumbHeight, updateScrollbar],
  );

  const handleScrollbarThumbPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!scrollbarState.isScrollable) return;

      event.preventDefault();
      event.stopPropagation();

      dragStateRef.current = {
        startY: event.clientY,
        startThumbTop: scrollbarState.thumbTop,
      };

      setIsDraggingScrollbar(true);
    },
    [scrollbarState.isScrollable, scrollbarState.thumbTop],
  );

  const handleScrollbarTrackPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!scrollbarState.isScrollable) return;

      const element = scrollAreaRef.current;

      if (!element) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const clickY = event.clientY - rect.top;
      const maxThumbTop = element.clientHeight - scrollbarState.thumbHeight;
      const nextThumbTop = clamp(clickY - scrollbarState.thumbHeight / 2, 0, maxThumbTop);

      scrollToThumbTop(nextThumbTop);
    },
    [scrollbarState.isScrollable, scrollbarState.thumbHeight, scrollToThumbTop],
  );

  useEffect(() => {
    if (!isOpen) return;

    setOpenIndexes(new Set());

    const animationFrameId = window.requestAnimationFrame(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = 0;
      }

      updateScrollbar();
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, updateScrollbar]);

  useEffect(() => {
    if (!isOpen) return;

    const animationFrameId = window.requestAnimationFrame(updateScrollbar);
    const element = scrollAreaRef.current;
    const resizeObserver = new ResizeObserver(updateScrollbar);

    if (element) {
      resizeObserver.observe(element);

      if (element.firstElementChild) {
        resizeObserver.observe(element.firstElementChild);
      }
    }

    window.addEventListener("resize", updateScrollbar);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollbar);
    };
  }, [isOpen, openIndexes, updateScrollbar]);

  useEffect(() => {
    if (!isDraggingScrollbar) return;

    const previousUserSelect = document.body.style.userSelect;

    document.body.style.userSelect = "none";

    const handlePointerMove = (event: PointerEvent) => {
      const element = scrollAreaRef.current;
      const dragState = dragStateRef.current;

      if (!element || !dragState) return;

      const maxThumbTop = element.clientHeight - scrollbarState.thumbHeight;

      if (maxThumbTop <= 0) return;

      const nextThumbTop = clamp(
        dragState.startThumbTop + event.clientY - dragState.startY,
        0,
        maxThumbTop,
      );

      scrollToThumbTop(nextThumbTop);
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
      setIsDraggingScrollbar(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDraggingScrollbar, scrollbarState.thumbHeight, scrollToThumbTop]);

  const handleToggleQuestion = (index: number) => {
    setOpenIndexes((current) => {
      const next = new Set(current);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
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
        <ScrollShell>
          <ScrollArea id="support-popup-scroll-area" ref={scrollAreaRef} onScroll={updateScrollbar}>
            <QuestionsCard>
              {questions.map((item, index) => {
                const isOpenQuestion = openIndexes.has(index);

                return (
                  <QuestionItemWrapper key={item.question}>
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
                  </QuestionItemWrapper>
                );
              })}
            </QuestionsCard>
          </ScrollArea>

          <ScrollShadow $position="top" $isVisible={scrollbarState.canScrollUp} />
          <ScrollShadow $position="bottom" $isVisible={scrollbarState.canScrollDown} />

          <VisibleScrollbar onPointerDown={handleScrollbarTrackPointerDown}>
            <VisibleScrollbarThumb
              onPointerDown={handleScrollbarThumbPointerDown}
              sx={{
                height: scrollbarState.isScrollable ? `${scrollbarState.thumbHeight}px` : "100%",
                transform: `translateY(${scrollbarState.thumbTop}px)`,
                opacity: scrollbarState.isScrollable ? 1 : 0.35,
                cursor: isDraggingScrollbar ? "grabbing" : "grab",
              }}
            />
          </VisibleScrollbar>
        </ScrollShell>
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
