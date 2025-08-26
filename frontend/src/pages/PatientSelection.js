import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiUser, FiPlus, FiSearch, FiArrowRight, FiTrash2, FiArchive, FiRotateCcw } from 'react-icons/fi';
import { usePatient } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 1.1rem;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.text.secondary};
`;

const PatientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 2rem;
`;

const ActionButton = styled.button`
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const DeleteButton = styled(ActionButton)`
  top: -8px;
  right: -8px;
  background: #dc2626;
  
  &:hover {
    background: #b91c1c;
  }
`;

const ArchiveButton = styled(ActionButton)`
  top: -8px;
  right: 20px;
  background: #f59e0b;
  
  &:hover {
    background: #d97706;
  }
`;

const RestoreButton = styled(ActionButton)`
  top: -8px;
  right: 20px;
  background: #10b981;
  
  &:hover {
    background: #059669;
  }
`;

const PatientCard = styled.div`
  background: white;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  &:hover ${DeleteButton}, &:hover ${ArchiveButton}, &:hover ${RestoreButton} {
    opacity: 1;
  }
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
`;

const PatientAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
`;

const PatientDetails = styled.div`
  flex: 1;
`;

const PatientName = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
`;

const PatientMeta = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.9rem;
  margin: 0;
`;

const PatientStats = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const Stat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const NewPatientCard = styled(PatientCard)`
  border: 2px dashed ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}05;
  }
`;

const NewPatientIcon = styled(FiPlus)`
  font-size: 2rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const NewPatientText = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
  margin: 0;
`;

const ArchivedSection = styled.div`
  width: 100%;
  max-width: 1200px;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid ${props => props.theme.colors.border};
`;

