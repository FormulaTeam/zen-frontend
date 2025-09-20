import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import styled from "styled-components";
import SectionTitle from "./SectionTitle";
import Loader from "react-loading";

const StyledValueCard = styled(Card)`
  flex: 1 1 calc(10% - 24px);
  min-width: 200px;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
`;

interface CardProps {
  title: string;
  value: number | undefined | null;
  tooltip: string;
}

interface ValueCardProps {
  card: CardProps;
}

const ValueCard: React.FC<ValueCardProps> = ({ card }) => (
  <StyledValueCard>
    <CardContent>
      <SectionTitle tooltip={card.tooltip}>{card.title}</SectionTitle>
      {card.value !== undefined && card.value !== null ? (
        <Typography variant="h4" color="primary">
          {card.value.toLocaleString()}
        </Typography>
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60px" // adjust based on your card size
        >
          <Loader type="spinningBubbles" color="#1976d2" height={40} width={40} />
        </Box>
      )}
    </CardContent>
  </StyledValueCard>
);

export default ValueCard;
