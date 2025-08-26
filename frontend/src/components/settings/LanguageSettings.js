import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiGlobe, FiCheck } from 'react-icons/fi';

const SettingsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
`;

const CardDescription = styled.p`
  margin: 0 0 24px 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
`;

const LanguageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const LanguageOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 2px solid ${props => props.selected ? '#4f46e5' : '#e2e8f0'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#f8faff' : 'white'};

  &:hover {
    border-color: ${props => props.selected ? '#4f46e5' : '#cbd5e1'};
    background: ${props => props.selected ? '#f8faff' : '#f8fafc'};
  }
`;

const LanguageInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LanguageName = styled.span`
  font-weight: 600;
  color: ${props => props.selected ? '#4f46e5' : '#1e293b'};
  font-size: 14px;
`;

const LanguageNative = styled.span`
  color: #64748b;
  font-size: 12px;
`;

const CheckIcon = styled(FiCheck)`
  color: #4f46e5;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.2s ease;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  margin-top: 24px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusMessage = styled.div`
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.type === 'success' ? '#f0fdf4' : '#fef2f2'};
  color: ${props => props.type === 'success' ? '#166534' : '#dc2626'};
  border: 1px solid ${props => props.type === 'success' ? '#bbf7d0' : '#fecaca'};
`;

const AVAILABLE_LANGUAGES = [
  { code: 'italiano', name: 'Italiano', native: 'Italiano', flag: '🇮🇹' },
  { code: 'english', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'español', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'français', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'deutsch', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'português', name: 'Portuguese', native: 'Português', flag: '🇵🇹' }
];

const LanguageSettings = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('italiano');
  const [savedLanguage, setSavedLanguage] = useState('italiano');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Load saved language preference
    const saved = localStorage.getItem('aiLanguage') || 'italiano';
    setSelectedLanguage(saved);
    setSavedLanguage(saved);
  }, []);

  const handleLanguageSelect = (languageCode) => {
    setSelectedLanguage(languageCode);
    setMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Save to localStorage
      localStorage.setItem('aiLanguage', selectedLanguage);
      setSavedLanguage(selectedLanguage);
      
      // Here you could also save to backend user preferences
      // await fetch('/api/v1/user/preferences', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify({ aiLanguage: selectedLanguage })
      // });

      setMessage({
        type: 'success',
        text: 'Impostazioni lingua salvate con successo. Le nuove analisi AI utilizzeranno la lingua selezionata.'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Errore nel salvare le impostazioni lingua.'
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = selectedLanguage !== savedLanguage;

  return (
    <SettingsCard>
      <CardHeader>
        <FiGlobe size={20} color="#4f46e5" />
        <CardTitle>Lingua delle Analisi AI</CardTitle>
      </CardHeader>
      
      <CardDescription>
        Seleziona la lingua in cui l'intelligenza artificiale deve fornire le analisi psicologiche. 
        Questa impostazione influenzerà tutte le nuove analisi di testo, documenti e file multimediali.
      </CardDescription>

      <LanguageGrid>
        {AVAILABLE_LANGUAGES.map((lang) => (
          <LanguageOption
            key={lang.code}
            selected={selectedLanguage === lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
          >
            <LanguageInfo>
              <LanguageName selected={selectedLanguage === lang.code}>
                {lang.flag} {lang.name}
              </LanguageName>
              <LanguageNative>{lang.native}</LanguageNative>
            </LanguageInfo>
            <CheckIcon visible={selectedLanguage === lang.code} />
          </LanguageOption>
        ))}
      </LanguageGrid>

      {hasChanges && (
        <SaveButton onClick={handleSave} disabled={saving}>
          {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
        </SaveButton>
      )}

      {message && (
        <StatusMessage type={message.type}>
          {message.text}
        </StatusMessage>
      )}
    </SettingsCard>
  );
};

export default LanguageSettings;
