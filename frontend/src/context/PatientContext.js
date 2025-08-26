import React, { createContext, useContext, useState, useEffect } from 'react';

const PatientContext = createContext();

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};

export const PatientProvider = ({ children }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load selected patient from localStorage on mount
  useEffect(() => {
    const savedPatient = localStorage.getItem('selectedPatient');
    if (savedPatient) {
      try {
        setSelectedPatient(JSON.parse(savedPatient));
      } catch (error) {
        console.error('Error parsing saved patient:', error);
        localStorage.removeItem('selectedPatient');
      }
    }
  }, []);

  // Save selected patient to localStorage when it changes
  useEffect(() => {
    if (selectedPatient) {
      localStorage.setItem('selectedPatient', JSON.stringify(selectedPatient));
    } else {
      localStorage.removeItem('selectedPatient');
    }
  }, [selectedPatient]);

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
        // Normalize to UI-expected shape
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

  const createPatient = async (patientData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/data/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(patientData)
      });
      
      if (!response.ok) {
        let message = 'Failed to create patient';
        try {
          const err = await response.json();
          message = err?.details || err?.error || message;
        } catch (_) {}
        throw new Error(message);
      }

      const result = await response.json();
      const newPatient = result.patient;
      setPatients(prev => [...prev, newPatient]);
      setSelectedPatient(newPatient);
      return newPatient;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const clearPatient = () => {
    setSelectedPatient(null);
  };

  const value = {
    selectedPatient,
    patients,
    loading,
    fetchPatients,
    createPatient,
    selectPatient,
    clearPatient
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};
