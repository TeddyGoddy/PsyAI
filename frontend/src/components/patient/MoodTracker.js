import React, { useState } from 'react';
import styled from 'styled-components';

const TrackerContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.md};
`;

const Title = styled.h3`
  color: ${props => props.theme.colors.patient.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ScaleContainer = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ScaleLabel = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text.primary};
`;

const ScaleInput = styled.input`
  width: 100%;
  margin: ${props => props.theme.spacing.sm} 0;
`;

const ScaleValue = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.patient.primary};
`;

const Button = styled.button`
  background: ${props => props.theme.colors.patient.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  
  &:hover {
    background: ${props => props.theme.colors.patient.secondary};
  }
`;

const MoodTracker = () => {
  const [mood, setMood] = useState(5);
  const [anxiety, setAnxiety] = useState(5);
  const [energy, setEnergy] = useState(5);

  const handleSave = () => {
    const data = { mood, anxiety, energy, date: new Date().toISOString() };
    console.log('Saving mood data:', data);
    alert('Stato emotivo salvato!');
  };

  return (
    <TrackerContainer>
      <Title>Traccia il Tuo Stato Emotivo</Title>
      
      <ScaleContainer>
        <ScaleLabel>
          Umore: <ScaleValue>{mood}/10</ScaleValue>
        </ScaleLabel>
        <ScaleInput
          type="range"
          min="1"
          max="10"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b' }}>
          <span>Molto basso</span>
          <span>Ottimo</span>
        </div>
      </ScaleContainer>

      <ScaleContainer>
        <ScaleLabel>
          Ansia: <ScaleValue>{anxiety}/10</ScaleValue>
        </ScaleLabel>
        <ScaleInput
          type="range"
          min="1"
          max="10"
          value={anxiety}
          onChange={(e) => setAnxiety(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b' }}>
          <span>Molto calmo</span>
          <span>Molto ansioso</span>
        </div>
      </ScaleContainer>

      <ScaleContainer>
        <ScaleLabel>
          Energia: <ScaleValue>{energy}/10</ScaleValue>
        </ScaleLabel>
        <ScaleInput
          type="range"
          min="1"
          max="10"
          value={energy}
          onChange={(e) => setEnergy(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b' }}>
          <span>Esausto</span>
          <span>Pieno di energia</span>
        </div>
      </ScaleContainer>

      <Button onClick={handleSave}>
        Salva Stato Emotivo
      </Button>
    </TrackerContainer>
  );
};

export default MoodTracker;
