import React from "react";
import { ErrorBox, LineLabel, NumberedLine, NumberLabel, Paragraph, Wrapper } from "./styled";

interface ExcelImportContentProps {
  showErrorFileTooBig?: boolean;
}

const ExcelImportContent: React.FC<ExcelImportContentProps> = ({ showErrorFileTooBig }) => {
  return (
    <Wrapper>
      <Paragraph>
        למערכת ZEN יש אפשרות לייבא נתונים מתבנית אקסל של הטופס.
        <br />
        הורידו את קובץ תבנית הטופס ומלאו את העמודים בהתאם לעמודות. לאחר מכן, ייבאו את הקובץ עם
        הנתונים שמילאתם כדי ליצור תגובות חדשות.
        <br />
        <br />
        <NumberedLine>
          <NumberLabel>1.</NumberLabel>
          <LineLabel>
            הקפידו על מילוי התבנית בהתאם להגדרות הטופס - שדות חובה, הגבלות ותנאים, אפשרויות שהוגדרו
            וכדומה.
          </LineLabel>
        </NumberedLine>
        <NumberedLine>
          <NumberLabel>2.</NumberLabel>
          <LineLabel>
            יודגש, המערכת יוצרת תגובות חדשות בהתאם לתוכן התבנית ואיננה "דורסת" תגובות קיימות עם אותו
            התוכן.
          </LineLabel>
        </NumberedLine>
        <NumberedLine>
          <NumberLabel>3.</NumberLabel>
          <LineLabel>שימו לב! שהתגובות לא מסונכרנות אוטומטית למטרו ונדרש לסנכרן.</LineLabel>
        </NumberedLine>
        {showErrorFileTooBig && (
          <ErrorBox>הקובץ שנבחר גדול מדי! מגבלת הגודל של הקובץ היא 1MB</ErrorBox>
        )}
      </Paragraph>
    </Wrapper>
  );
};

export default ExcelImportContent;
