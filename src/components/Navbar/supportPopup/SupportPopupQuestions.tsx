import type { QuestionItem } from "./SupportPopup.types";
import {
  AnswerBox,
  AnswerText,
  ChevronIcon,
  QuestionItemWrapper,
  QuestionRow,
  QuestionsCard,
  QuestionTitle,
} from "./SupportPopup.styles";

interface SupportPopupQuestionsProps {
  questions: QuestionItem[];
  openIndexes: Set<number>;
  onToggleQuestion: (index: number) => void;
}

const SupportPopupQuestions = ({
  questions,
  openIndexes,
  onToggleQuestion,
}: SupportPopupQuestionsProps) => {
  return (
    <QuestionsCard>
      {questions.map((item, index) => {
        const isOpenQuestion = openIndexes.has(index);

        return (
          <QuestionItemWrapper key={item.question}>
            <QuestionRow
              type="button"
              $isOpen={isOpenQuestion}
              onClick={() => onToggleQuestion(index)}>
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
  );
};

export default SupportPopupQuestions;
