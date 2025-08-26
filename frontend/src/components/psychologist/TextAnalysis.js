import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiSend, FiUpload, FiAlertCircle, FiLoader, FiCpu, FiSave, FiRefreshCw, FiArchive, FiCheck, FiUser } from 'react-icons/fi';
import { AdvancedLoader, RevealCard, ANALYSIS_STEPS } from '../animations/AnimatedComponents';
import PsychologicalTreeGraph from '../visualizations/PsychologicalTreeGraph';
import { usePatient } from '../../context/PatientContext';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const AnalysisContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 8px;
  padding: 0;
  box-shadow: ${props => props.theme.shadows.sm};
  animation: ${fadeIn} 0.6s ease-out;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  background: ${props => props.theme.colors.neutral[50]};
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
`;

const Content = styled.div`
  padding: 24px;
`;

const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 24px;
`;

const SidebarCard = styled.div`
  background: white;
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 12px;
  padding: 16px;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const InputSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
`;

// Unified auto-detect input UI
const UnifiedCard = styled.div`
  background: linear-gradient(180deg, rgba(255,255,255,0.85), #ffffff);
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Dropzone = styled.div`
  border: 2px dashed ${props => (props.dragover ? props.theme.colors.primary : props.theme.colors.border.light)};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: 12px;
  padding: 28px;
  text-align: center;
  transition: all 0.25s ease;
  cursor: pointer;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: #f6f9ff;
  }
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  margin: 16px 0;

  &::before,&::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${props => props.theme.colors.border.light};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.3s ease;
  background: #f9fafb;

  &:focus {
    outline: none;
    border-color: #6366f1;
    background: white;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
    font-style: italic;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
  
  input {
    cursor: pointer;
  }
`;

const AnalyzeButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  margin-top: 16px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &:active {
    transform: translateY(0);
  }
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.primary ? props.theme.colors.primary : props.theme.colors.neutral[100]};
  color: ${props => props.primary ? 'white' : props.theme.colors.text.primary};
  border: 1px solid ${props => props.primary ? props.theme.colors.primary : props.theme.colors.border.light};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.success {
    background: #10b981;
    color: white;
    border-color: #10b981;
  }
  
  .spin {
    animation: ${spin} 1s linear infinite;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding: 20px;
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border.light};
  align-items: center;
  flex-wrap: wrap;
  
  .status-message {
    margin-left: auto;
    font-size: 14px;
    color: #10b981;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const LoadingText = styled.p`
  color: #64748b;
  font-style: italic;
  text-align: center;
  margin: 0;
`;

const ResultsContainer = styled.div`
  animation: ${fadeIn} 0.8s ease-out;
`;

const SummaryCard = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #1e293b;
  border: 1px solid #e2e8f0;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const SummaryTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SummaryText = styled.p`
  margin: 0;
  line-height: 1.6;
  opacity: 0.95;
`;

const InsightCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);

  h4 {
    margin: 0 0 12px 0;
    color: #374151;
    font-size: 1.1rem;
    font-weight: 600;
  }

  ul {
    margin: 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
    line-height: 1.5;
    color: #4b5563;
  }
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.lg};
`;

// Emotional tone UI removed per requirements (archive and analysis without sentiment)

const LoadingSection = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  background: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border.light};
  margin-top: ${props => props.theme.spacing.lg};
  
  p {
    margin-top: ${props => props.theme.spacing.md};
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${props => props.theme.colors.border.light};
  border-top: 4px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto;
`;

// Fix for styled-components v4: keyframes must be used inside styled components, not inline strings
const SpinningLoader = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto;
`;

const ResultsSection = styled.div`
  background: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.border.light};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-top: ${props => props.theme.spacing.lg};
`;

const DetailCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid #e2e8f0;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  h4 {
    margin: 0 0 20px 0;
    color: #1e293b;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
    gap: 10px;
    
    &::before {
      content: '';
      width: 3px;
      height: 20px;
      background: linear-gradient(180deg, #4f46e5, #7c3aed);
      border-radius: 2px;
    }
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      padding: 16px 0;
      border-bottom: 1px solid #f1f5f9;
      color: #475569;
      font-size: 15px;
      line-height: 1.6;
      
      &:last-child {
        border-bottom: none;
      }
      
      strong {
        color: #1e293b;
        font-weight: 600;
      }
    }
  }
