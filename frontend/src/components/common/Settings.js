import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSettings, FiUser, FiBell, FiLock, FiMoon, FiSun, FiSave, FiX } from 'react-icons/fi';

const SettingsOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const SettingsModal = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const SettingsHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const SettingsContent = styled.div`
  padding: 24px;
`;

const SettingsSection = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  color: #1e293b;
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SettingName = styled.span`
  font-weight: 500;
  color: #1e293b;
`;

const SettingDescription = styled.span`
  font-size: 0.875rem;
  color: #64748b;
`;

const Toggle = styled.button`
  width: 48px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: ${props => props.active ? '#10b981' : '#e2e8f0'};
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${props => props.active ? '26px' : '2px'};
    transition: left 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #1e293b;
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #1e293b;
  font-size: 0.875rem;
  width: 200px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Settings = ({ isOpen, onClose, userType }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'it',
    autoSave: true,
    dataRetention: '1year',
    aiAnalysis: true,
    emailNotifications: false,
    sessionReminders: true
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('psyai_settings', JSON.stringify(settings));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <SettingsOverlay onClick={onClose}>
      <SettingsModal onClick={e => e.stopPropagation()}>
        <SettingsHeader>
          <HeaderTitle>
            <FiSettings />
            Impostazioni
          </HeaderTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </SettingsHeader>

        <SettingsContent>
          <SettingsSection>
            <SectionTitle>
              <FiUser />
              Profilo Utente
            </SectionTitle>
            <SettingItem>
              <SettingLabel>
                <SettingName>Tipo Utente</SettingName>
                <SettingDescription>Il tuo ruolo nell'applicazione</SettingDescription>
              </SettingLabel>
              <span style={{ 
                background: userType === 'psychologist' ? '#667eea' : '#10b981',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {userType === 'psychologist' ? 'Psicologo' : 'Paziente'}
              </span>
            </SettingItem>
            <SettingItem>
              <SettingLabel>
                <SettingName>Lingua</SettingName>
                <SettingDescription>Lingua dell'interfaccia</SettingDescription>
              </SettingLabel>
              <Select 
                value={settings.language}
                onChange={e => handleSelectChange('language', e.target.value)}
              >
                <option value="it">Italiano</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </Select>
            </SettingItem>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>
              <FiBell />
              Notifiche
            </SectionTitle>
            <SettingItem>
              <SettingLabel>
                <SettingName>Notifiche Push</SettingName>
                <SettingDescription>Ricevi notifiche nell'applicazione</SettingDescription>
              </SettingLabel>
              <Toggle 
                active={settings.notifications}
                onClick={() => handleToggle('notifications')}
              />
            </SettingItem>
            <SettingItem>
              <SettingLabel>
                <SettingName>Email Notifiche</SettingName>
                <SettingDescription>Ricevi notifiche via email</SettingDescription>
              </SettingLabel>
              <Toggle 
                active={settings.emailNotifications}
                onClick={() => handleToggle('emailNotifications')}
              />
            </SettingItem>
            <SettingItem>
              <SettingLabel>
                <SettingName>Promemoria Sessioni</SettingName>
                <SettingDescription>Ricorda le sessioni programmate</SettingDescription>
              </SettingLabel>
              <Toggle 
                active={settings.sessionReminders}
                onClick={() => handleToggle('sessionReminders')}
              />
            </SettingItem>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>
              <FiLock />
              Privacy e Sicurezza
            </SectionTitle>
            <SettingItem>
              <SettingLabel>
                <SettingName>Salvataggio Automatico</SettingName>
                <SettingDescription>Salva automaticamente i progressi</SettingDescription>
              </SettingLabel>
              <Toggle 
                active={settings.autoSave}
                onClick={() => handleToggle('autoSave')}
              />
            </SettingItem>
            <SettingItem>
              <SettingLabel>
                <SettingName>Conservazione Dati</SettingName>
                <SettingDescription>Periodo di conservazione dei dati</SettingDescription>
              </SettingLabel>
              <Select 
                value={settings.dataRetention}
                onChange={e => handleSelectChange('dataRetention', e.target.value)}
              >
                <option value="6months">6 Mesi</option>
                <option value="1year">1 Anno</option>
                <option value="2years">2 anni</option>
                <option value="5years">5 anni</option>
              </Select>
            </SettingItem>
            <SettingItem>
              <SettingLabel>
                <SettingName>Analisi AI</SettingName>
                <SettingDescription>Abilita l'analisi automatica con AI</SettingDescription>
              </SettingLabel>
              <Toggle 
                active={settings.aiAnalysis}
                onClick={() => handleToggle('aiAnalysis')}
              />
            </SettingItem>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>
              {settings.darkMode ? <FiMoon /> : <FiSun />}
              Aspetto
            </SectionTitle>
            <SettingItem>
              <SettingLabel>
                <SettingName>Modalità Scura</SettingName>
                <SettingDescription>Attiva il tema scuro</SettingDescription>
              </SettingLabel>
              <Toggle 
                active={settings.darkMode}
                onClick={() => handleToggle('darkMode')}
              />
            </SettingItem>
          </SettingsSection>

          <SaveButton onClick={handleSave}>
            <FiSave />
            Salva Impostazioni
          </SaveButton>
        </SettingsContent>
      </SettingsModal>
    </SettingsOverlay>
  );
};

export default Settings;
