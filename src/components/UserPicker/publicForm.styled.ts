import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const LabelWrapper = styled.label<{ disabled?: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  color: ${({ disabled, $color }) => (disabled ? "#aaa" : $color)};
`;

export const LabelText = styled.span`
  font-size: 14px;
  white-space: nowrap;
`;

export const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PermissionsWrapper = styled.div`
  padding-right: 24px;
`;

export const PermissionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
`;

export const PermissionsText = styled.span<{ $color: string }>`
  font-size: 13px;
  color: ${({ $color }) => $color};
  white-space: nowrap;
`;

export const NoteText = styled.div<{ $color: string }>`
  font-size: 12px;
  color: ${({ $color }) => $color};
  margin-top: 8px;
  text-align: right;
`;