const ArchivedTitle = styled.h3`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ArchivedCard = styled(PatientCard)`
  opacity: 0.7;
  border-style: dashed;
  
  &:hover {
    opacity: 1;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
`;

const ModalTitle = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 1.5rem;
`;

const ConfirmModal = styled(Modal)``;

const ConfirmModalContent = styled(ModalContent)`
  max-width: 400px;
  text-align: center;
`;

const ConfirmTitle = styled.h3`
  color: #dc2626;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  font-weight: 600;
`;

const ConfirmMessage = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const ConfirmButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'danger' ? `
    background: #dc2626;
    color: white;
    
    &:hover {
      background: #b91c1c;
    }
  ` : props.variant === 'warning' ? `
    background: #f59e0b;
    color: white;
    
    &:hover {
      background: #d97706;
    }
  ` : `
    background: #f3f4f6;
    color: ${props.theme.colors.text.secondary};
    
    &:hover {
      background: #e5e7eb;
    }
  `}
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const PrimaryButton = styled(Button)`
  background: ${props => props.theme.colors.primary};
  color: white;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  border: 2px solid ${props => props.theme.colors.border};
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const PatientSelection = ({ onPatientSelected }) => {
  const { patients, fetchPatients, createPatient, selectPatient } = usePatient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [patientToArchive, setPatientToArchive] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [newPatientData, setNewPatientData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const activePatients = patients.filter(patient => patient.status === 'active');
  const archivedPatients = patients.filter(patient => patient.status === 'inactive');
  
  const filteredActivePatients = activePatients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredArchivedPatients = archivedPatients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientSelect = (patient) => {
    selectPatient(patient);
    navigate('/psychologist');
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      const patient = await createPatient(newPatientData);
      setShowNewPatientModal(false);
      setNewPatientData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: ''
      });
      handlePatientSelect(patient);
    } catch (error) {
      console.error('Error creating patient:', error);
      setErrorMsg(error?.message || 'Errore durante la creazione del paziente');
    }
  };

  const getPatientInitials = (patient) => {
    return `${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}`.toUpperCase();
  };

  const handleDeletePatient = (e, patient) => {
    e.stopPropagation();
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const handleArchivePatient = (e, patient) => {
    e.stopPropagation();
    setPatientToArchive(patient);
    setShowArchiveModal(true);
  };

  const confirmDeletePatient = async () => {
    if (!patientToDelete) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/patients/${patientToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchPatients(); // Refresh the list
        setShowDeleteModal(false);
        setPatientToDelete(null);
      } else {
        alert('Errore durante l\'eliminazione del paziente');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Errore durante l\'eliminazione del paziente');
    }
  };

  const confirmArchivePatient = async () => {
    if (!patientToArchive) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/patients/${patientToArchive.id}/archive`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchPatients(); // Refresh the list
        setShowArchiveModal(false);
        setPatientToArchive(null);
      } else {
        alert('Errore durante l\'archiviazione del paziente');
      }
    } catch (error) {
      console.error('Error archiving patient:', error);
      alert('Errore durante l\'archiviazione del paziente');
    }
  };

  const cancelDeletePatient = () => {
    setShowDeleteModal(false);
    setPatientToDelete(null);
  };

  const cancelArchivePatient = () => {
    setShowArchiveModal(false);
    setPatientToArchive(null);
  };

  const handleRestorePatient = async (e, patient) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/patients/${patient.id}/restore`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchPatients(); // Refresh the list
      } else {
        alert('Errore durante il ripristino del paziente');
      }
    } catch (error) {
      console.error('Error restoring patient:', error);
      alert('Errore durante il ripristino del paziente');
    }
  };

  return (
    <Container>
      <Header>
        <Title>Seleziona Paziente</Title>
        <Subtitle>Scegli un paziente per accedere alle sue analisi e documenti</Subtitle>
      </Header>

      <SearchContainer>
        <SearchIcon />
        <SearchInput
          type="text"
          placeholder="Cerca paziente per nome o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>

      <PatientGrid>
        <NewPatientCard onClick={() => setShowNewPatientModal(true)}>
          <NewPatientIcon />
          <NewPatientText>Nuovo Paziente</NewPatientText>
        </NewPatientCard>

        {filteredActivePatients.map(patient => (
          <PatientCard key={patient.id} onClick={() => handlePatientSelect(patient)}>
            <ArchiveButton onClick={(e) => handleArchivePatient(e, patient)}>
              <FiArchive />
            </ArchiveButton>
            <DeleteButton onClick={(e) => handleDeletePatient(e, patient)}>
              <FiTrash2 />
            </DeleteButton>
            <PatientInfo>
              <PatientAvatar>
                {getPatientInitials(patient)}
              </PatientAvatar>
              <PatientDetails>
                <PatientName>
                  {patient.first_name} {patient.last_name}
                </PatientName>
                <PatientMeta>
                  {patient.email} • {patient.status}
                </PatientMeta>
              </PatientDetails>
              <FiArrowRight color="#666" />
            </PatientInfo>
            <PatientStats>
              <Stat>
                <StatValue>0</StatValue>
                <StatLabel>Sessioni</StatLabel>
              </Stat>
              <Stat>
                <StatValue>0</StatValue>
                <StatLabel>Analisi</StatLabel>
              </Stat>
              <Stat>
                <StatValue>0</StatValue>
                <StatLabel>Documenti</StatLabel>
              </Stat>
            </PatientStats>
          </PatientCard>
        ))}
      </PatientGrid>

      {showNewPatientModal && (
        <Modal onClick={() => setShowNewPatientModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Nuovo Paziente</ModalTitle>
            <form onSubmit={handleCreatePatient}>
              <FormGroup>
                <Label>Nome</Label>
                <Input
                  type="text"
                  required
                  value={newPatientData.first_name}
                  onChange={(e) => setNewPatientData(prev => ({
                    ...prev,
                    first_name: e.target.value
                  }))}
                />
              </FormGroup>
              <FormGroup>
                <Label>Cognome</Label>
                <Input
                  type="text"
                  required
                  value={newPatientData.last_name}
                  onChange={(e) => setNewPatientData(prev => ({
                    ...prev,
                    last_name: e.target.value
                  }))}
                />
              </FormGroup>
              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  value={newPatientData.email}
                  onChange={(e) => setNewPatientData(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                />
              </FormGroup>
              <FormGroup>
                <Label>Telefono</Label>
                <Input
                  type="tel"
                  value={newPatientData.phone}
                  onChange={(e) => setNewPatientData(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))}
                />
              </FormGroup>
              <FormGroup>
                <Label>Data di Nascita</Label>
                <Input
                  type="date"
                  value={newPatientData.date_of_birth}
                  onChange={(e) => setNewPatientData(prev => ({
                    ...prev,
                    date_of_birth: e.target.value
                  }))}
                />
              </FormGroup>
              <ButtonGroup>
                <SecondaryButton type="button" onClick={() => setShowNewPatientModal(false)}>
                  Annulla
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={!newPatientData.first_name || !newPatientData.last_name || !newPatientData.email}>
                  Crea Paziente
                </PrimaryButton>
              </ButtonGroup>
              {errorMsg && (
                <div style={{ marginTop: '12px', color: '#d32f2f', fontSize: '0.9rem' }}>
                  {errorMsg}
                </div>
              )}
            </form>
          </ModalContent>
        </Modal>
      )}

      {showDeleteModal && patientToDelete && (
        <ConfirmModal onClick={cancelDeletePatient}>
          <ConfirmModalContent onClick={(e) => e.stopPropagation()}>
            <ConfirmTitle>Elimina Paziente</ConfirmTitle>
            <ConfirmMessage>
              Sei sicuro di voler eliminare <strong>{patientToDelete.first_name} {patientToDelete.last_name}</strong>?
              <br />
              Questa azione non può essere annullata e tutti i dati associati verranno persi definitivamente.
            </ConfirmMessage>
            <ConfirmButtons>
              <ConfirmButton onClick={cancelDeletePatient}>
                Annulla
              </ConfirmButton>
              <ConfirmButton variant="danger" onClick={confirmDeletePatient}>
                Elimina
              </ConfirmButton>
            </ConfirmButtons>
          </ConfirmModalContent>
        </ConfirmModal>
      )}

      {showArchiveModal && patientToArchive && (
        <ConfirmModal onClick={cancelArchivePatient}>
          <ConfirmModalContent onClick={(e) => e.stopPropagation()}>
            <ConfirmTitle style={{color: '#f59e0b'}}>Archivia Paziente</ConfirmTitle>
            <ConfirmMessage>
              Sei sicuro di voler archiviare <strong>{patientToArchive.first_name} {patientToArchive.last_name}</strong>?
              <br />
              Il paziente verrà nascosto dalla lista principale ma potrà essere ripristinato in seguito.
            </ConfirmMessage>
            <ConfirmButtons>
              <ConfirmButton onClick={cancelArchivePatient}>
                Annulla
              </ConfirmButton>
              <ConfirmButton variant="warning" onClick={confirmArchivePatient}>
                Archivia
              </ConfirmButton>
            </ConfirmButtons>
          </ConfirmModalContent>
        </ConfirmModal>
      )}

      {filteredArchivedPatients.length > 0 && (
        <ArchivedSection>
          <ArchivedTitle>
            <FiArchive />
            Pazienti Archiviati ({filteredArchivedPatients.length})
          </ArchivedTitle>
          <PatientGrid>
            {filteredArchivedPatients.map(patient => (
              <ArchivedCard key={patient.id} onClick={() => handlePatientSelect(patient)}>
                <RestoreButton onClick={(e) => handleRestorePatient(e, patient)}>
                  <FiRotateCcw />
                </RestoreButton>
                <DeleteButton onClick={(e) => handleDeletePatient(e, patient)}>
                  <FiTrash2 />
                </DeleteButton>
                <PatientInfo>
                  <PatientAvatar>
                    {getPatientInitials(patient)}
                  </PatientAvatar>
                  <PatientDetails>
                    <PatientName>
                      {patient.first_name} {patient.last_name}
                    </PatientName>
                    <PatientMeta>
                      {patient.email} • archiviato
                    </PatientMeta>
                  </PatientDetails>
                  <FiArrowRight color="#666" />
                </PatientInfo>
                <PatientStats>
                  <Stat>
                    <StatValue>0</StatValue>
                    <StatLabel>Sessioni</StatLabel>
                  </Stat>
                  <Stat>
                    <StatValue>0</StatValue>
                    <StatLabel>Analisi</StatLabel>
                  </Stat>
                  <Stat>
                    <StatValue>0</StatValue>
                    <StatLabel>Documenti</StatLabel>
                  </Stat>
                </PatientStats>
              </ArchivedCard>
            ))}
          </PatientGrid>
        </ArchivedSection>
      )}
    </Container>
  );
};

export default PatientSelection;
