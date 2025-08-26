import React, { useState } from 'react';
import styled from 'styled-components';

const PanelContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.md};
`;

const Title = styled.h3`
  color: ${props => props.theme.colors.psychologist.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.theme.colors.text.light};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
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

const AnalysisPanel = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append('document', selectedFile);
        formData.append('analysisType', 'general');
        
        const response = await fetch('/api/v1/analysis/upload-document', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: formData
        });
        
        const result = await response.json();
        if (result.success) {
          alert(`Analisi completata! Trovati ${result.analysis.analysis.emotions.length} temi emotivi`);
        } else {
          alert('Errore durante l\'analisi');
        }
      } catch (error) {
        console.error('Errore:', error);
        alert('Errore di connessione');
      }
    }
  };

  return (
    <PanelContainer>
      <Title>Analisi Documenti</Title>
      <UploadArea>
        <input
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.txt,.jpg,.png"
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <p>📄 Trascina un file qui o clicca per selezionare</p>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            PDF, DOC, TXT, JPG, PNG supportati
          </p>
        </label>
      </UploadArea>
      {selectedFile && (
        <div style={{ marginTop: '1rem' }}>
          <p>File selezionato: {selectedFile.name}</p>
          <Button onClick={handleAnalyze} style={{ marginTop: '0.5rem' }}>
            Analizza Documento
          </Button>
        </div>
      )}
    </PanelContainer>
  );
};

export default AnalysisPanel;
