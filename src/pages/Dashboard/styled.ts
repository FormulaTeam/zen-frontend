import { Card } from "@mui/material";
import styled from "styled-components";

const colGap = "clamp(12px, 1.5vw, 24px)";
const rowGap = "clamp(12px, 2vh, 32px)";

export const Container = styled.div`
  padding: clamp(16px, 3vh, 48px) clamp(16px, 3vw, 48px);
  display: flex;
  flex-direction: column;
  gap: ${rowGap};
`;

export const CardsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${colGap};
`;


export const HalfChartCard = styled(Card)`
  flex: 1 1 calc(33.333% - ${colGap});
  min-width: clamp(260px, 22vw, 380px);
  min-height: clamp(320px, 45vh, 520px);

  @media (max-width: 1440px) {
    flex: 1 1 calc(50% - ${colGap});
  }

  @media (max-width: 1280px) {
    flex: 1 1 100%;
    min-width: 0; /* allow full width */
  }
`;
