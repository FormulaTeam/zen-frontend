export type QuestionItem = {
  question: string;
  answer: string;
};

export interface SupportPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide?: () => void;
  onOpenTicket?: () => void;
  onContactUs?: () => void;
}

export type ScrollbarState = {
  isScrollable: boolean;
  thumbHeight: number;
  thumbTop: number;
  canScrollUp: boolean;
  canScrollDown: boolean;
};
