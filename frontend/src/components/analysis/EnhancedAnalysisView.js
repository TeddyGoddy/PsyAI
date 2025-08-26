import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Brain, Heart, Shield, Users, AlertTriangle, 
  TrendingUp, Activity, Layers, Link, ChevronDown, ChevronRight,
  FileText, BarChart3, Network, Lightbulb, Target, Clock
} from 'lucide-react';
import PsychologicalAssessmentDashboard from '../charts/ProfessionalAssessmentCharts';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  border-radius: 16px;
  margin-bottom: 32px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  opacity: 0.95;
`;

const NavigationTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  background: white;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#4b5563'};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.active ? 
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
      '#f3f4f6'};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.12);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f3f4f6;
`;

const SectionIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: ${props => props.color || '#667eea'};
  color: white;

  svg {
    width: 22px;
    height: 22px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
`;

const Badge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.color || '#e5e7eb'};
  color: ${props => props.textColor || '#4b5563'};
`;

const ContentBlock = styled.div`
  color: #4b5563;
  line-height: 1.7;
  font-size: 0.95rem;
`;

const Accordion = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
`;

const AccordionHeader = styled.button`
  width: 100%;
  padding: 16px;
  background: ${props => props.open ? '#f9fafb' : 'white'};
  border: none;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
  text-align: left;

  &:hover {
    background: #f9fafb;
  }
`;

const AccordionContent = styled.div`
  padding: ${props => props.open ? '16px' : '0 16px'};
  max-height: ${props => props.open ? '1000px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  border-top: ${props => props.open ? '1px solid #e5e7eb' : 'none'};
`;

const InsightCard = styled.div`
  background: linear-gradient(135deg, ${props => props.gradient || '#667eea 0%, #764ba2 100%'});
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const ConnectionLine = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 0.9rem;

  .source {
    font-weight: 600;
    color: #4c1d95;
  }

  .arrow {
    color: #9ca3af;
  }

  .target {
    font-weight: 600;
    color: #1e40af;
  }

  .type {
    margin-left: auto;
    padding: 2px 8px;
    background: white;
    border-radius: 4px;
    font-size: 0.75rem;
    color: #6b7280;
  }
`;

const MetricCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: ${props => props.background || '#f3f4f6'};
  border-radius: 8px;
  margin-bottom: 12px;
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.color || '#1f2937'};
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 4px;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin: 12px 0;

  .fill {
    height: 100%;
    background: ${props => props.color || '#667eea'};
    width: ${props => props.progress || 0}%;
    transition: width 0.5s ease;
  }
`;

// Main Enhanced Analysis View Component
const EnhancedAnalysisView = ({ analysisData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (key) => {
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const tabs = [
    { id: 'overview', label: 'Clinical Overview', icon: Brain },
    { id: 'psychodynamic', label: 'Psychodynamic', icon: Layers },
    { id: 'cognitive', label: 'Cognitive-Behavioral', icon: Target },
    { id: 'interpersonal', label: 'Interpersonal', icon: Users },
    { id: 'neuropsych', label: 'Neuropsychological', icon: Activity },
    { id: 'risk', label: 'Risk Assessment', icon: AlertTriangle },
    { id: 'treatment', label: 'Treatment Plan', icon: TrendingUp },
    { id: 'charts', label: 'Visual Analytics', icon: BarChart3 }
  ];

  const renderOverviewTab = () => (
    <>
      <SectionGrid columns="2fr 1fr">
        <Section>
          <SectionHeader>
            <SectionIcon color="#667eea">
              <FileText />
            </SectionIcon>
            <SectionTitle>Executive Summary</SectionTitle>
            <Badge color="#dbeafe" textColor="#1e40af">
              Comprehensive Analysis
            </Badge>
          </SectionHeader>
          <ContentBlock>
            <p style={{ fontSize: '1rem', lineHeight: '1.8', marginBottom: '16px' }}>
              {analysisData?.executiveSummary || 'Loading comprehensive clinical formulation...'}
            </p>
          </ContentBlock>
        </Section>

        <Section>
          <SectionHeader>
            <SectionIcon color="#10b981">
              <Shield />
            </SectionIcon>
            <SectionTitle>Key Metrics</SectionTitle>
          </SectionHeader>
          <MetricCard background="#dbeafe">
            <div>
              <MetricValue color="#1e40af">
                {analysisData?.riskAssessment?.overallRisk || 'Low'}
              </MetricValue>
              <MetricLabel>Overall Risk Level</MetricLabel>
            </div>
          </MetricCard>
          <MetricCard background="#dcfce7">
            <div>
              <MetricValue color="#16a34a">
                {analysisData?.treatmentPlan?.prognosis || 'Good'}
              </MetricValue>
              <MetricLabel>Treatment Prognosis</MetricLabel>
            </div>
          </MetricCard>
          <MetricCard background="#fef3c7">
            <div>
              <MetricValue color="#d97706">
                {analysisData?.functionalAssessment?.gaf || '65'}
              </MetricValue>
              <MetricLabel>GAF Score</MetricLabel>
            </div>
          </MetricCard>
        </Section>
      </SectionGrid>

      <Section>
        <SectionHeader>
          <SectionIcon color="#8b5cf6">
            <Lightbulb />
          </SectionIcon>
          <SectionTitle>Primary Clinical Insights</SectionTitle>
        </SectionHeader>
        {analysisData?.primaryInsights?.map((insight, index) => (
          <InsightCard key={index} gradient={
            index === 0 ? '#667eea 0%, #764ba2 100%' :
            index === 1 ? '#f59e0b 0%, #d97706 100%' :
            '#10b981 0%, #059669 100%'
          }>
            <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>{insight.title}</h3>
            <p style={{ opacity: 0.95 }}>{insight.description}</p>
          </InsightCard>
        ))}
      </Section>
    </>
  );

  const renderPsychodynamicTab = () => (
    <SectionGrid columns="1fr 1fr">
      <Section>
        <SectionHeader>
          <SectionIcon color="#7c3aed">
            <Brain />
          </SectionIcon>
          <SectionTitle>Unconscious Dynamics</SectionTitle>
        </SectionHeader>
        <ContentBlock>
          {analysisData?.psychodynamicFormulation?.unconsciousConflicts?.map((conflict, index) => (
            <Accordion key={index}>
              <AccordionHeader 
                open={expandedSections[`conflict-${index}`]}
                onClick={() => toggleSection(`conflict-${index}`)}
              >
                {expandedSections[`conflict-${index}`] ? <ChevronDown /> : <ChevronRight />}
                <strong>{conflict.title}</strong>
              </AccordionHeader>
              <AccordionContent open={expandedSections[`conflict-${index}`]}>
                <p>{conflict.description}</p>
                <div style={{ marginTop: '12px' }}>
                  <strong>Clinical Manifestations:</strong>
                  <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                    {conflict.manifestations?.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </Accordion>
          ))}
        </ContentBlock>
      </Section>

      <Section>
        <SectionHeader>
          <SectionIcon color="#dc2626">
            <Shield />
          </SectionIcon>
          <SectionTitle>Defense Mechanisms</SectionTitle>
        </SectionHeader>
        <ContentBlock>
          {analysisData?.psychodynamicFormulation?.defenseMechanisms?.map((defense, index) => (
            <MetricCard key={index} background="#fef2f2">
              <div>
                <strong style={{ color: '#991b1b' }}>{defense.name}</strong>
                <MetricLabel>{defense.description}</MetricLabel>
              </div>
              <Badge color="#dc2626" textColor="white">
                {defense.frequency}
              </Badge>
            </MetricCard>
          ))}
        </ContentBlock>
      </Section>

      <Section style={{ gridColumn: 'span 2' }}>
        <SectionHeader>
          <SectionIcon color="#0891b2">
            <Link />
          </SectionIcon>
          <SectionTitle>Psychological Connections</SectionTitle>
        </SectionHeader>
        <ContentBlock>
          {analysisData?.clinicalConnections?.map((connection, index) => (
            <ConnectionLine key={index}>
              <span className="source">{connection.concept1}</span>
              <span className="arrow">→</span>
              <span className="target">{connection.concept2}</span>
              <span className="type">{connection.relationshipType}</span>
            </ConnectionLine>
          ))}
        </ContentBlock>
      </Section>
    </SectionGrid>
  );

  const renderChartsTab = () => (
    <PsychologicalAssessmentDashboard analysisData={analysisData} />
  );

  return (
    <Container>
      <Header>
        <Title>Advanced Psychological Analysis</Title>
        <Subtitle>
          Comprehensive clinical assessment with evidence-based insights and treatment recommendations
        </Subtitle>
      </Header>

      <NavigationTabs>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon />
            {tab.label}
          </Tab>
        ))}
      </NavigationTabs>

      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'psychodynamic' && renderPsychodynamicTab()}
      {activeTab === 'charts' && renderChartsTab()}
      {/* Add other tab renderers as needed */}
    </Container>
  );
};

export default EnhancedAnalysisView;
