import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiFilter, FiCalendar, FiUser, FiArchive, FiTrash2, FiRotateCcw } from 'react-icons/fi';

const PatientsContainer = styled.div`
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background.primary};
  min-height: 100vh;
`;

// Removed inner Header/Title to rely on the main page header

const Controls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

// SearchInput removed - using inline styles instead

const FilterButton = styled.button`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.md};
  background: white;
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

const AddButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.medical.secondary};
  }
`;

const PatientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const PatientCard = styled.div`
  background: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.border.light};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all 0.2s ease;
  position: relative;
  opacity: ${props => props.archived ? 0.6 : 1};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
  }
  border: 1px solid ${props => props.theme.colors.border.light};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const PatientHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
`;

const PatientInfo = styled.div`
  flex: 1;
`;

const PatientName = styled.h3`
  margin: 0 0 4px 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
  font-weight: 600;
`;

const PatientEmail = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'active': return props.theme.colors.success + '20';
      case 'inactive': return props.theme.colors.text.secondary + '20';
      case 'on_hold': return props.theme.colors.warning + '20';
      default: return props.theme.colors.text.secondary + '20';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return props.theme.colors.success;
      case 'inactive': return props.theme.colors.text.secondary;
      case 'on_hold': return props.theme.colors.warning;
      default: return props.theme.colors.text.secondary;
    }
  }};
`;

const PatientStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${props => props.theme.spacing.md};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const Stat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.text.secondary};
`;

const PatientActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid ${props => 
    props.delete ? '#dc2626' : 
    props.archive ? '#f59e0b' : '#e5e7eb'};
  border-radius: 6px;
  background: ${props => 
    props.delete ? '#fef2f2' : 
    props.archive ? '#fffbeb' : 'white'};
  color: ${props => 
    props.delete ? '#dc2626' : 
    props.archive ? '#f59e0b' : '#374151'};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => 
      props.delete ? '#fee2e2' : 
      props.archive ? '#fef3c7' : '#f9fafb'};
  }
`;

const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const DialogTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
`;

const DialogMessage = styled.p`
  margin: 0 0 20px 0;
  color: #6b7280;
  line-height: 1.5;
`;

const DialogActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const DialogButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${props => 
    props.primary ? '#4f46e5' : 
    props.danger ? '#dc2626' : '#d1d5db'};
  border-radius: 6px;
  background: ${props => 
    props.primary ? '#4f46e5' : 
    props.danger ? '#dc2626' : 'white'};
  color: ${props => 
    props.primary || props.danger ? 'white' : '#374151'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

const PatientsView = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: '', patientId: '', restore: false });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/data/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return 'Mai';
    return new Date(date).toLocaleDateString('it-IT');
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'inactive': return 'Inattivo';
      case 'on_hold': return 'In pausa';
      case 'completed': return 'Completato';
      default: return status;
    }
  };

  const handleArchivePatient = (patientId, restore = false) => {
    setConfirmAction({ type: 'archive', patientId, restore });
    setShowConfirmDialog(true);
  };

  const handleDeletePatient = (patientId) => {
    setConfirmAction({ type: 'delete', patientId, restore: false });
    setShowConfirmDialog(true);
  };

  const confirmPatientAction = async () => {
    const { type, patientId, restore } = confirmAction;
    
    try {
      const token = localStorage.getItem('authToken');
      let endpoint, method;
      
      if (type === 'delete') {
        endpoint = `/api/v1/patients/${patientId}`;
        method = 'DELETE';
      } else {
        endpoint = `/api/v1/patients/${patientId}/${restore ? 'restore' : 'archive'}`;
        method = 'PUT';
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Refresh patients list
        fetchPatients();
      } else {
        console.error('Action failed');
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setShowConfirmDialog(false);
    }
  };

  if (loading) {
    return (
      <PatientsContainer>
        <div>Caricamento pazienti...</div>
      </PatientsContainer>
    );
  }

  return (
    <PatientsContainer>
      <Controls>
        <input
          type="text"
          placeholder="Cerca pazienti per nome o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '14px',
            background: 'white'
          }}
        />
        <FilterButton>
          <FiFilter />
          Filtri
        </FilterButton>
        <AddButton>
          <FiPlus />
          Nuovo Paziente
        </AddButton>
      </Controls>

      {filteredPatients.length === 0 ? (
        <EmptyState>
          <FiUser size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <h3>Nessun paziente trovato</h3>
          <p>
            {searchTerm 
              ? 'Nessun paziente corrisponde ai criteri di ricerca.'
              : 'Non hai ancora pazienti assegnati. Aggiungi il tuo primo paziente per iniziare.'
            }
          </p>
        </EmptyState>
      ) : (
        <PatientsGrid>
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.id} archived={patient.status === 'inactive'}>
              <PatientHeader>
                <Avatar>
                  {getInitials(patient.user?.first_name, patient.user?.last_name)}
                </Avatar>
                <PatientInfo>
                  <PatientName>
                    {patient.user?.first_name} {patient.user?.last_name}
                  </PatientName>
                  <PatientEmail>{patient.user?.email}</PatientEmail>
                </PatientInfo>
                <StatusBadge status={patient.status}>
                  {getStatusLabel(patient.status)}
                </StatusBadge>
              </PatientHeader>

              {patient.therapyGoals && (
                <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                  <strong>Obiettivi:</strong> {patient.therapyGoals.substring(0, 100)}
                  {patient.therapyGoals.length > 100 && '...'}
                </div>
              )}

              <PatientStats>
                <Stat>
                  <StatValue>{patient.sessionCount || 0}</StatValue>
                  <StatLabel>Sessioni</StatLabel>
                </Stat>
                <Stat>
                  <StatValue>
                    <FiCalendar size={16} />
                  </StatValue>
                  <StatLabel>Ultima: {formatDate(patient.lastSession)}</StatLabel>
                </Stat>
                <Stat>
                  <StatValue>{Math.floor(Math.random() * 30) + 1}</StatValue>
                  <StatLabel>Giorni</StatLabel>
                </Stat>
              </PatientStats>
              
              <PatientActions>
                <ActionButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchivePatient(patient.id, patient.status === 'inactive');
                  }}
                  archive={patient.status === 'inactive'}
                >
                  {patient.status === 'inactive' ? (
                    <><FiRotateCcw /> Ripristina</>
                  ) : (
                    <><FiArchive /> Archivia</>
                  )}
                </ActionButton>
                
                <ActionButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePatient(patient.id);
                  }}
                  delete
                >
                  <FiTrash2 /> Elimina
                </ActionButton>
              </PatientActions>
            </PatientCard>
          ))}
        </PatientsGrid>
      )}
      
      {showConfirmDialog && (
        <ConfirmDialog>
          <DialogContent>
            <DialogTitle>{confirmAction.type === 'delete' ? 'Elimina Paziente' : 'Archivia Paziente'}</DialogTitle>
            <DialogMessage>
              {confirmAction.type === 'delete' 
                ? 'Sei sicuro di voler eliminare definitivamente questo paziente? Questa azione non può essere annullata.'
                : confirmAction.restore
                ? 'Vuoi ripristinare questo paziente?'
                : 'Vuoi archiviare questo paziente? Potrà essere ripristinato in seguito.'}
            </DialogMessage>
            <DialogActions>
              <DialogButton onClick={() => setShowConfirmDialog(false)}>Annulla</DialogButton>
              <DialogButton 
                primary={confirmAction.type !== 'delete'}
                danger={confirmAction.type === 'delete'}
                onClick={confirmPatientAction}
              >
                {confirmAction.type === 'delete' ? 'Elimina' : confirmAction.restore ? 'Ripristina' : 'Archivia'}
              </DialogButton>
            </DialogActions>
          </DialogContent>
        </ConfirmDialog>
      )}
    </PatientsContainer>
  );
};

export default PatientsView;
