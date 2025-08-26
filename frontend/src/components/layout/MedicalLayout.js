import React, { useState } from 'react';
import styled from 'styled-components';
import { FiHome, FiBarChart2, FiFileText, FiUsers, FiSettings, FiUpload, FiFilter, FiDownload, FiMessageSquare, FiUser } from 'react-icons/fi';
import { usePatient } from '../../context/PatientContext';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background: ${props => props.theme.colors.background};
  font-family: ${props => props.theme.typography.fontFamily};
  margin: 0;
  padding: 0;
  overflow: hidden;
`;

const HeaderTag = styled.span`
  padding: 6px 10px;
  background: ${props => props.theme.colors.neutral[50]};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 999px;
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const Sidebar = styled.nav`
  width: 250px;
  background: ${props => props.theme.colors.sidebar};
  box-shadow: ${props => props.theme.shadows.sidebar};
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
`;

const SidebarHeader = styled.div`
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  color: ${props => props.theme.colors.text.inverse};
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.025em;
`;

const LogoSubtext = styled.div`
  color: ${props => props.theme.colors.accent};
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const SidebarNav = styled.ul`
  flex: 1;
  padding: 24px 0;
  list-style: none;
  margin: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const NavLink = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: none;
  border: none;
  color: ${props => props.active ? props.theme.colors.accent : 'rgba(255, 255, 255, 0.8)'};
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: ${props => props.theme.colors.accent};
  }

  ${props => props.active && `
    background: rgba(79, 209, 199, 0.1);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: ${props.theme.colors.accent};
    }
  `}

  svg {
    width: 18px;
    height: 18px;
  }
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  padding: 0 32px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
`;

const HeaderTitle = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const HeaderButton = styled.button`
  padding: 8px 12px;
  background: transparent;
  border: 1px solid ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primary};
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  background: ${props => props.theme.colors.neutral[50]};
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

const UserName = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 500;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  min-height: calc(100vh - 64px);
`;

const MainPanel = styled.main`
  flex: 1;
  padding: 24px;
  background: ${props => props.theme.colors.background};
  overflow-y: auto;
  width: 100%;
  height: calc(100vh - 64px);
  box-sizing: border-box;
`;

const RightPanel = styled.aside`
  width: 320px;
  background: ${props => props.theme.colors.surface};
  border-left: 1px solid ${props => props.theme.colors.border.light};
  padding: 24px;
  overflow-y: auto;
`;

const UploadSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UploadArea = styled.div`
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  background: #f8fafc;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }
`;

const PanelSection = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PanelTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const PanelButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${props => props.theme.colors.neutral[50]};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 6px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;

  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
    border-color: ${props => props.theme.colors.border.medium};
  }

  &:last-child {
    margin-bottom: 0;
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const PatientInfo = styled.div`
  padding: 1rem;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const PatientName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const PatientMeta = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 1rem;
`;

const ChangePatientButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primary};
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
  }
`;

const MedicalLayout = ({ children, activeView, onViewChange, user }) => {
  const { selectedPatient, clearPatient } = usePatient();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!selectedPatient) {
      alert('Nessun paziente selezionato');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File troppo grande. Massimo 10MB.');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('patient_id', selectedPatient.id);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/analysis/document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Documento analizzato per ${selectedPatient.first_name} ${selectedPatient.last_name}!`);
        window.location.reload();
      } else {
        throw new Error('Errore nel caricamento');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Errore nel caricamento del documento');
    }
  };

  const handleChangePatient = () => {
    clearPatient();
    window.location.href = '/patient-selection';
  };


  const handleViewChange = (viewId) => {
    onViewChange(viewId);
  };

  const currentView = activeView;

  const navItems = [
    { id: 'dashboard', label: 'Profile', icon: FiHome },
    { id: 'analytics', label: 'Analisi', icon: FiBarChart2 },
    { id: 'documents', label: 'Archivio', icon: FiFileText },
    { id: 'settings', label: 'Impostazioni', icon: FiSettings }
  ];

  return (
    <LayoutContainer>
      <Sidebar>
        <SidebarHeader>
          <Logo>PsyAI</Logo>
          <LogoSubtext>Medical Platform</LogoSubtext>
        </SidebarHeader>
        
        <SidebarNav>
          {navItems.map(item => (
            <NavItem key={item.id}>
              <NavLink
                active={currentView === item.id}
                onClick={() => handleViewChange(item.id)}
              >
                <item.icon />
                {item.label}
              </NavLink>
            </NavItem>
          ))}
        </SidebarNav>
      </Sidebar>

      <MainContent>
        <Header>
          <HeaderTitle>
            {navItems.find(item => item.id === currentView)?.label || 'Dashboard'}
          </HeaderTitle>
          <HeaderActions>
            {selectedPatient && (
              <>
                <HeaderTag>
                  Paziente: {selectedPatient.first_name} {selectedPatient.last_name}
                </HeaderTag>
                <HeaderButton onClick={handleChangePatient}>Cambia Paziente</HeaderButton>
              </>
            )}
            <UserInfo>
              <UserAvatar>
                {user?.first_name?.[0] || 'U'}
              </UserAvatar>
              <UserName>
                {user?.first_name} {user?.last_name}
              </UserName>
            </UserInfo>
          </HeaderActions>
        </Header>

        <ContentArea>
          <MainPanel>
            {children}
          </MainPanel>
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default MedicalLayout;
