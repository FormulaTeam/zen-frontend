import React, { useEffect } from "react";
import ValueCard from "../../components/Dashboard/ValueCard";
import { CardsRow, Container } from "./styled";
import ChartsContainer from "../../components/Dashboard/ChartsContainer";
import { Tooltip, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { CustomIcon } from "../../theme/icons";
import styled from "styled-components";
import { useDashboardStatisticsContext } from "../../contexts/DashboardStatisticsContext";

export const Header = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Dashboard: React.FC = () => {
  const { summaryCards, refreshStats } = useDashboardStatisticsContext();
  const navigate = useNavigate();

  useEffect(() => {
    refreshStats();
  }, []);

  return (
    <Container>
      <Header>
        <Typography variant="h4" gutterBottom>
          לוח בקרה
        </Typography>
        <Tooltip title="חזרה">
          <Button onClick={() => navigate("/")} variant="customIcon">
            <CustomIcon iconName="arrowBack" forcePointer />
          </Button>
        </Tooltip>
      </Header>
      <CardsRow>
        {summaryCards.map((card, idx) => (
          <ValueCard key={idx} card={card} />
        ))}
      </CardsRow>
      <ChartsContainer />
    </Container>
  );
};

export default Dashboard;
