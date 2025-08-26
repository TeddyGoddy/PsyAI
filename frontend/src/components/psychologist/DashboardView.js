import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiBarChart2, FiActivity, FiTrendingUp, FiUsers } from 'react-icons/fi';

const DashboardContainer = styled.div`
  padding: ${props => props.theme.spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.color || props.theme.colors.primary}15;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.theme.spacing.md};
  
  svg {
    color: ${props => props.color || props.theme.colors.primary};
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DashboardView = () => {
  const [stats, setStats] = useState({
    activePatients: 24,
    todaySessions: 8,
    completedAnalyses: 156,
    avgImprovement: 12
  });

  return (
    <DashboardContainer>
      <Header>
        <Title>Dashboard</Title>
        <Subtitle>Panoramica delle attività cliniche</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon color="#3b82f6">
              <FiUsers size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.activePatients}</StatValue>
          <StatLabel>Pazienti Attivi</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#10b981">
              <FiActivity size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.todaySessions}</StatValue>
          <StatLabel>Sessioni Oggi</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#f59e0b">
              <FiBarChart2 size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.completedAnalyses}</StatValue>
          <StatLabel>Analisi Completate</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#ef4444">
              <FiTrendingUp size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>+{stats.avgImprovement}%</StatValue>
          <StatLabel>Miglioramento Medio</StatLabel>
        </StatCard>
      </StatsGrid>
    </DashboardContainer>
  );
};

export default DashboardView;
