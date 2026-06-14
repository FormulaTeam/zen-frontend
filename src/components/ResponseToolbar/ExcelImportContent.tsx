import React from "react";
import styled from "styled-components";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

const Wrapper = styled("div")`
  text-align: right;
  color: #0f172a;
`;

const HeroCard = styled("div")`
  position: relative;
  overflow: hidden;
  margin-bottom: 16px;
  padding: 20px 22px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background:
    radial-gradient(circle at top left, rgba(30, 136, 229, 0.12), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.045);
`;

const HeroContent = styled("div")`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const HeroIconWrapper = styled("div")`
  width: 54px;
  height: 54px;
  min-width: 54px;
  border-radius: 16px;
  background-color: rgba(30, 136, 229, 0.1);
  color: #1e88e5;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(30, 136, 229, 0.12);

  svg {
    font-size: 31px;
  }
`;

const HeroText = styled("div")`
  min-width: 0;
`;

const HeroTitle = styled("div")`
  margin-bottom: 7px;
  font-size: 17.5px;
  line-height: 1.45;
  font-weight: 700;
  color: #0f172a;
`;

const HeroDescription = styled("div")`
  max-width: 560px;
  font-size: 15.8px;
  line-height: 1.7;
  font-weight: 400;
  color: #475569;
`;

const MiniFlow = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
`;

const FlowChip = styled("div")`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 13.5px;
  line-height: 1;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.035);

  svg {
    font-size: 17px;
    color: #1e88e5;
  }
`;

const FlowArrow = styled("span")`
  color: #94a3b8;
  font-size: 15px;
  font-weight: 700;
`;

const InfoGrid = styled("div")`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled("div")`
  padding: 15px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background-color: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.025);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(30, 136, 229, 0.36);
    background-color: rgba(30, 136, 229, 0.018);
    box-shadow: 0 12px 26px rgba(30, 136, 229, 0.08);
  }
`;

const InfoHeader = styled("div")`
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 8px;
`;

const InfoIcon = styled("div")`
  width: 30px;
  height: 30px;
  min-width: 30px;
  border-radius: 10px;
  background-color: rgba(30, 136, 229, 0.08);
  color: #1e88e5;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 20px;
  }
`;

const InfoTitle = styled("div")`
  font-size: 15.8px;
  line-height: 1.45;
  font-weight: 650;
  color: #0f172a;
`;

const InfoText = styled("div")`
  font-size: 15.2px;
  line-height: 1.65;
  font-weight: 400;
  color: #475569;
`;

const ErrorBox = styled("div")`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 14px;
  padding: 13px 15px;
  border: 1px solid rgba(239, 68, 68, 0.26);
  border-radius: 12px;
  background-color: #fffafa;
  color: #dc2626;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 500;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.035);

  svg {
    margin-top: 1px;
    font-size: 21px;
    flex-shrink: 0;
  }
`;

interface ExcelImportContentProps {
  showErrorFileTooBig?: boolean;
}

const ExcelImportContent: React.FC<ExcelImportContentProps> = ({ showErrorFileTooBig }) => {
  return (
    <Wrapper>
      <HeroCard>
        <HeroContent>
          <HeroIconWrapper>
            <CloudUploadOutlinedIcon />
          </HeroIconWrapper>

          <HeroText>
            <HeroTitle>ייבוא נתונים מתבנית אקסל</HeroTitle>
            <HeroDescription>
              הורידו תבנית שמותאמת למבנה הטופס, מלאו את הנתונים לפי העמודות, ולאחר מכן ייבאו את
              הקובץ כדי ליצור תגובות חדשות במערכת ZEN.
            </HeroDescription>

            <MiniFlow>
              <FlowChip>
                <DescriptionOutlinedIcon />
                הורדת תבנית
              </FlowChip>
              <FlowArrow>←</FlowArrow>
              <FlowChip>
                <CheckCircleOutlineOutlinedIcon />
                מילוי נתונים
              </FlowChip>
              <FlowArrow>←</FlowArrow>
              <FlowChip>
                <CloudUploadOutlinedIcon />
                ייבוא למערכת
              </FlowChip>
            </MiniFlow>
          </HeroText>
        </HeroContent>
      </HeroCard>

      <InfoGrid>
        <InfoCard>
          <InfoHeader>
            <InfoIcon>
              <CheckCircleOutlineOutlinedIcon />
            </InfoIcon>
            <InfoTitle>התאמה להגדרות הטופס</InfoTitle>
          </InfoHeader>

          <InfoText>
            מלאו את התבנית בהתאם לשדות החובה, ההגבלות, התנאים והאפשרויות שהוגדרו בטופס.
          </InfoText>
        </InfoCard>

        <InfoCard>
          <InfoHeader>
            <InfoIcon>
              <ShieldOutlinedIcon />
            </InfoIcon>
            <InfoTitle>ייבוא בטוח</InfoTitle>
          </InfoHeader>

          <InfoText>
            הייבוא יוצר תגובות חדשות בלבד, ואינו דורס תגובות קיימות עם אותו התוכן.
          </InfoText>
        </InfoCard>
      </InfoGrid>

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
