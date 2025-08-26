import React, { useState } from 'react';
import styled from 'styled-components';
import { FiUser, FiBell, FiLock, FiSave } from 'react-icons/fi';

const SettingsContainer = styled.div`
  padding: ${props => props.theme.spacing.xl};
  max-width: 800px;
  margin: 0 auto;
`;

// Removed inner Header/Title/Subtitle to rely on the main page header

const SettingsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Label = styled.label`
  display: block;
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Button = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

const SettingsView = () => {
  const [settings, setSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notifications: true,
    emailAlerts: true
  });

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
  };

  return (
    <SettingsContainer>
      <SettingsSection>
        <SectionTitle>
          <FiUser />
          Informazioni Profilo
        </SectionTitle>
        <FormGroup>
          <Label>Nome</Label>
          <Input
            type="text"
            value={settings.firstName}
            onChange={(e) => setSettings(prev => ({...prev, firstName: e.target.value}))}
          />
        </FormGroup>
        <FormGroup>
          <Label>Cognome</Label>
          <Input
            type="text"
            value={settings.lastName}
            onChange={(e) => setSettings(prev => ({...prev, lastName: e.target.value}))}
          />
        </FormGroup>
        <FormGroup>
          <Label>Email</Label>
          <Input
            type="email"
            value={settings.email}
            onChange={(e) => setSettings(prev => ({...prev, email: e.target.value}))}
          />
        </FormGroup>
        <FormGroup>
          <Label>Telefono</Label>
          <Input
            type="tel"
            value={settings.phone}
            onChange={(e) => setSettings(prev => ({...prev, phone: e.target.value}))}
          />
        </FormGroup>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>
          <FiBell />
          Notifiche
        </SectionTitle>
        <FormGroup>
          <Label>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => setSettings(prev => ({...prev, notifications: e.target.checked}))}
            />
            Abilita notifiche push
          </Label>
        </FormGroup>
        <FormGroup>
          <Label>
            <input
              type="checkbox"
              checked={settings.emailAlerts}
              onChange={(e) => setSettings(prev => ({...prev, emailAlerts: e.target.checked}))}
            />
            Ricevi alert via email
          </Label>
        </FormGroup>
      </SettingsSection>

      <Button onClick={handleSave}>
        <FiSave />
        Salva Impostazioni
      </Button>
    </SettingsContainer>
  );
};

export default SettingsView;
