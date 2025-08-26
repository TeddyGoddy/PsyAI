import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiChevronDown, FiChevronUp, FiUser, FiCalendar, FiMapPin, FiHeart, FiMessageSquare, FiSave, FiRefreshCw, FiEdit3, FiLoader } from 'react-icons/fi';
import { usePatient } from '../../context/PatientContext';
import ProfileRenderer from './ProfileRenderer';

const ProfileContainer = styled.div`
  width: 100%;
  margin: 0;
  padding: 24px;
  
  .spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Section = styled.section`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 20px 24px;
  background: ${props => props.theme.colors.neutral[50]};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${props => props.$collapsible ? 'pointer' : 'default'};
  
  &:hover {
    background: ${props => props.$collapsible ? props.theme.colors.neutral[100] : props.theme.colors.neutral[50]};
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionBody = styled.div`
  padding: 24px;
  display: ${props => props.$collapsed ? 'none' : 'block'};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 6px;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 16px;
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 8px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.surface};
  min-height: 400px;
  resize: vertical;
  line-height: 1.6;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(79, 209, 199, 0.1);
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
    font-style: italic;
  }
`;

const Button = styled.button`
  background: ${props => props.$primary ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : props.theme.colors.surface};
  color: ${props => props.$primary ? 'white' : props.theme.colors.text.primary};
  border: 1px solid ${props => props.$primary ? 'transparent' : props.theme.colors.border.light};
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.sm};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const SessionContainer = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SessionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const ChatBox = styled.div`
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 8px;
  padding: 16px;
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 16px;
  background: white;
`;

const Message = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.ai ? '#f0f9ff' : '#f8fafc'};
  border-left: 3px solid ${props => props.ai ? '#3b82f6' : '#10b981'};
`;

const MessageLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.ai ? '#3b82f6' : '#10b981'};
  margin-bottom: 4px;
`;

const MessageText = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.5;
`;

