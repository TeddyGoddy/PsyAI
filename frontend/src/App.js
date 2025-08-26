import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import GlobalStyles from './styles/GlobalStyles';
import theme from './styles/theme';
import Login from './pages/Login';
import Home from './pages/Home';
import PsychologistDashboard from './pages/PsychologistDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PatientSelection from './pages/PatientSelection';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Register from './pages/Register';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider>
        <PatientProvider>
          <Router>
            <div className="App" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
              <Header />
              <main style={{ width: '100%', height: '100%', margin: 0, padding: 0 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route 
                    path="/patient-selection" 
                    element={
                      <ProtectedRoute requiredUserType="psychologist">
                        <PatientSelection />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/psychologist/*" 
                    element={
                      <ProtectedRoute requiredUserType="psychologist">
                        <PsychologistDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/patient/*" 
                    element={
                      <ProtectedRoute requiredUserType="patient">
                        <PatientDashboard />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </PatientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