`;

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const AnalysisCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  border-left: 4px solid ${props => props.borderColor || '#4f46e5'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;

const CardTitle = styled.h4`
  margin: 0 0 20px 0;
  color: #1e293b;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: linear-gradient(180deg, #4f46e5, #7c3aed);
    border-radius: 2px;
  }
`;

// ToneBar removed

const ItemList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;

  &:last-child {
    border-bottom: none;
  }
`;

const EmotionBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 6px;
`;

const EmotionLabel = styled.span`
  min-width: 100px;
  font-weight: 600;
  text-transform: capitalize;
  color: #334155;
`;

const IntensityBar = styled.div`
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  margin: 0 12px;
  overflow: hidden;
`;

const IntensityFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
  width: ${props => props.intensity * 100}%;
  transition: width 0.6s ease;
  border-radius: 3px;
`;

const IntensityValue = styled.span`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

const ErrorAlert = styled.div`
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TextAnalysis = () => {
  const { selectedPatient } = usePatient();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [whatIf, setWhatIf] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [inputMethod, setInputMethod] = useState('text');
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [archiveSaving, setArchiveSaving] = useState(false);
  const [savedToArchive, setSavedToArchive] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [includeProfile, setIncludeProfile] = useState(true);

  useEffect(() => {
    // Clear previous patient's data when switching patients
    setAnalysisData(null);
    setAnalyses([]);
    setError('');
    
    // Fetch analyses for current patient
    if (selectedPatient) {
      fetchAnalyses();
    }
  }, [selectedPatient]);

  const fetchAnalyses = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const patientParam = selectedPatient ? `&patient_id=${selectedPatient.id}` : '';
      const response = await fetch(`/api/v1/data/analyses?type=text${patientParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[FRONTEND] Received ${data.analyses?.length || 0} analyses for patient ${selectedPatient?.id}`);
        
        // Log each analysis to verify patient_id
        data.analyses?.forEach(analysis => {
          console.log(`[FRONTEND] Analysis ${analysis.id}: patient_id=${analysis.patient_id}, expected=${selectedPatient?.id}`);
        });
        
        setAnalyses(data.analyses || []);
        
        // CRITICAL: Never auto-load any analysis to prevent cross-patient data contamination
        // User must explicitly select an analysis from the list
        console.log(`[FRONTEND] Analysis data cleared for patient switch - no auto-loading`);
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files?.[0] || null);
    setUploadError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) {
      setSelectedFile(f);
      setUploadError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleAnalyzeDocument = async () => {
    if (!selectedFile) {
      setUploadError('Seleziona un file prima di avviare l\'analisi');
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      const token = localStorage.getItem('authToken');
      const form = new FormData();
      form.append('document', selectedFile);
      if (selectedPatient?.id) form.append('patient_id', selectedPatient.id);
      form.append('language', localStorage.getItem('aiLanguage') || 'italiano');

      const res = await fetch('/api/v1/analysis/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Errore durante l\'analisi del documento');
      }
      setAnalysisData(data.analysis);
      setWhatIf([]);
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload/analysis document error:', err);
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!analysisData || !selectedPatient?.id) return;
    
    setProfileUpdating(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/archives/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          profile_insights: analysisData.executiveSummary || analysisData.summary,
          change_type: 'ai_analysis'
        })
      });

      if (response.ok) {
        setProfileUpdated(true);
        setTimeout(() => setProfileUpdated(false), 5000);
      } else {
        setError('Errore nell\'aggiornamento del profilo');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Errore nell\'aggiornamento del profilo');
    } finally {
      setProfileUpdating(false);
    }
  };

  const handleSaveToArchive = async () => {
    if (!analysisData || !selectedPatient?.id) return;
    
    setArchiveSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/archives/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          analysis_type: 'text',
          input_text: text,
          analysis_result: analysisData,
          visualization_data: analysisData.graphData || null,
          profile_insights: analysisData.executiveSummary || analysisData.summary,
          tags: ['analisi_testo']
        })
      });

      if (response.ok) {
        setSavedToArchive(true);
        setTimeout(() => setSavedToArchive(false), 5000);
      } else {
        setError('Errore nel salvataggio nell\'archivio');
      }
    } catch (error) {
      console.error('Error saving to archive:', error);
      setError('Errore nel salvataggio nell\'archivio');
    } finally {
      setArchiveSaving(false);
    }
  };

  const handleNodeClick = async (node) => {
    try {
      setSelectedNode(node);
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/v1/analysis/what-if', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          baseScenario: `Focus on node ${node.id} (${node.type}). Explore alternative scenarios and clinical hypotheses related to this element.`,
          context: analysisData?.executiveSummary || 'Clinical text analysis context'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setWhatIf(data.scenarios || []);
      } else {
        setWhatIf([]);
      }
    } catch (e) {
      console.error('What-if error', e);
    }
  };

  const handleAnalyzeText = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError('');
    setCurrentStep(0);
    setProgress(0);
    
    // Simulate progressive steps
    const steps = ANALYSIS_STEPS;
    const stepDuration = 2000; // 2 seconds per step
    
    try {
      // Start step progression
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          const next = prev + 1;
          setProgress((next / steps.length) * 100);
          if (next >= steps.length) {
            clearInterval(stepInterval);
          }
          return next;
        });
      }, stepDuration / steps.length);

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/analysis/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: text,
          analysisType: 'comprehensive',
          patient_id: includeProfile && selectedPatient?.id ? selectedPatient.id : null,
          language: localStorage.getItem('aiLanguage') || 'italiano'
        })
      });

      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.success) {
        clearInterval(stepInterval);
        setCurrentStep(steps.length);
        setProgress(100);
        
        // Small delay for completion animation
        setTimeout(() => {
          setAnalysisData(payload.analysis);
          setWhatIf([]);
          setText('');
          // Don't call fetchAnalyses() here as it would overwrite the new results
          // The new analysis will be in the list on next page refresh
        }, 500);
      } else {
        clearInterval(stepInterval);
        const msg = payload?.message || 'Errore nell\'analisi del testo';
        setError(msg);
        setAnalysisData(null);
      }
    } catch (error) {
      console.error('Error analyzing text:', error);
      setError('Errore nell\'analisi del testo');
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAnalyzeText();
    }
  };

  return (
    <AnalysisContainer>
      <Content>
        <UnifiedCard>
          <Dropzone
            dragover={dragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('unified-file-input')?.click()}
          >
            <p style={{ margin: 0, color: '#64748b' }}>
              Trascina un file qui oppure clicca per selezionarlo
            </p>
            <p style={{ marginTop: 6, color: '#9ca3af', fontSize: 12 }}>
              Formati: TXT, PDF, DOC/DOCX, PNG/JPG/WEBP, MP3/M4A/WAV
            </p>
            <input
              id="unified-file-input"
              type="file"
              accept=".txt,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp,audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/wav,audio/x-wav,audio/webm"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {selectedFile && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#334155' }}>
                File selezionato: {selectedFile.name} ({Math.round(selectedFile.size/1024)} KB)
              </div>
            )}
          </Dropzone>

          <OrDivider>oppure incolla/scrivi testo</OrDivider>

          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Incolla qui il testo da analizzare oppure usa la dropzone sopra.\n\nEsempi:\n• Note di una sessione terapeutica\n• Trascrizione di un colloquio\n• Diario del paziente\n• Osservazioni comportamentali\n\nSuggerimento: premi Ctrl+Enter per analizzare rapidamente.`}
          />

          {selectedPatient && (
            <ToggleContainer>
              <ToggleLabel>
                <input
                  type="checkbox"
                  checked={includeProfile}
                  onChange={e => setIncludeProfile(e.target.checked)}
                />
                Includi profilo psicologico del paziente nell'analisi AI
              </ToggleLabel>
            </ToggleContainer>
          )}

          {uploadError && (
            <ErrorAlert style={{ marginTop: 10 }}>
              <FiAlertCircle /> {uploadError}
            </ErrorAlert>
          )}

          <AnalyzeButton
            onClick={() => {
              if (selectedFile) return handleAnalyzeDocument();
              return handleAnalyzeText();
            }}
            disabled={loading || uploading || (!text.trim() && !selectedFile)}
          >
            {(loading || uploading) ? (
              <>
                <SpinningLoader />
                Analisi in corso...
              </>
            ) : (
              <>
                <FiSend />
                Analizza con AI
              </>
            )}
          </AnalyzeButton>
        </UnifiedCard>

        {error && (
          <ErrorAlert>
            <FiAlertCircle /> {error}
          </ErrorAlert>
        )}

        {loading && (
          <AdvancedLoader
            steps={ANALYSIS_STEPS}
            currentStep={currentStep}
            progress={progress}
            title="Analisi Psicologica AI in Corso"
          />
        )}

        {analysisData && (
          <ResultsSection>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <RevealCard delay={100}>
                  <SummaryCard>
                    <SummaryTitle>
                      <FiCpu /> Sintesi Esecutiva
                      {analysisData.profileWeight && analysisData.profileWeight > 0 && (
                        <span style={{ 
                          background: '#e5e7eb', 
                          color: '#374151', 
                          fontSize: '11px', 
                          padding: '4px 8px', 
                          borderRadius: '6px',
                          fontWeight: '500',
                          marginLeft: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <FiUser size={10} /> Profilo Integrato
                        </span>
                      )}
                    </SummaryTitle>
                    <p>{analysisData.executiveSummary || analysisData.summary}</p>
                  </SummaryCard>
                </RevealCard>

                {Array.isArray(analysisData.origins) && analysisData.origins.length > 0 && (
                  <RevealCard delay={200}>
                    <InsightCard>
                      <h4>Origini Identificate</h4>
                      <ul>
                        {analysisData.origins.map((o, i) => (
                          <li key={i} style={{ position: 'relative' }}>
                            <strong>{o.title}:</strong> {o.explanation}
                            {o.profileInfluenced && (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center',
                                gap: '3px',
                                background: '#f3f4f6', 
                                color: '#6b7280', 
                                fontSize: '10px', 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                marginLeft: '8px',
                                fontWeight: '500'
                              }}>
                                <FiUser size={8} /> Profilo
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </InsightCard>
                  </RevealCard>
                )}

                {Array.isArray(analysisData.behavioralPatterns) && analysisData.behavioralPatterns.length > 0 && (
                  <RevealCard delay={400}>
                    <InsightCard>
                      <h4>Pattern Comportamentali Ricorrenti</h4>
                      <ul>
                        {analysisData.behavioralPatterns.map((p, i) => (
                          <li key={i} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <div style={{ flex: 1 }}>
                                <strong>{p.name}</strong> — {p.description}
                              </div>
                              {p.profileInfluenced && (
                                <span style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center',
                                  gap: '3px',
                                  background: '#f3f4f6', 
                                  color: '#6b7280', 
                                  fontSize: '10px', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px',
                                  fontWeight: '500',
                                  flexShrink: 0
                                }}>
                                  <FiUser size={8} /> Profilo
                                </span>
                              )}
                            </div>
                            {p.clinicalSignificance && (
                              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                                <em>Significato clinico: {p.clinicalSignificance}</em>
                              </div>
                            )}
                            {typeof p.severity === 'number' && (
                              <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, marginTop: 6 }}>
                                <div style={{ width: `${Math.round((p.severity || 0)*100)}%`, height: '100%', background: '#7c3aed', borderRadius: 3 }} />
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </InsightCard>
                  </RevealCard>
                )}
              </div>

              <div>
                {Array.isArray(analysisData.psychologicalConnections) && analysisData.psychologicalConnections.length > 0 && (
                  <InsightCard>
                    <h4>Connessioni Psicologiche</h4>
                    <ul>
                      {analysisData.psychologicalConnections.slice(0, 5).map((conn, i) => (
                        <li key={i} style={{ marginBottom: 8, fontSize: '14px' }}>
                          <strong>{conn.source}</strong> → <strong>{conn.target}</strong>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
                            {conn.mechanism || conn.note}
                            {conn.profileInfluenced && (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center',
                                gap: '3px',
                                background: '#f3f4f6', 
                                color: '#6b7280', 
                                fontSize: '9px', 
                                padding: '2px 5px', 
                                borderRadius: '4px',
                                fontWeight: '500',
                                marginLeft: '6px'
                              }}>
                                <FiUser size={8} /> Profilo
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                    {analysisData.psychologicalConnections.length > 5 && (
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                        +{analysisData.psychologicalConnections.length - 5} altre connessioni...
                      </p>
                    )}
                  </InsightCard>
                )}

                {/* Emotional Tone removed */}

                {Array.isArray(analysisData.deepeningQuestions) && analysisData.deepeningQuestions.length > 0 && (
                  <InsightCard>
                    <h4>Suggerimenti per Approfondire</h4>
                    <ul>
                      {analysisData.deepeningQuestions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </InsightCard>
                )}
              </div>
            </div>

            {analysisData.graphData && Array.isArray(analysisData.graphData.nodes) && analysisData.graphData.nodes.length > 0 && (
              <RevealCard delay={800}>
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h4 style={{ margin: 0 }}>Mappa Relazionale Psicologica</h4>
                  </div>
                  
                  <PsychologicalTreeGraph 
                    data={analysisData.graphData}
                    width={900}
                    height={600}
                    onNodeClick={(node) => {
                      setSelectedNode(node);
                      console.log('Node clicked:', node);
                    }}
                  />
                  {selectedNode && (
                    <div style={{ 
                      marginTop: 12, 
                      padding: 16, 
                      background: 'linear-gradient(135deg, #f8faff 0%, #f1f5f9 100%)', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                      <strong style={{ color: '#4f46e5' }}>Nodo selezionato:</strong> {selectedNode.id} ({selectedNode.type})
                      {selectedNode.description && (
                        <div style={{ marginTop: 8, fontSize: '14px', color: '#64748b' }}>
                          {selectedNode.description}
                        </div>
                      )}
                      {whatIf?.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <strong style={{ color: '#7c3aed' }}>Scenari What-if:</strong>
                          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                            {whatIf.map((s) => (
                              <li key={s.id} style={{ marginBottom: 6, fontSize: '14px' }}>
                                <em style={{ color: '#4f46e5' }}>{s.title}</em>: {s.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </RevealCard>
            )}
          </ResultsSection>
        )}
        
        {analysisData && selectedPatient && (
          <ActionButtons>
            <ActionButton
              onClick={handleUpdateProfile}
              disabled={profileUpdating || profileUpdated}
              className={profileUpdated ? 'success' : ''}
              primary
            >
              {profileUpdating ? (
                <><FiLoader className="spin" /> Aggiornamento...</>
              ) : profileUpdated ? (
                <><FiCheck /> Profilo Aggiornato</>
              ) : (
                <><FiRefreshCw /> Aggiorna Profilo</>
              )}
            </ActionButton>
            
            <ActionButton
              onClick={handleSaveToArchive}
              disabled={archiveSaving || savedToArchive}
              className={savedToArchive ? 'success' : ''}
            >
              {archiveSaving ? (
                <><FiLoader className="spin" /> Salvataggio...</>
              ) : savedToArchive ? (
                <><FiCheck /> Salvato in Archivio</>
              ) : (
                <><FiArchive /> Salva in Archivio</>
              )}
            </ActionButton>
            
            {(profileUpdated || savedToArchive) && (
              <div className="status-message">
                <FiCheck /> 
                {profileUpdated && savedToArchive ? 'Profilo aggiornato e analisi archiviata' : 
                 profileUpdated ? 'Profilo psicologico aggiornato con successo' : 
                 'Analisi salvata nell\'archivio'}
              </div>
            )}
          </ActionButtons>
        )}
      </Content>
    </AnalysisContainer>
  );
};

export default TextAnalysis;
