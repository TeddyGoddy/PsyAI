import React from 'react';
import styled from 'styled-components';
import Timeline from '../visualizations/Timeline';
import JournalingSession from '../components/patient/JournalingSession';
import MoodTracker from '../components/patient/MoodTracker';

const DashboardContainer = styled.div`
  padding: ${props => props.theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.patient.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 1.1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.xl};
`;

const PatientDashboard = () => {
  const mockTimelineData = [
    { date: '2024-01-01', mood: 4, anxiety: 7, energy: 3 },
    { date: '2024-01-15', mood: 5, anxiety: 6, energy: 4 },
    { date: '2024-02-01', mood: 6, anxiety: 5, energy: 5 },
    { date: '2024-02-15', mood: 7, anxiety: 4, energy: 6 }
  ];

  return (
    <DashboardContainer>
      <Header>
        <Title>Il Tuo Percorso</Title>
        <Subtitle>Esplora la tua evoluzione emotiva e i tuoi progressi</Subtitle>
      </Header>
      
      <Grid>
        <JournalingSession />
        <MoodTracker />
        <Timeline 
          data={mockTimelineData}
          userType="patient"
        />
      </Grid>
    </DashboardContainer>
  );
};

export default PatientDashboard;
