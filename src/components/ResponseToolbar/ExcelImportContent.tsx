import React from "react";
import styled from "styled-components";

const Wrapper = styled("div")`
  text-align: right;
  color: #000000;
`;

const Paragraph = styled("div")`
  margin-bottom: 16px;
  font-size: 16px;
  line-height: 1.5;
`;

const NumberedLine = styled("div")`
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-top: 8px;
`;

const NumberLabel = styled("label")`
  font-weight: bold;
`;

const LineLabel = styled("label")`
  flex: 1;
`;

const ErrorBox = styled("div")`
  color: red;
  margin-top: 16px;
  padding: 8px;
  border: 1px solid red;
  border-radius: 4px;
`;

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
