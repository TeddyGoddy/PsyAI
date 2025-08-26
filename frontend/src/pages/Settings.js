import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSettings, FiUser, FiEye, FiDatabase, FiShield, FiSave, FiCode } from 'react-icons/fi';
// import LanguageSettings from '../components/settings/LanguageSettings';

const SettingsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
`;

const Title = styled.h1`
  margin: 0;
  color: #1e293b;
  font-size: 28px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 8px 0 0 0;
  color: #64748b;
  font-size: 16px;
`;

const SettingsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SettingCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
`;

const CardDescription = styled.p`
  margin: 4px 0 0 0;
  color: #64748b;
  font-size: 14px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 8px;
`;

const Button = styled.button`
  background: #4f46e5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #4338ca;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SaveStatus = styled.span`
  margin-left: 12px;
  font-size: 14px;
  color: ${props => props.success ? '#16a34a' : props.error ? '#dc2626' : '#6b7280'};
`;

const Settings = () => {
  const [settings, setSettings] = useState({
    displayName: '',
    email: '',
    theme: 'light',
    language: 'italiano',
    autoSave: true,
    showAdvancedAnalysis: true,
    enableNotifications: true,
    dataRetention: '1year',
    exportFormat: 'pdf',
    // Developer settings
    geminiModel: 'gemini-2.5-flash',
    enhancedGeminiModel: 'gemini-2.5-pro',
    debugMode: false,
    showDeveloperOptions: false
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/v1/users/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('');
    
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/v1/users/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      });
      
      if (res.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <SettingsContainer>
        <Header>
          <FiSettings size={32} color="#4f46e5" />
          <div>
            <Title>Impostazioni</Title>
            <Subtitle>Configura le tue preferenze per l'analisi AI e l'interfaccia</Subtitle>
          </div>
        </Header>

        <SettingsGrid>
          {/* Profile Settings */}
          <SettingCard>
          <CardHeader>
            <FiUser color="#4f46e5" />
            <div>
              <CardTitle>Profilo Utente</CardTitle>
              <CardDescription>Gestisci le informazioni del tuo account</CardDescription>
            </div>
          </CardHeader>
          
          <FormGroup>
            <Label>Nome Visualizzato</Label>
            <Input
              value={settings.displayName}
              onChange={e => updateSetting('displayName', e.target.value)}
              placeholder="Il tuo nome"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              value={settings.email}
              onChange={e => updateSetting('email', e.target.value)}
              placeholder="tua@email.com"
            />
          </FormGroup>
        </SettingCard>

          {/* Interface Settings */}
          <SettingCard>
          <CardHeader>
            <FiEye color="#4f46e5" />
            <div>
              <CardTitle>Interfaccia</CardTitle>
              <CardDescription>Personalizza l'aspetto e il comportamento dell'applicazione</CardDescription>
            </div>
          </CardHeader>
          
          <FormGroup>
            <Label>Tema</Label>
            <Select
              value={settings.theme}
              onChange={e => updateSetting('theme', e.target.value)}
            >
              <option value="light">Chiaro</option>
              <option value="dark">Scuro</option>
              <option value="auto">Automatico</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Lingua AI</Label>
            <Select
              value={settings.language}
              onChange={e => updateSetting('language', e.target.value)}
            >
              <option value="italiano">Italiano</option>
              <option value="english">English</option>
              <option value="francais">Français</option>
              <option value="espanol">Español</option>
            </Select>
          </FormGroup>
          
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={settings.autoSave}
              onChange={e => updateSetting('autoSave', e.target.checked)}
            />
            Salvataggio automatico delle modifiche
          </CheckboxLabel>
          
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={settings.showAdvancedAnalysis}
              onChange={e => updateSetting('showAdvancedAnalysis', e.target.checked)}
            />
            Mostra opzioni di analisi avanzate
          </CheckboxLabel>
          
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={e => updateSetting('enableNotifications', e.target.checked)}
            />
            Abilita notifiche
          </CheckboxLabel>
        </SettingCard>

          {/* Data Settings */}
          <SettingCard>
          <CardHeader>
            <FiDatabase color="#4f46e5" />
            <div>
              <CardTitle>Gestione Dati</CardTitle>
              <CardDescription>Configura come vengono gestiti i tuoi dati</CardDescription>
            </div>
          </CardHeader>
          
          <FormGroup>
            <Label>Conservazione Dati</Label>
            <Select
              value={settings.dataRetention}
              onChange={e => updateSetting('dataRetention', e.target.value)}
            >
              <option value="3months">3 Mesi</option>
              <option value="6months">6 Mesi</option>
              <option value="1year">1 Anno</option>
              <option value="2years">2 Anni</option>
              <option value="indefinite">Indefinita</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Formato Export</Label>
            <Select
              value={settings.exportFormat}
              onChange={e => updateSetting('exportFormat', e.target.value)}
            >
              <option value="pdf">PDF</option>
              <option value="docx">Word (.docx)</option>
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </Select>
          </FormGroup>
        </SettingCard>

          {/* Privacy Settings */}
          <SettingCard>
          <CardHeader>
            <FiShield color="#4f46e5" />
            <div>
              <CardTitle>Privacy e Sicurezza</CardTitle>
              <CardDescription>Gestisci le impostazioni di privacy e sicurezza</CardDescription>
            </div>
          </CardHeader>
          
          <CheckboxLabel>
            <Checkbox type="checkbox" defaultChecked />
            Crittografia end-to-end per i dati sensibili
          </CheckboxLabel>
          
          <CheckboxLabel>
            <Checkbox type="checkbox" defaultChecked />
            Anonimizzazione automatica dei dati esportati
          </CheckboxLabel>
          
          <CheckboxLabel>
            <Checkbox type="checkbox" />
            Condividi dati anonimi per migliorare l'AI (opzionale)
          </CheckboxLabel>
        </SettingCard>

          {/* Developer Settings */}
          <SettingCard>
          <CardHeader>
            <FiCode color="#4f46e5" />
            <div>
              <CardTitle>Impostazioni Developer</CardTitle>
              <CardDescription>Configurazioni avanzate per sviluppatori e testing</CardDescription>
            </div>
          </CardHeader>
          
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={settings.showDeveloperOptions}
              onChange={e => updateSetting('showDeveloperOptions', e.target.checked)}
            />
            Mostra opzioni developer
          </CheckboxLabel>
          
          {settings.showDeveloperOptions && (
            <>
              <FormGroup>
                <Label>Modello Gemini Principale</Label>
                <Select
                  value={settings.geminiModel}
                  onChange={e => updateSetting('geminiModel', e.target.value)}
                >
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Migliore qualità)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Best price-performance)</option>
                  <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite (Più veloce)</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Modello Gemini Avanzato</Label>
                <Select
                  value={settings.enhancedGeminiModel}
                  onChange={e => updateSetting('enhancedGeminiModel', e.target.value)}
                >
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Migliore qualità)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Best price-performance)</option>
                  <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite (Più veloce)</option>
                </Select>
              </FormGroup>
              
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={settings.debugMode}
                  onChange={e => updateSetting('debugMode', e.target.checked)}
                />
                Modalità debug AI (log dettagliati)
              </CheckboxLabel>
              
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#dcfce7', borderRadius: '6px', fontSize: '14px', color: '#166534' }}>
                <strong>✅ Info:</strong> Le modifiche ai modelli AI vengono applicate immediatamente senza riavvio.
              </div>
            </>
          )}
        </SettingCard>

          {/* Save Button */}
          <div>
          <Button onClick={handleSave} disabled={saving}>
            <FiSave />
            {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
          </Button>
          
          {saveStatus && (
            <SaveStatus success={saveStatus === 'success'} error={saveStatus === 'error'}>
              {saveStatus === 'success' ? 'Impostazioni salvate!' : 'Errore nel salvataggio'}
            </SaveStatus>
          )}
          </div>
        </SettingsGrid>
      </SettingsContainer>
    </>
  );
};

export default Settings;
