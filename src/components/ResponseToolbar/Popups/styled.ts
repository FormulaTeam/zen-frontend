import styled from "styled-components";

export const PopupContentWrapper = styled.div`
  min-height: 350px;
  height: 350px;
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  overflow: hidden;
`;

export const StatusWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: center;
`;

export const StatusHeader = styled.div`
  margin-bottom: 14px;
`;

export const StatusTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 19px;
  font-weight: 700;
  color: #202124;
  text-align: center;
`;

export const StatusDescription = styled.p`
  margin: 0 auto;
  max-width: 580px;
  font-size: 15px;
  line-height: 1.6;
  color: #5f6368;
  text-align: center;
`;

export const ErrorSummary = styled.div`
  margin: 0 auto 14px;
  width: fit-content;
  max-width: 100%;
  padding: 11px 16px;
  border-radius: 10px;
  background: #fff4f4;
  border: 1px solid #ffd6d6;
  color: #9f1c1c;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
`;

export const ErrorGroupsWrapper = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-left: 4px;
`;

export const ErrorGroup = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
  background: #ffffff;
`;

export const ErrorGroupButton = styled.button`
  width: 100%;
  border: none;
  background: #f8f9fa;
  padding: 13px 14px;
  display: grid;
  grid-template-columns: 28px 1fr 28px;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font: inherit;
  text-align: center;

  &:hover {
    background: #f1f3f4;
  }
`;

export const ErrorGroupTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-width: 0;
`;

export const ErrorGroupMainText = styled.span`
  max-width: 100%;
  font-size: 16px;
  font-weight: 700;
  color: #202124;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ErrorGroupSubText = styled.span`
  font-size: 13px;
  color: #5f6368;
`;

export const Chevron = styled.span<{ $isOpen: boolean }>`
  font-size: 18px;
  color: #5f6368;
  transform: rotate(${({ $isOpen }) => ($isOpen ? "90deg" : "0deg")});
  transition: transform 0.15s ease;
`;

export const ErrorDetailsWrapper = styled.div`
  padding: 12px 16px 14px;
  border-top: 1px solid #eeeeee;
`;

export const ErrorDetailsHeader = styled.div`
  width: min(100%, 640px);
  margin: 0 auto 8px;
  display: grid;
  grid-template-columns: minmax(280px, 1fr) 220px;
  column-gap: 32px;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #3c4043;
  font-size: 15px;
  font-weight: 700;
`;

export const ErrorDetailRow = styled.div`
  width: min(100%, 640px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(280px, 1fr) 220px;
  column-gap: 32px;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 10px 0;
  border-top: 1px solid #f1f3f4;
`;

export const ErrorMessageBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
  justify-content: center;
`;

export const ErrorMessageText = styled.div`
  font-size: 15px;
  line-height: 1.5;
  color: #202124;
  font-weight: 700;
  word-break: break-word;
`;

export const ErrorMessageDetail = styled.div`
  max-width: 100%;
  font-size: 13px;
  line-height: 1.45;
  color: #6b7280;
  font-weight: 400;
  word-break: break-word;
`;

export const RowNumbersText = styled.div`
  font-size: 15px;
  line-height: 1.5;
  color: #5f6368;
  font-weight: 700;
  word-break: break-word;
`;

export const EmptyValue = styled.span`
  color: #9aa0a6;
`;

export const GifsWrapper = styled.div`
  width: 400px;
  height: 250px;
  position: relative;
`;

export const SyncGif = styled.img`
  width: 250px;
  position: absolute;
  top: 0;
  left: 80px;
  z-index: 10000;
`;

export const MGif = styled.img`
  width: 100px;
  position: absolute;
  top: 80px;
  left: 155px;
  z-index: 10001;
`;
