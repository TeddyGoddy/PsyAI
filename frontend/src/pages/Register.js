import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterContainer = styled.div`
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
`;

const RegisterCard = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.xxl};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  width: 100%;
  max-width: 500px;
`;

const Title = styled.h2`
  text-align: center;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.text.light};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.text.light};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  background: white;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.secondary};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.text.light};
    cursor: not-allowed;
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.secondary};
`;

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    userType: 'patient',
    licenseNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await register(formData);
      console.log('Registration successful:', response);
      
      // Redirect based on user type
      if (response.user.userType === 'psychologist') {
        navigate('/psychologist');
      } else {
        navigate('/patient');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.details || error.response?.data?.error || 'Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Title>Registrati su PsyAI</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="firstName"
            placeholder="Nome"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <Input
            type="text"
            name="lastName"
            placeholder="Cognome"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Password (min 8 caratteri)"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
          />
          <Select
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            required
          >
            <option value="patient">Paziente</option>
            <option value="psychologist">Psicologo</option>
          </Select>
          {formData.userType === 'psychologist' && (
            <Input
              type="text"
              name="licenseNumber"
              placeholder="Numero di licenza professionale"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
            />
          )}
          {error && (
            <div style={{ color: '#dc2626', marginBottom: '1rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </Button>
        </Form>
        <LinkText>
          Hai già un account? <Link to="/login">Accedi qui</Link>
        </LinkText>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
