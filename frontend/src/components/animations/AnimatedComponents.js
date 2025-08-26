import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiLoader, FiCheck, FiZap, FiCpu, FiEye, FiHeart } from 'react-icons/fi';

// Professional Keyframe Animations
const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 0 8px rgba(79, 70, 229, 0.2);
    transform: scale(1.02);
  }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const particleFloat = keyframes`
  0% { 
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% { 
    opacity: 1;
  }
  90% { 
    opacity: 1;
  }
  100% { 
    transform: translateY(-80px) rotate(180deg);
    opacity: 0;
  }
`;

const revealCard = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

// Professional Styled Components
const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  color: #1e293b;
  position: relative;
  overflow: hidden;
  min-height: 180px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.05);
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  margin: 20px 0;
  width: 100%;
  max-width: 800px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  opacity: ${props => props.active ? 1 : props.completed ? 0.9 : 0.5};
  transform: ${props => props.active ? 'translateY(-4px)' : 'translateY(0)'};
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 16px 12px;
  border-radius: 12px;
  background: ${props => props.active ? 'rgba(79, 70, 229, 0.04)' : 'transparent'};
  position: relative;
  min-width: 120px;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -16px;
    width: 16px;
    height: 2px;
    background: ${props => props.completed ? '#10b981' : props.active ? '#4f46e5' : '#e2e8f0'};
    transform: translateY(-50%);
    display: ${props => props.isLast ? 'none' : 'block'};
  }
  
  .step-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${props => props.completed ? 'linear-gradient(135deg, #10b981, #059669)' : props.active ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#f1f5f9'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => (props.completed || props.active) ? 'white' : '#64748b'};
    font-size: 14px;
    box-shadow: ${props => props.active ? '0 0 0 4px rgba(79, 70, 229, 0.1)' : props.completed ? '0 0 0 4px rgba(16, 185, 129, 0.1)' : 'none'};
    animation: ${props => props.active ? pulseGlow : 'none'} 2s infinite;
    flex-shrink: 0;
    border: 2px solid ${props => props.active ? 'rgba(79, 70, 229, 0.2)' : props.completed ? 'rgba(16, 185, 129, 0.2)' : 'transparent'};
  }
  
  .step-text {
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.active ? '#4f46e5' : props.completed ? '#059669' : '#64748b'};
    line-height: 1.4;
    letter-spacing: -0.01em;
    text-align: center;
    max-width: 100px;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  margin-top: 32px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%);
  background-size: 200% 100%;
  border-radius: 4px;
  width: ${props => props.progress}%;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${shimmer} 2s infinite ease-in-out;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
    animation: ${shimmer} 1.5s infinite ease-in-out;
  }
`;

const ParticlesContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
`;

const Particle = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 50%;
  animation: ${particleFloat} 4s infinite ease-out;
  animation-delay: ${props => props.delay}s;
  opacity: 0.7;
`;

const LoadingText = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  text-align: center;
  letter-spacing: -0.02em;
`;

const LoadingSubtext = styled.div`
  font-size: 15px;
  color: #64748b;
  text-align: center;
  margin-bottom: 8px;
  font-weight: 500;
`;

const ProgressText = styled.div`
  font-size: 13px;
  color: #94a3b8;
  text-align: center;
  margin-top: 12px;
  font-weight: 500;
`;

// Reveal Card Animation
const AnimatedCard = styled.div`
  animation: ${revealCard} 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: ${props => props.delay || 0}ms;
  opacity: 0;
  transform: translateY(20px) scale(0.98);
`;

// Main Component
export const AdvancedLoader = ({ 
  currentStep = 0, 
  progress = 0, 
  steps = [], 
  showParticles = true,
  title = "Analisi in corso...",
  subtitle = "L'AI sta elaborando i dati psicologici"
}) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (showParticles) {
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        delay: i * 0.5,
        left: 20 + Math.random() * 60,
      }));
      setParticles(newParticles);
    }
  }, [showParticles]);

  return (
    <LoaderContainer>
      {showParticles && (
        <ParticlesContainer>
          {particles.map(particle => (
            <Particle
              key={particle.id}
              delay={particle.delay}
              style={{ left: `${particle.left}%` }}
            />
          ))}
        </ParticlesContainer>
      )}
      
      <LoadingText>{title}</LoadingText>
      <LoadingSubtext>{subtitle}</LoadingSubtext>
      
      <StepsContainer>
        {steps.map((step, index) => (
          <StepItem
            key={index}
            active={index === currentStep}
            completed={index < currentStep}
            isLast={index === steps.length - 1}
          >
            <div className="step-icon">
              {index < currentStep ? <FiCheck /> : step.icon}
            </div>
            <div className="step-text">{step.text}</div>
          </StepItem>
        ))}
      </StepsContainer>

      <ProgressBar>
        <ProgressFill progress={progress} />
      </ProgressBar>

      <ProgressText>
        {Math.round(progress)}% completato
      </ProgressText>
    </LoaderContainer>
  );
};

export const RevealCard = ({ children, delay = 0, ...props }) => {
  return (
    <AnimatedCard delay={delay} {...props}>
      {children}
    </AnimatedCard>
  );
};

// Analysis Steps Configuration
export const ANALYSIS_STEPS = [
  { text: "Inizializzazione AI", icon: <FiCpu size={16} /> },
  { text: "Elaborazione testo", icon: <FiEye size={16} /> },
  { text: "Analisi psicologica", icon: <FiHeart size={16} /> },
  { text: "Generazione insights", icon: <FiZap size={16} /> },
  { text: "Finalizzazione", icon: <FiCheck size={16} /> }
];

export default {
  AdvancedLoader,
  RevealCard,
  ANALYSIS_STEPS
};
