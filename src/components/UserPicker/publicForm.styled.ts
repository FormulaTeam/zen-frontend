import styled from "styled-components";

export const Wrapper = styled.div<{ $isPublic?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background-color: ${({ $isPublic }) => ($isPublic ? "#f8fafc" : "transparent")};
  border: 1px solid ${({ $isPublic }) => ($isPublic ? "#e2e8f0" : "transparent")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const LabelWrapper = styled.div<{ disabled?: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  color: ${({ disabled, $color }) => (disabled ? "#aaa" : $color)};
  user-select: none;
  flex: 1;
`;

export const LabelText = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
`;

export const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const PermissionsWrapper = styled.div`
  padding: 0;
  margin-top: 8px;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const PermissionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
`;

export const PermissionsText = styled.span<{ $color: string }>`
  font-size: 0.85rem;
  color: ${({ $color }) => $color};
  font-weight: 600;
`;

export const NoteText = styled.div<{ $color: string }>`
  font-size: 0.75rem;
  color: ${({ $color }) => $color};
  margin-top: 12px;
  line-height: 1.5;
  text-align: right;
  font-style: italic;
`;
