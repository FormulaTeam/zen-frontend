import styled from "styled-components";

export const PopupContentWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  color: #0f172a;
`;

export const StatusWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: right;
`;

export const StatusHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  background-color: #fffafa;
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.26);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.035);
`;

export const StatusIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background-color: rgba(239, 68, 68, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  flex-shrink: 0;
  margin-top: 1px;

  svg {
    font-size: 21px;
  }
`;

export const StatusTitle = styled.h3`
  margin: 0;
  font-size: 15.8px;
  line-height: 1.45;
  font-weight: 650;
  color: #dc2626;
  text-align: right;
`;

export const StatusDescription = styled.p`
  margin: 4px 0 0;
  font-size: 14.8px;
  line-height: 1.5;
  font-weight: 400;
  color: #dc2626;
  opacity: 0.82;
  text-align: right;
`;

export const ErrorSummary = styled.div`
  padding: 12px 14px;
  border-radius: 12px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 400;
  text-align: right;
`;

export const ErrorGroupsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ErrorGroup = styled.div`
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.025);
`;

export const ErrorGroupButton = styled.button`
  width: 100%;
  padding: 14px 16px;
  border: 0;
  background-color: #ffffff;
  cursor: pointer;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  text-align: right;
  font: inherit;
  color: inherit;

  &:hover {
    background-color: #f8fafc;
  }
`;

export const Chevron = styled.span<{ $isOpen: boolean }>`
  width: 24px;
  height: 24px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  line-height: 1;
  transition: transform 160ms ease;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(90deg)" : "rotate(0deg)")};
`;

export const ErrorGroupTitle = styled.div`
  min-width: 0;
`;

export const ErrorGroupMainText = styled.span`
  display: block;
  max-width: 100%;
  font-size: 15.8px;
  line-height: 1.45;
  font-weight: 650;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ErrorGroupSubText = styled.span`
  display: block;
  margin-top: 3px;
  font-size: 13.8px;
  line-height: 1.4;
  font-weight: 400;
  color: #64748b;
`;

export const ErrorGroupCount = styled.div`
  min-width: 28px;
  height: 26px;
  padding-inline: 9px;
  border-radius: 999px;
  background-color: rgba(220, 38, 38, 0.08);
  color: #dc2626;
  font-size: 13.5px;
  line-height: 1;
  font-weight: 650;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ErrorDetailsWrapper = styled.div`
  padding: 0 14px 14px;
  border-top: 1px solid #eef2f7;
  background-color: #ffffff;
`;

export const ErrorDetailRow = styled.div`
  padding: 13px 0;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  text-align: right;

  &:first-child {
    border-top: 0;
  }
`;

export const ErrorMessageBlock = styled.div`
  min-width: 0;
  flex: 1;
`;

export const ErrorMessageText = styled.div`
  color: #dc2626;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 500;
  word-break: break-word;
`;

export const ErrorMessageDetail = styled.div`
  margin-top: 4px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 400;
  word-break: break-word;
`;

export const RowNumbersText = styled.div`
  min-width: 104px;
  max-width: 165px;
  padding: 8px 11px;
  border-radius: 10px;
  background-color: #f8fafc;
  color: #334155;
  font-size: 14px;
  line-height: 1.45;
  font-weight: 400;
  word-break: break-word;

  span {
    display: block;
    margin-bottom: 3px;
    color: #64748b;
    font-size: 12.8px;
    font-weight: 400;
  }

  strong {
    display: block;
    color: #0f172a;
    font-size: 14px;
    font-weight: 600;
  }
`;

export const EmptyValue = styled.span`
  color: #94a3b8;
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
