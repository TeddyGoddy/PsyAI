import React, { useState } from 'react';
import styled from 'styled-components';

const GeneratorContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.md};
`;

const Title = styled.h3`
  color: ${props => props.theme.colors.psychologist.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.text.light};
  border-radius: ${props => props.theme.borderRadius.md};
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const Button = styled.button`
  background: ${props => props.theme.colors.psychologist.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background: ${props => props.theme.colors.psychologist.secondary};
  }
`;

const ReportGenerator = () => {
  const [reportType, setReportType] = useState('executive');
  const [timeRange, setTimeRange] = useState('30d');

  const handleGenerate = () => {
    alert(`Generazione report ${reportType} per ${timeRange} - Implementazione in corso`);
  };

  return (
    <GeneratorContainer>
      <Title>Genera Report</Title>
      <Form>
        <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="executive">Report Esecutivo</option>
          <option value="detailed">Analisi Dettagliata</option>
          <option value="progress">Report Progressi</option>
        </Select>
        <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="7d">Ultimi 7 giorni</option>
          <option value="30d">Ultimi 30 giorni</option>
          <option value="90d">Ultimi 3 mesi</option>
        </Select>
        <Button onClick={handleGenerate}>
          Genera Report
        </Button>
      </Form>
    </GeneratorContainer>
  );
};

export default ReportGenerator;
