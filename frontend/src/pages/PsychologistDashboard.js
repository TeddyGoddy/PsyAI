import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MedicalLayout from '../components/layout/MedicalLayout';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import { FiUser, FiCalendar, FiAlertCircle, FiUsers, FiActivity, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import PatientProfile from '../components/psychologist/PatientProfile';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import RandomForest from '../visualizations/RandomForest';
import Timeline from '../visualizations/Timeline';
import ThematicMap from '../visualizations/ThematicMap';
import NetworkGraph from '../visualizations/NetworkGraph';
import DashboardView from '../components/psychologist/DashboardView';
import TextAnalysis from '../components/psychologist/TextAnalysis';
import DocumentAnalysis from '../components/psychologist/DocumentAnalysis';
import PatientsView from '../components/psychologist/PatientsView';
import Settings from './Settings';
import ReportGenerator from '../components/psychologist/ReportGenerator';

const DashboardContainer = styled.div`
  padding: 0;
  width: 100%;
  margin: 0;
  height: 100%;
  box-sizing: border-box;
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ActionButton = styled.button`
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    color: #1e293b;
    border-color: #cbd5e1;
  }

  &.settings {
    &:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }
  }
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.psychologist.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 1.1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FullWidth = styled.div`
  grid-column: 1 / -1;
`;

const DashboardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  min-height: 100%;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 8px;
  padding: 24px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: ${props => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const VisualizationSection = styled.section`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 8px;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  background: ${props => props.theme.colors.neutral[50]};
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const SectionContent = styled.div`
  padding: 24px;
`;

// Profile UI styles
const ProfileCard = styled.section`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 8px;
  overflow: hidden;
`;

const ProfileHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  background: ${props => props.theme.colors.neutral[50]};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ProfileTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const ProfileBody = styled.div`
  padding: 20px 24px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const ProfileTextarea = styled.textarea`
  width: 100%;
  min-height: 220px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border.light};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
`;

const SaveRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SaveButton = styled.button`
  padding: 10px 16px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  opacity: ${props => props.disabled ? 0.7 : 1};
`;

const StatusText = styled.span`
  font-size: 13px;
  color: ${props => props.error ? '#dc2626' : props.success ? '#16a34a' : props.theme.colors.text.secondary};
`;

const PsychologistDashboard = () => {
  const { user } = useAuth();
  const { selectedPatient } = usePatient();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('dashboard');

  // Profile state
  const [profileText, setProfileText] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileUpdatedAt, setProfileUpdatedAt] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [profileSavedAt, setProfileSavedAt] = useState(null);

  // Only redirect if we're not already on patient selection page
  useEffect(() => {
    if (!selectedPatient && window.location.pathname !== '/patient-selection') {
      navigate('/patient-selection');
    }
  }, [selectedPatient, navigate]);

  // Load psychological profile when patient changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!selectedPatient) return;
      setProfileLoading(true);
      setProfileError('');
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`/api/v1/patients/${selectedPatient.id}/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setProfileText(json?.data?.psychological_profile || '');
        setProfileUpdatedAt(json?.data?.updated_at || null);
      } catch (e) {
        setProfileError('Errore nel caricamento del profilo');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [selectedPatient]);

  const handleSaveProfile = async () => {
    if (!selectedPatient) return;
    setProfileSaving(true);
    setProfileError('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/v1/patients/${selectedPatient.id}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ psychological_profile: profileText })
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Errore salvataggio');
      setProfileUpdatedAt(json?.data?.updated_at || new Date().toISOString());
      setProfileSavedAt(new Date().toISOString());
    } catch (e) {
      setProfileError('Errore nel salvataggio del profilo');
    } finally {
      setProfileSaving(false);
      // Clear success after few seconds
      setTimeout(() => setProfileSavedAt(null), 3000);
    }
  };

  const mockForestData = [
    { id: 1, name: 'Ansia', value: 85, category: 'emotion', children: [
      { id: 11, name: 'Preoccupazione', value: 45, category: 'thought' },
      { id: 12, name: 'Tensione fisica', value: 40, category: 'physical' }
    ]},
    { id: 2, name: 'Depressione', value: 65, category: 'emotion', children: [
      { id: 21, name: 'Tristezza', value: 35, category: 'emotion' },
      { id: 22, name: 'Perdita interesse', value: 30, category: 'behavior' }
    ]},
    { id: 3, name: 'Stress', value: 75, category: 'emotion', children: [
      { id: 31, name: 'Pressione lavorativa', value: 50, category: 'external' },
      { id: 32, name: 'Difficoltà relazionali', value: 25, category: 'social' }
    ]}
  ];

  const mockTimelineData = [
    { date: '2024-01-15', mood: 6, anxiety: 7, energy: 5 },
    { date: '2024-01-30', mood: 5, anxiety: 8, energy: 4 },
    { date: '2024-02-15', mood: 7, anxiety: 4, energy: 6 }
  ];

  const mockThemes = [
    { name: 'ansia', frequency: 15, category: 'emotion', sentiment: 'negative' },
    { name: 'crescita', frequency: 8, category: 'behavior', sentiment: 'positive' },
    { name: 'relazioni', frequency: 12, category: 'thought', sentiment: 'mixed' },
    { name: 'lavoro', frequency: 10, category: 'event', sentiment: 'negative' }
  ];

  const handleNodeClick = (nodeData) => {
    console.log('Node clicked:', nodeData);
  };

  const statsData = [
    { label: 'Pazienti Attivi', value: '24', icon: FiUsers, color: '#1a365d' },
    { label: 'Sessioni Oggi', value: '8', icon: FiActivity, color: '#4fd1c7' },
    { label: 'Analisi Completate', value: '156', icon: FiBarChart2, color: '#38a169' },
    { label: 'Miglioramento Medio', value: '+12%', icon: FiTrendingUp, color: '#d69e2e' }
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'analytics':
        return <TextAnalysis />;
      case 'documents':
        return <DocumentAnalysis />;
      case 'patients':
        return <PatientsView />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <DashboardContainer>
            <ProfileCard>
              <ProfileBody>
                {!profileLoading && profileUpdatedAt && (
                  <div style={{ textAlign: 'right', color: '#64748b', fontSize: 12 }}>
                    {`Ultimo aggiornamento: ${new Date(profileUpdatedAt).toLocaleString()}`}
                  </div>
                )}
                {profileLoading && (
                  <StatusText>Caricamento...</StatusText>
                )}
                <PatientProfile />
              </ProfileBody>
            </ProfileCard>
          </DashboardContainer>
        );
    }
  };

  return (
    <MedicalLayout 
      activeView={currentView}
      onViewChange={setCurrentView}
      user={user}
    >
      {renderCurrentView()}
    </MedicalLayout>
  );
};

export default PsychologistDashboard;
