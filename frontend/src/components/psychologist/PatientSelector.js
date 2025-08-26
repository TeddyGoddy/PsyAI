import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiUser, FiPlus, FiSearch } from 'react-icons/fi';

const SelectorContainer = styled.div`
  background: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.border.light};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SelectorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 14px;
  margin-bottom: ${props => props.theme.spacing.md};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const PatientList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const PatientItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  transition: background-color 0.2s;
  background: ${props => props.selected ? props.theme.colors.primary + '20' : 'transparent'};
  
  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
  }
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PatientName = styled.span`
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
`;

const PatientStatus = styled.span`
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 12px;
  background: ${props => {
    switch (props.status) {
      case 'critical': return props.theme.colors.error + '20';
      case 'monitoring': return props.theme.colors.warning + '20';
      default: return props.theme.colors.success + '20';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'critical': return props.theme.colors.error;
      case 'monitoring': return props.theme.colors.warning;
      default: return props.theme.colors.success;
    }
  }};
`;

const NewPatientButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background: ${props => props.theme.colors.primary}dd;
  }
`;

const SelectedPatient = styled.div`
  background: ${props => props.theme.colors.primary}10;
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PatientSelector = ({ selectedPatient, onPatientSelect, onNewPatient }) => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/data/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data?.patients || []);
        const normalized = list.map(p => ({
          id: p.id,
          first_name: p.first_name ?? p.user?.first_name ?? p.User?.first_name ?? '',
          last_name: p.last_name ?? p.user?.last_name ?? p.User?.last_name ?? '',
          email: p.email ?? p.user?.email ?? p.User?.email ?? '',
          status: p.status ?? 'active',
        }));
        setPatients(normalized);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewPatient = () => {
    const name = prompt('Nome del nuovo paziente:');
    if (name) {
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      onNewPatient({
        first_name: firstName,
        last_name: lastName,
        status: 'stable'
      });
    }
  };

  return (
    <SelectorContainer>
      <SelectorHeader>
        <Title>
          <FiUser />
          Seleziona Paziente
        </Title>
        <NewPatientButton onClick={handleNewPatient}>
          <FiPlus size={14} />
          Nuovo
        </NewPatientButton>
      </SelectorHeader>
      
      <SearchInput
        type="text"
        placeholder="Cerca paziente..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <PatientList>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Caricamento pazienti...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            {searchTerm ? 'Nessun paziente trovato' : 'Nessun paziente registrato'}
          </div>
        ) : (
          filteredPatients.map(patient => (
            <PatientItem
              key={patient.id}
              selected={selectedPatient?.id === patient.id}
              onClick={() => onPatientSelect(patient)}
            >
              <PatientInfo>
                <FiUser size={16} />
                <PatientName>
                  {patient.first_name} {patient.last_name}
                </PatientName>
                <PatientStatus status={patient.status}>
                  {patient.status}
                </PatientStatus>
              </PatientInfo>
            </PatientItem>
          ))
        )}
      </PatientList>
      
      {selectedPatient && (
        <SelectedPatient>
          <FiUser />
          <strong>Paziente selezionato:</strong> {selectedPatient.first_name} {selectedPatient.last_name}
        </SelectedPatient>
      )}
    </SelectorContainer>
  );
};

export default PatientSelector;
