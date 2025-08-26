import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.text.light};
  padding: ${props => props.theme.spacing.xl} 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <p>&copy; 2024 PsyAI - Intelligenza Artificiale per il Supporto Psicologico</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          ⚠️ Strumento di supporto - Non sostituisce il giudizio clinico professionale
        </p>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
