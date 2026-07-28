import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import type { SupportPopupProps } from "./SupportPopup.types";
import { supportPopupQuestions } from "./SupportPopup.questions";
import SupportPopupQuestions from "./SupportPopupQuestions";
import SupportPopupFooter from "./SupportPopupFooter";
import { useSupportPopupScrollbar } from "./useSupportPopupScrollbar";
import {
  CloseButton,
  Content,
  ScrollArea,
  ScrollShadow,
  ScrollShell,
  StyledDialog,
  StyledDialogTitle,
  SubtitleText,
  TitleText,
  VisibleScrollbar,
  VisibleScrollbarThumb,
} from "./SupportPopup.styles";

const SupportPopup: React.FC<SupportPopupProps> = ({
  isOpen,
  onClose,
  onOpenGuide,
  onOpenTicket,
  onContactUs,
}) => {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  const {
    scrollAreaRef,
    scrollbarState,
    updateScrollbar,
    handleScrollbarThumbPointerDown,
    handleScrollbarTrackPointerDown,
  } = useSupportPopupScrollbar({
    isOpen,
    refreshKey: openIndexes,
  });

  useEffect(() => {
    if (!isOpen) return;

    setOpenIndexes(new Set());
  }, [isOpen]);

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
            <SupportPopupQuestions
              questions={supportPopupQuestions}
              openIndexes={openIndexes}
              onToggleQuestion={handleToggleQuestion}
            />
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
                cursor: "default",
              }}
            />
          </VisibleScrollbar>
        </ScrollShell>
      </Content>

      <SupportPopupFooter
        onContactUs={onContactUs}
        onOpenTicket={onOpenTicket}
        onOpenGuide={onOpenGuide}
      />
    </StyledDialog>
  );
};

export default SupportPopup;
