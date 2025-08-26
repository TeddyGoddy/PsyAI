import React, { useState } from 'react';
import styled from 'styled-components';

const SessionContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.md};
`;

const Title = styled.h3`
  color: ${props => props.theme.colors.patient.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Question = styled.div`
  background: ${props => props.theme.colors.patient.primary};
  color: white;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.text.light};
  border-radius: ${props => props.theme.borderRadius.md};
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    border-color: ${props => props.theme.colors.patient.primary};
    outline: none;
  }
`;

const Button = styled.button`
  background: ${props => props.theme.colors.patient.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  font-weight: 600;
  margin-top: ${props => props.theme.spacing.md};
  
  &:hover {
    background: ${props => props.theme.colors.patient.secondary};
  }
`;

const JournalingSession = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState(['']);
  const [currentEntry, setCurrentEntry] = useState('');
  const [questions, setQuestions] = useState([
    "Come ti senti oggi? Descrivi il tuo stato emotivo attuale.",
    "Cosa ha influenzato maggiormente il tuo umore oggi?",
    "Quali pensieri ricorrenti hai avuto nelle ultime ore?",
    "Come hai gestito eventuali situazioni stressanti oggi?"
  ]);

  const handleResponseChange = (value) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);
    setCurrentEntry(value);
  };

  const handleSubmit = async () => {
    if (currentEntry.trim()) {
      try {
        const response = await fetch('/api/v1/ai/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            previousAnswer: currentEntry,
            sessionType: 'journaling',
            context: 'patient_reflection'
          })
        });
        
        const result = await response.json();
        if (result.success) {
          // Add new question to the questions array dynamically
          const newQuestions = [...questions, result.nextQuestion];
          setQuestions(newQuestions);
          setCurrentQuestion(currentQuestion + 1);
          setCurrentEntry('');
          alert('Risposta salvata! Ecco la prossima domanda...');
        } else {
          alert('Risposta salvata!');
          setCurrentEntry('');
        }
      } catch (error) {
        console.error('Errore:', error);
        alert('Risposta salvata!');
        setCurrentEntry('');
      }
    }
  };

  const handleNext = () => {
    handleSubmit();
    if (currentQuestion < questions.length - 1) {
      if (!responses[currentQuestion + 1]) {
        setResponses([...responses, '']);
      }
    } else {
      alert('Sessione completata! Analisi in corso...');
    }
  };

  return (
    <SessionContainer>
      <Title>Sessione di Journaling Guidato</Title>
      <Question>
        <strong>Domanda {currentQuestion + 1} di {questions.length}:</strong>
        <br />
        {questions[currentQuestion]}
      </Question>
      <TextArea
        value={responses[currentQuestion] || ''}
        onChange={(e) => handleResponseChange(e.target.value)}
        placeholder="Scrivi qui la tua risposta..."
      />
      <Button onClick={handleNext}>
        {currentQuestion < questions.length - 1 ? 'Prossima Domanda' : 'Completa Sessione'}
      </Button>
    </SessionContainer>
  );
};

export default JournalingSession;
