import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginContainer = styled.div`
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
`;

const LoginCard = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.xxl};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  width: 100%;
  max-width: 400px;
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

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${props => props.theme.colors.primary};
`;

const CheckboxLabel = styled.label`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.875rem;
  cursor: pointer;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  background: ${props => props.theme.colors.error}20;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.875rem;
  text-align: center;
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.secondary};
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const wasRemembered = localStorage.getItem('rememberMe') === 'true';
    
    if (wasRemembered && savedEmail) {
      setFormData({
        email: savedEmail,
        password: savedPassword || ''
      });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await login(formData.email, formData.password);
      console.log('Login successful:', response);
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        localStorage.setItem('rememberedPassword', formData.password);
        localStorage.setItem('rememberMe', 'true');
        
        // Set token expiration to 30 days if remember me is checked
        const token = response.token;
        const expirationTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000); // 30 days
        localStorage.setItem('tokenExpiration', expirationTime.toString());
      } else {
        // Clear saved credentials
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem('rememberMe');
        
        // Set token expiration to 24 hours
        const expirationTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
        localStorage.setItem('tokenExpiration', expirationTime.toString());
      }
      
      // Redirect based on user type (backend returns user.userType)
      if (response.user.userType === 'psychologist') {
        navigate('/patient-selection');
      } else {
        navigate('/patient');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Errore durante il login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>Accedi a PsyAI</Title>
        <Form onSubmit={handleSubmit}>
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
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <CheckboxLabel htmlFor="rememberMe">
              Ricorda le credenziali
            </CheckboxLabel>
          </CheckboxContainer>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </Button>
        </Form>
        <LinkText>
          Non hai un account? <Link to="/register">Registrati qui</Link>
        </LinkText>
        <LinkText style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          <strong>Demo:</strong> usa email "demo@psyai.com" e password "password123"
        </LinkText>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
