import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Upload, AlertCircle, Settings, Archive, Calendar, Eye, FileText } from 'lucide-react';
import EnhancedAnalysisView from '../analysis/EnhancedAnalysisView';
import { usePatient } from '../../context/PatientContext';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const AnalysisContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 8px;
  padding: 0;
  box-shadow: ${props => props.theme.shadows.sm};
  animation: ${fadeIn} 0.6s ease-out;
`;

// Removed inner Header/Title to rely on the main page header

const Content = styled.div`
  padding: 24px;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 2s linear infinite;
  margin: 20px auto;
`;

const LoadingText = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  font-style: italic;
`;

const AnalysisResults = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
`;

const Section = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.psychologist.primary};
  margin-bottom: ${props => props.theme.spacing.md};
  border-bottom: 2px solid ${props => props.theme.colors.psychologist.primary};
  padding-bottom: ${props => props.theme.spacing.sm};
`;

const Summary = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  line-height: 1.6;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProfileCard = styled.div`
  background: white;
  border-left: 4px solid ${props => props.color || props.theme.colors.psychologist.primary};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const CardTitle = styled.h4`
  color: ${props => props.color || props.theme.colors.psychologist.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ItemList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: ${props => props.theme.spacing.xs} 0;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
  
  &:last-child {
    border-bottom: none;
  }
`;

const EmotionBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const EmotionLabel = styled.span`
  min-width: 100px;
  font-weight: 600;
  text-transform: capitalize;
`;

const IntensityBar = styled.div`
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  margin: 0 ${props => props.theme.spacing.sm};
  overflow: hidden;
`;

const IntensityFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #FFC107, #F44336);
  width: ${props => props.intensity * 100}%;
  transition: width 0.3s ease;
`;

const IntensityValue = styled.span`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const TimelineContainer = styled.div`
  position: relative;
  padding-left: ${props => props.theme.spacing.lg};
`;

const TimelineItem = styled.div`
  position: relative;
  padding-bottom: ${props => props.theme.spacing.md};
  
  &::before {
    content: '';
    position: absolute;
    left: -${props => props.theme.spacing.lg};
    top: 0;
    width: 12px;
    height: 12px;
    background: ${props => props.theme.colors.psychologist.primary};
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    left: -${props => props.theme.spacing.md + 2}px;
    top: 12px;
    width: 2px;
    height: calc(100% - 12px);
    background: ${props => props.theme.colors.text.light};
  }
  
  &:last-child::after {
    display: none;
  }
`;

const TimelinePeriod = styled.h5`
  color: ${props => props.theme.colors.psychologist.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
  text-transform: capitalize;
`;

const LanguageSelector = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const EnhancedToggle = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
  label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.theme.colors.border.light};
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.neutral[50]};
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
`;

const Tab = styled.button`
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text.secondary};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
  
  ${props => props.active && `
    border-bottom-color: ${props.theme.colors.primary};
  `}
`;

const ArchiveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

const ArchiveCard = styled.div`
  background: white;
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const ArchiveHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ArchiveType = styled.span`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
`;

const ArchiveDate = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ArchiveSummary = styled.p`
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  line-height: 1.5;
  margin: 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ArchiveTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
`;

const Tag = styled.span`
  background: ${props => props.theme.colors.neutral[100]};
  color: ${props => props.theme.colors.text.secondary};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 12px;
  
  &:hover {
    opacity: 0.9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.text.secondary};
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    opacity: 0.4;
  }
  
  h3 {
    margin: 0 0 8px 0;
    color: ${props => props.theme.colors.text.primary};
  }
`;

const DocumentAnalysis = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('italiano');
  const [useEnhanced, setUseEnhanced] = useState(true);
  const [activeTab, setActiveTab] = useState('new');
  const [archives, setArchives] = useState([]);
  const [loadingArchives, setLoadingArchives] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState(null);
  const { selectedPatient } = usePatient();

  useEffect(() => {
    if (selectedPatient && activeTab === 'archive') {
      fetchArchives();
    }
  }, [selectedPatient, activeTab]);

  const fetchArchives = async () => {
    if (!selectedPatient) return;
    
    setLoadingArchives(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/archives/patient/${selectedPatient.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setArchives(data.data);
      }
    } catch (error) {
      console.error('Error fetching archives:', error);
    } finally {
      setLoadingArchives(false);
    }
  };

  const handleViewArchive = (archive) => {
    setSelectedArchive(archive);
    setAnalysis(archive.analysis_result);
    setActiveTab('view');
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    setError(null);
    setIsAnalyzing(true);
    
    const formData = new FormData();
    formData.append('document', uploadedFile);
    formData.append('language', language);
    formData.append('enhanced', useEnhanced.toString());
    if (selectedPatient) {
      formData.append('patient_id', selectedPatient.id);
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/analysis/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Errore durante l\'analisi');
      }
    } catch (err) {
      setError('Errore di connessione');
      console.error('Upload error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AnalysisContainer>
      <Content>
        <TabContainer>
          <Tab 
            active={activeTab === 'new'} 
            onClick={() => setActiveTab('new')}
          >
            <FileText size={18} />
            Nuova Analisi
          </Tab>
          <Tab 
            active={activeTab === 'archive'} 
            onClick={() => setActiveTab('archive')}
          >
            <Archive size={18} />
            Archivio Analisi
          </Tab>
          {activeTab === 'view' && (
            <Tab active={true}>
              <Eye size={18} />
              Visualizzazione
            </Tab>
          )}
        </TabContainer>
        {activeTab === 'new' && (
          <>
            <LanguageSelector>
          Lingua:
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="italiano">Italiano</option>
            <option value="english">English</option>
            <option value="spanish">Español</option>
            <option value="french">Français</option>
            <option value="german">Deutsch</option>
          </select>
        </LanguageSelector>
        
        <EnhancedToggle>
          <label>
            <input 
              type="checkbox" 
              checked={useEnhanced} 
              onChange={(e) => setUseEnhanced(e.target.checked)}
            />
            <Settings size={16} />
            Analisi Avanzata con Contesto Paziente
          </label>
        </EnhancedToggle>
        
        {!isAnalyzing && !analysis && (
          <UploadArea>
            <Upload size={48} style={{ marginBottom: '16px', color: '#9ca3af' }} />
            <h3>Carica un documento da analizzare</h3>
            <p style={{ color: '#6b7280', marginTop: '8px' }}>
              Formati supportati: PDF, immagini, audio, testo
            </p>
            <input
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="file-upload"
              accept=".txt,.pdf,.png,.jpg,.jpeg,.mp3,.m4a,.wav"
            />
            <label htmlFor="file-upload" style={{
              display: 'inline-block',
              marginTop: '16px',
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              Seleziona File
            </label>
          </UploadArea>
        )}
        
        {isAnalyzing && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <LoadingSpinner />
            <LoadingText>Analizzando il documento con AI...</LoadingText>
          </div>
        )}
        
        {error && (
          <div style={{
            background: '#fee',
            border: '1px solid #fcc',
            padding: '16px',
            borderRadius: '8px',
            color: '#c00',
            marginTop: '16px'
          }}>
            <AlertCircle size={20} style={{ display: 'inline', marginRight: '8px' }} />
            {error}
          </div>
        )}
        
            {analysis && useEnhanced ? (
              <EnhancedAnalysisView analysis={analysis} />
            ) : (
              analysis && (
          <AnalysisResults>
            <Summary>
              <h3>Riepilogo Analisi</h3>
              <p>{analysis.summary || 'Analisi completata con successo'}</p>
            </Summary>
            
            {analysis.themes && (
              <Section>
                <SectionTitle>Temi Principali</SectionTitle>
                <ItemList>
                  {analysis.themes.map((theme, index) => (
                    <ListItem key={index}>{theme.name || theme}</ListItem>
                  ))}
                </ItemList>
              </Section>
            )}
            
            {analysis.emotions && (
              <Section>
                <SectionTitle>Profilo Emotivo</SectionTitle>
                {Object.entries(analysis.emotions).map(([emotion, intensity]) => (
                  <EmotionBar key={emotion}>
                    <EmotionLabel>{emotion}</EmotionLabel>
                    <IntensityBar>
                      <IntensityFill intensity={intensity} />
                    </IntensityBar>
                    <IntensityValue>{Math.round(intensity * 100)}%</IntensityValue>
                  </EmotionBar>
                ))}
              </Section>
            )}
          </AnalysisResults>
              )
            )}
          </>
        )}
        
        {activeTab === 'archive' && (
          <div>
            {loadingArchives ? (
              <LoadingSpinner />
            ) : archives.length > 0 ? (
              <ArchiveGrid>
                {archives.map((archive) => (
                  <ArchiveCard key={archive.id} onClick={() => handleViewArchive(archive)}>
                    <ArchiveHeader>
                      <ArchiveType>{archive.analysis_type}</ArchiveType>
                      <ArchiveDate>
                        <Calendar size={14} />
                        {new Date(archive.created_at).toLocaleDateString('it-IT')}
                      </ArchiveDate>
                    </ArchiveHeader>
                    <ArchiveSummary>
                      {archive.profile_insights || archive.analysis_result?.executiveSummary || 'Nessun riepilogo disponibile'}
                    </ArchiveSummary>
                    {archive.tags && archive.tags.length > 0 && (
                      <ArchiveTags>
                        {archive.tags.map((tag, index) => (
                          <Tag key={index}>{tag}</Tag>
                        ))}
                      </ArchiveTags>
                    )}
                    <ViewButton onClick={(e) => {
                      e.stopPropagation();
                      handleViewArchive(archive);
                    }}>
                      <Eye size={14} />
                      Visualizza Dettagli
                    </ViewButton>
                  </ArchiveCard>
                ))}
              </ArchiveGrid>
            ) : (
              <EmptyState>
                <Archive />
                <h3>Nessuna analisi archiviata</h3>
                <p>Le analisi completate verranno salvate qui</p>
              </EmptyState>
            )}
          </div>
        )}
        
        {activeTab === 'view' && selectedArchive && (
          <div>
            <button 
              onClick={() => {
                setActiveTab('archive');
                setSelectedArchive(null);
                setAnalysis(null);
              }}
              style={{
                marginBottom: '20px',
                padding: '8px 16px',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ← Torna all'archivio
            </button>
            {selectedArchive.analysis_result && (
              useEnhanced ? (
                <EnhancedAnalysisView analysis={selectedArchive.analysis_result} />
              ) : (
                <AnalysisResults>
                  <Summary>
                    <h3>Riepilogo Esecutivo</h3>
                    <p>{selectedArchive.analysis_result.executiveSummary || selectedArchive.analysis_result.summary}</p>
                  </Summary>
                </AnalysisResults>
              )
            )}
          </div>
        )}
      </Content>
    </AnalysisContainer>
  );
};

export default DocumentAnalysis;
