import React from "react";
import styled from "styled-components";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { CloudUpload, Download, MousePointerClick, Table2 } from "lucide-react";

const Wrapper = styled("div")`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: right;
  color: #020617;
`;

const StepCard = styled("div")`
  width: 100%;
  min-height: 82px;
  box-sizing: border-box;
  padding: 18px 22px;
  border-radius: 8px;
  background-color: #ffffff;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  direction: rtl;
`;

const StepIcon = styled("div")`
  width: 34px;
  height: 26px;
  min-width: 34px;
  color: #020617;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0;

  svg {
    width: 28px;
    height: 28px;
  }
`;

const StepText = styled("div")`
  min-width: 0;
  flex: 1;
`;

const StepTitle = styled("div")`
  margin-bottom: 6px;
  color: #020617;
  font-size: 18px;
  line-height: 26px;
  font-weight: 700;
`;

const StepDescription = styled("div")`
  color: #62748e;
  font-size: 16px;
  line-height: 25px;
  font-weight: 400;
`;

const DownloadIconButton = styled("button")`
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 6px;
  border: 1px solid #d8e2ef;
  background-color: #ffffff;
  color: #020617;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-inline-start: auto;
  align-self: center;
  cursor: pointer;
  transition:
    border-color 140ms ease,
    box-shadow 140ms ease,
    background-color 140ms ease,
    transform 140ms ease;

  svg {
    font-size: 28px;
  }

  &:hover:not(:disabled) {
    border-color: #cbd5e1;
    background-color: #ffffff;
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.1);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const InfoNote = styled("div")`
  width: 100%;
  box-sizing: border-box;
  padding: 18px 0 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  direction: rtl;
  color: #62748e;
  font-size: 16px;
  line-height: 25px;
  font-weight: 400;
  text-align: right;

  svg {
    font-size: 22px;
    color: #62748e;
    flex-shrink: 0;
  }
`;

const ErrorBox = styled("div")`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 4px;
  padding: 13px 15px;
  border: 1px solid rgba(239, 68, 68, 0.26);
  border-radius: 12px;
  background-color: #fffafa;
  color: #dc2626;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 500;

  svg {
    margin-top: 1px;
    font-size: 21px;
    flex-shrink: 0;
  }
`;

interface ExcelImportContentProps {
  showErrorFileTooBig?: boolean;
  onDownloadTemplate?: () => void;
  isDownloadTemplateDisabled?: boolean;
}

const ExcelImportContent: React.FC<ExcelImportContentProps> = ({
  showErrorFileTooBig,
  onDownloadTemplate,
  isDownloadTemplateDisabled,
}) => {
  return (
    <Wrapper>
      <StepCard>
        <StepIcon>
          <Table2 />
        </StepIcon>

        <StepText>
          <StepTitle>הורדת תבנית Excel</StepTitle>
          <StepDescription>
            לפני ייבוא הנתונים, יש להוריד תבנית Excel. התבנית תהיה מותאמת לטופס.
          </StepDescription>
        </StepText>

        <DownloadIconButton
          type="button"
          aria-label="הורדת תבנית Excel"
          onClick={onDownloadTemplate}
          disabled={isDownloadTemplateDisabled}>
          <Download />
        </DownloadIconButton>
      </StepCard>

      <StepCard>
        <StepIcon>
          <MousePointerClick />
        </StepIcon>

        <StepText>
          <StepTitle>הזנת נתונים</StepTitle>
          <StepDescription>
            בטבלה ניתן להזין את המידע בהתאם לשדות החובה, להגבלות, לתנאים ולאפשרויות שהוגדרו בטופס.
          </StepDescription>
        </StepText>
      </StepCard>

      <StepCard>
        <StepIcon>
          <CloudUpload />
        </StepIcon>

        <StepText>
          <StepTitle>ייבוא</StepTitle>
          <StepDescription>אחרי הזנת הנתונים בטבלה, ניתן להעלות את הקובץ בבטחה.</StepDescription>
        </StepText>
      </StepCard>

      <InfoNote>
        <InfoOutlinedIcon />
        <span>לאחר הייבוא יתווספו תגובות חדשות בלבד. תגובות קיימות זהות לא יידרסו.</span>
      </InfoNote>

      {showErrorFileTooBig && (
        <ErrorBox>
          <ErrorOutlineOutlinedIcon />
          <span>הקובץ שנבחר גדול מדי. מגבלת הגודל של הקובץ היא 1MB.</span>
        </ErrorBox>
      )}
    </Wrapper>
  );
};

export default ExcelImportContent;
