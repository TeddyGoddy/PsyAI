import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HomeContainer = styled.div`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
`;

const Hero = styled.div`
  max-width: 800px;
  margin-bottom: ${props => props.theme.spacing.xxl};
`;

const Title = styled.h1`
  font-size: 3rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled(Link)`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.lg};
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &.primary {
    background: ${props => props.theme.colors.primary};
    color: white;
    
    &:hover {
      background: ${props => props.theme.colors.medical.secondary};
    }
  }
  
  &.secondary {
    background: ${props => props.theme.colors.accent};
    color: ${props => props.theme.colors.text.primary};
    
    &:hover {
      background: ${props => props.theme.colors.success};
      color: white;
    }
  }
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  max-width: 1000px;
  margin-top: ${props => props.theme.spacing.xxl};
`;

const FeatureCard = styled.div`
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
`;

const Home = () => {
  return (
    <HomeContainer>
      <Hero>
        <Title>PsyAI</Title>
        <Subtitle>
          Intelligenza artificiale per il supporto psicologico. 
          Strumenti avanzati per psicologi e auto-riflessione guidata per pazienti.
        </Subtitle>
        <ButtonGroup>
          <Button to="/login" className="primary">
            Accesso Psicologo
          </Button>
          <Button to="/login" className="secondary">
            Accesso Paziente
          </Button>
        </ButtonGroup>
      </Hero>
      
      <Features>
        <FeatureCard>
          <h3>Visualizzazioni Avanzate</h3>
          <p>Grafici interattivi Random Forest per esplorare pattern psicologici complessi</p>
        </FeatureCard>
        <FeatureCard>
          <h3>AI Gemini 2.5</h3>
          <p>Analisi intelligente di testi, documenti e generazione di insights personalizzati</p>
        </FeatureCard>
        <FeatureCard>
          <h3>Timeline Emotiva</h3>
          <p>Tracking dell'evoluzione emotiva nel tempo con correlazioni eventi-stati</p>
        </FeatureCard>
      </Features>
    </HomeContainer>
  );
};

export default Home;