const ResponseInput = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  margin-bottom: 12px;
`;

const StatusText = styled.span`
  font-size: 13px;
  color: ${props => props.error ? '#dc2626' : props.success ? '#16a34a' : props.theme.colors.text.secondary};
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
`;

const PatientProfile = () => {
  const { selectedPatient } = usePatient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Section collapse states
  const [generalCollapsed, setGeneralCollapsed] = useState(false);
  const [therapyCollapsed, setTherapyCollapsed] = useState(true);
  const [profileCollapsed, setProfileCollapsed] = useState(false);
  
  // Patient data
  const [patientData, setPatientData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    birth_place: '',
    residence: '',
    gender: '',
    therapy_start_date: '',
    previous_therapy: false,
    medications: '',
    therapy_goals: '',
    psychological_profile: ''
  });
  
  // AI Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [sessionLoading, setSessionLoading] = useState(false);
  const [profileGenerated, setProfileGenerated] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [improvingProfile, setImprovingProfile] = useState(false);
  
  // Load patient data
  useEffect(() => {
    const loadPatientData = async () => {
      if (!selectedPatient) return;
      setLoading(true);
      setError('');
      
      try {
        // Load full patient data from backend
        const token = localStorage.getItem('authToken');
        const res = await fetch(`/api/v1/patients/${selectedPatient.id}/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to load patient data');
        
        const response = await res.json();
        const data = response.data;
        
        // Set all patient data from backend response
        setPatientData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          date_of_birth: data.date_of_birth || '',
          birth_place: data.birth_place || '',
          residence: data.residence || '',
          gender: data.gender || '',
          therapy_start_date: data.therapy_start_date || '',
          previous_therapy: data.previous_therapy || false,
          medications: Array.isArray(data.current_medications) ? data.current_medications.join(', ') : (data.current_medications || ''),
          therapy_goals: data.therapy_goals || '',
          psychological_profile: data.psychological_profile || ''
        });
      } catch (err) {
        console.error('Error loading patient data:', err);
        setError('Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };
    
    loadPatientData();
  }, [selectedPatient]);
  
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Save profile
      const res = await fetch(`/api/v1/patients/${selectedPatient.id}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          psychological_profile: patientData.psychological_profile,
          ...patientData 
        })
      });
      
      if (!res.ok) throw new Error('Save failed');
      
      setSuccess('Dati salvati con successo');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };
  
  const startAISession = () => {
    setSessionActive(true);
    setSessionMessages([
      {
        ai: true,
        text: "Ciao! Sono qui per aiutarti a creare un profilo psicologico iniziale. Iniziamo con una breve presentazione: puoi descriverti liberamente, raccontandomi un po' di te, della tua situazione attuale e di cosa ti porta qui oggi?"
      }
    ]);
  };
  
  const handleSessionResponse = async () => {
    if (!currentResponse.trim()) return;
    
    // Add user message
    const userMessage = { ai: false, text: currentResponse };
    setSessionMessages(prev => [...prev, userMessage]);
    setCurrentResponse('');
    setSessionLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/v1/ai/session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          messages: [...sessionMessages, userMessage],
          session_type: 'initial_assessment'
        })
      });
      
      if (!res.ok) throw new Error('Session error');
      
      const data = await res.json();
      
      // Add AI response
      if (data.response) {
        setSessionMessages(prev => [...prev, { ai: true, text: data.response }]);
      }
      
      // Check if profile is ready
      if (data.profile_ready) {
        setPatientData(prev => ({
          ...prev,
          psychological_profile: data.generated_profile
        }));
        setProfileGenerated(true);
      }
    } catch (err) {
      setError('Errore nella sessione AI');
    } finally {
      setSessionLoading(false);
    }
  };
  
  const skipQuestion = async () => {
    const skipMessage = { ai: false, text: "[Preferisco non rispondere]" };
    setSessionMessages(prev => [...prev, skipMessage]);
    handleSessionResponse();
  };

  const handleImproveProfile = async () => {
    if (!patientData.psychological_profile || !patientData.psychological_profile.trim()) return;
    
    console.log('Starting profile improvement...', {
      profile: patientData.psychological_profile.substring(0, 100) + '...',
      patient_id: selectedPatient?.id,
      language: localStorage.getItem('aiLanguage') || 'italiano'
    });
    
    setImprovingProfile(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('authToken');
      console.log('Making API call to improve profile...');
      
      const response = await fetch('/api/v1/ai/improve-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profile: patientData.psychological_profile,
          patient_id: selectedPatient?.id,
          language: localStorage.getItem('aiLanguage') || 'italiano'
        })
      });

      console.log('API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API response data:', data);
        
        if (data.success && data.improvedProfile) {
          setPatientData({
            ...patientData, 
            psychological_profile: data.improvedProfile
          });
          setSuccess('Profilo migliorato con successo!');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          console.error('API returned error:', data);
          setError(data.message || 'Errore nel miglioramento del profilo');
        }
      } else {
        const errorData = await response.text();
        console.error('API error response:', errorData);
        setError(`Errore API: ${response.status}`);
      }
    } catch (error) {
      console.error('Network error improving profile:', error);
      setError('Errore di connessione durante il miglioramento');
    } finally {
      setImprovingProfile(false);
    }
  };

  if (!selectedPatient) {
    return (
      <ProfileContainer>
        <Section>
          <SectionBody>
            <StatusText>Seleziona un paziente per visualizzare il profilo</StatusText>
          </SectionBody>
        </Section>
      </ProfileContainer>
    );
  }
  
  return (
    <ProfileContainer>
      {/* General Data Section */}
      <Section>
        <SectionHeader onClick={() => setGeneralCollapsed(!generalCollapsed)} collapsible>
          <SectionTitle>
            <FiUser />
            Dati Generali
          </SectionTitle>
          {generalCollapsed ? <FiChevronDown /> : <FiChevronUp />}
        </SectionHeader>
        <SectionBody collapsed={generalCollapsed}>
          <Grid>
            <FormGroup>
              <Label>Nome</Label>
              <Input
                value={patientData.first_name}
                onChange={e => setPatientData({...patientData, first_name: e.target.value})}
                disabled={loading}
              />
            </FormGroup>
            <FormGroup>
              <Label>Cognome</Label>
              <Input
                value={patientData.last_name}
                onChange={e => setPatientData({...patientData, last_name: e.target.value})}
                disabled={loading}
              />
            </FormGroup>
            <FormGroup>
              <Label>Data di Nascita</Label>
              <Input
                type="date"
                value={patientData.date_of_birth}
                onChange={e => setPatientData({...patientData, date_of_birth: e.target.value})}
                disabled={loading}
              />
            </FormGroup>
            <FormGroup>
              <Label>Luogo di Nascita</Label>
              <Input
                value={patientData.birth_place}
                onChange={e => setPatientData({...patientData, birth_place: e.target.value})}
                placeholder="Città, Provincia"
                disabled={loading}
              />
            </FormGroup>
            <FormGroup>
              <Label>Residenza</Label>
              <Input
                value={patientData.residence}
                onChange={e => setPatientData({...patientData, residence: e.target.value})}
                placeholder="Città attuale"
                disabled={loading}
              />
            </FormGroup>
            <FormGroup>
              <Label>Genere</Label>
              <Input
                as="select"
                value={patientData.gender}
                onChange={e => setPatientData({...patientData, gender: e.target.value})}
                disabled={loading}
              >
                <option value="">Seleziona</option>
                <option value="male">Maschile</option>
                <option value="female">Femminile</option>
                <option value="other">Altro</option>
                <option value="prefer_not_to_say">Preferisco non dire</option>
              </Input>
            </FormGroup>
          </Grid>
        </SectionBody>
      </Section>
      
      {/* Therapy History Section */}
      <Section>
        <SectionHeader onClick={() => setTherapyCollapsed(!therapyCollapsed)} collapsible>
          <SectionTitle>
            <FiHeart />
            Storia Terapeutica
          </SectionTitle>
          {therapyCollapsed ? <FiChevronDown /> : <FiChevronUp />}
        </SectionHeader>
        <SectionBody collapsed={therapyCollapsed}>
          <Grid>
            <FormGroup>
              <Label>Data Inizio Terapia</Label>
              <Input
                type="date"
                value={patientData.therapy_start_date}
                onChange={e => setPatientData({...patientData, therapy_start_date: e.target.value})}
                disabled={loading}
              />
            </FormGroup>
            <FormGroup>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={patientData.previous_therapy}
                  onChange={e => setPatientData({...patientData, previous_therapy: e.target.checked})}
                  disabled={loading}
                />
                Ha partecipato a terapie precedenti
              </CheckboxLabel>
            </FormGroup>
            <FormGroup>
              <Label>Farmaci Attuali</Label>
              <Input
                value={patientData.medications}
                onChange={e => setPatientData({...patientData, medications: e.target.value})}
                placeholder="Lista farmaci se presenti"
                disabled={loading}
              />
            </FormGroup>
            <FormGroup>
              <Label>Obiettivi Terapeutici</Label>
              <Textarea
                value={patientData.therapy_goals}
                onChange={e => setPatientData({...patientData, therapy_goals: e.target.value})}
                placeholder="Obiettivi principali della terapia"
                disabled={loading}
              />
            </FormGroup>
          </Grid>
        </SectionBody>
      </Section>
      
      {/* Psychological Profile Section */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            <FiMessageSquare />
            Profilo Psicologico
          </SectionTitle>
        </SectionHeader>
        <SectionBody>
          {!patientData.psychological_profile && !sessionActive && !editMode ? (
            <div>
              <StatusText>Nessun profilo psicologico presente.</StatusText>
              <ButtonGroup>
                <Button $primary onClick={startAISession}>
                  <FiMessageSquare />
                  Inizia Sessione Guidata con AI
                </Button>
                <Button onClick={() => {
                  setPatientData({...patientData, psychological_profile: ' '});
                  setEditMode(true);
                }}>
                  Inserisci Manualmente
                </Button>
              </ButtonGroup>
            </div>
          ) : sessionActive ? (
            <SessionContainer>
              <SessionHeader>
                <SessionTitle>Sessione di Valutazione Iniziale</SessionTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {sessionMessages.length > 1 && (
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      Progresso: {Math.min(Math.round((sessionMessages.length / 16) * 100), 95)}%
                    </div>
                  )}
                  <Button onClick={() => setSessionActive(false)}>
                    Chiudi Sessione
                  </Button>
                </div>
              </SessionHeader>
              
              <ChatBox>
                {sessionMessages.map((msg, idx) => (
                  <Message key={idx} ai={msg.ai}>
                    <MessageLabel>{msg.ai ? 'AI Therapist' : 'Paziente'}</MessageLabel>
                    <MessageText>{msg.text}</MessageText>
                  </Message>
                ))}
                {sessionLoading && (
                  <Message ai>
                    <MessageLabel>AI Therapist</MessageLabel>
                    <MessageText>Sto elaborando...</MessageText>
                  </Message>
                )}
              </ChatBox>
              
              {!profileGenerated && (
                <>
                  <ResponseInput
                    value={currentResponse}
                    onChange={e => setCurrentResponse(e.target.value)}
                    placeholder="Scrivi la tua risposta..."
                    disabled={sessionLoading}
                  />
                  <ButtonGroup>
                    <Button primary onClick={handleSessionResponse} disabled={sessionLoading || !currentResponse.trim()}>
                      Invia Risposta
                    </Button>
                    <Button onClick={skipQuestion} disabled={sessionLoading}>
                      Preferisco non rispondere
                    </Button>
                  </ButtonGroup>
                </>
              )}
              
              {profileGenerated && (
                <div>
                  <StatusText success>Profilo generato con successo!</StatusText>
                  <ButtonGroup>
                    <Button primary onClick={() => setSessionActive(false)}>
                      Visualizza Profilo
                    </Button>
                  </ButtonGroup>
                </div>
              )}
            </SessionContainer>
          ) : (
            <>
              {patientData.psychological_profile && !editMode ? (
                <div style={{ marginBottom: '16px' }}>
                  <ProfileRenderer content={patientData.psychological_profile} />
                  <ButtonGroup style={{ marginTop: '16px' }}>
                    <Button onClick={() => setEditMode(true)}>
                      Modifica Profilo
                    </Button>
                    <Button onClick={startAISession}>
                      <FiRefreshCw />
                      Aggiorna con Sessione AI
                    </Button>
                  </ButtonGroup>
                </div>
              ) : (
                <>
                  <Textarea
                    value={patientData.psychological_profile}
                    onChange={e => setPatientData({...patientData, psychological_profile: e.target.value})}
                    placeholder="Inserisci il profilo psicologico del paziente..."
                    disabled={loading}
                  />
                  <ButtonGroup>
                    {patientData.psychological_profile && patientData.psychological_profile.trim() && (
                      <Button onClick={handleImproveProfile} disabled={improvingProfile}>
                        {improvingProfile ? (
                          <>
                            <FiLoader className="spinning" />
                            Migliorando...
                          </>
                        ) : (
                          <>
                            <FiEdit3 />
                            Migliora con AI
                          </>
                        )}
                      </Button>
                    )}
                    {editMode ? (
                      <>
                        <Button $primary onClick={() => {
                          setEditMode(false);
                          handleSave();
                        }}>
                          <FiSave />
                          Salva Profilo
                        </Button>
                        <Button onClick={() => {
                          setEditMode(false);
                          // Reset to original or empty if new
                          if (selectedPatient) {
                            // Reload original data
                            setPatientData(prev => ({
                              ...prev,
                              psychological_profile: selectedPatient.psychological_profile || ''
                            }));
                          }
                        }}>
                          Annulla
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => setEditMode(false)}>
                          Visualizza Formattato
                        </Button>
                        {patientData.psychological_profile && (
                          <Button onClick={startAISession}>
                            <FiRefreshCw />
                            Aggiorna con Sessione AI
                          </Button>
                        )}
                      </>
                    )}
                  </ButtonGroup>
                </>
              )}
            </>
          )}
        </SectionBody>
      </Section>
      
      {/* Save Actions */}
      <ButtonGroup>
        <Button $primary onClick={handleSave} disabled={saving || loading}>
          <FiSave />
          {saving ? 'Salvataggio...' : 'Salva Modifiche'}
        </Button>
        {error && <StatusText error>{error}</StatusText>}
        {success && <StatusText success>{success}</StatusText>}
      </ButtonGroup>
    </ProfileContainer>
  );
};

export default PatientProfile;
