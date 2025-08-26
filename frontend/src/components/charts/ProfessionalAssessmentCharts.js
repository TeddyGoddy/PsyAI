import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, Area, AreaChart,
  Treemap, Sankey
} from 'recharts';
import styled from 'styled-components';

const ChartContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChartDescription = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 20px;
`;

const ScoreIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-left: auto;
  
  ${props => {
    if (props.severity === 'minimal') return 'background: #d1fae5; color: #065f46;';
    if (props.severity === 'mild') return 'background: #fed7aa; color: #9a3412;';
    if (props.severity === 'moderate') return 'background: #fde68a; color: #92400e;';
    if (props.severity === 'severe') return 'background: #fecaca; color: #991b1b;';
    return 'background: #f3f4f6; color: #4b5563;';
  }}
`;

const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4'
};

// Beck Depression Inventory Style Chart
export const DepressionAssessmentChart = ({ data }) => {
  const radarData = [
    { category: 'Mood', score: data?.mood || 0, fullMark: 3 },
    { category: 'Pessimism', score: data?.pessimism || 0, fullMark: 3 },
    { category: 'Sense of Failure', score: data?.failure || 0, fullMark: 3 },
    { category: 'Lack of Satisfaction', score: data?.satisfaction || 0, fullMark: 3 },
    { category: 'Guilty Feelings', score: data?.guilt || 0, fullMark: 3 },
    { category: 'Self-Dislike', score: data?.selfDislike || 0, fullMark: 3 },
    { category: 'Suicidal Ideation', score: data?.suicidal || 0, fullMark: 3 },
    { category: 'Crying', score: data?.crying || 0, fullMark: 3 },
    { category: 'Agitation', score: data?.agitation || 0, fullMark: 3 },
    { category: 'Loss of Interest', score: data?.interest || 0, fullMark: 3 },
    { category: 'Indecisiveness', score: data?.indecisiveness || 0, fullMark: 3 },
    { category: 'Worthlessness', score: data?.worthlessness || 0, fullMark: 3 },
    { category: 'Loss of Energy', score: data?.energy || 0, fullMark: 3 },
    { category: 'Sleep Changes', score: data?.sleep || 0, fullMark: 3 },
    { category: 'Irritability', score: data?.irritability || 0, fullMark: 3 },
    { category: 'Appetite Changes', score: data?.appetite || 0, fullMark: 3 },
    { category: 'Concentration', score: data?.concentration || 0, fullMark: 3 },
    { category: 'Fatigue', score: data?.fatigue || 0, fullMark: 3 }
  ];

  const totalScore = radarData.reduce((sum, item) => sum + item.score, 0);
  const severity = totalScore <= 13 ? 'minimal' : 
                   totalScore <= 19 ? 'mild' :
                   totalScore <= 28 ? 'moderate' : 'severe';

  return (
    <ChartContainer>
      <ChartTitle>
        Depression Assessment (BDI-II Style)
        <ScoreIndicator severity={severity}>
          Total: {totalScore}/63 - {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </ScoreIndicator>
      </ChartTitle>
      <ChartDescription>
        Comprehensive assessment of depressive symptoms across cognitive, affective, and somatic dimensions
      </ChartDescription>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData}>
          <PolarGrid strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={90} domain={[0, 3]} />
          <Radar name="Score" dataKey="score" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.5} />
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// GAD-7 Style Anxiety Assessment
export const AnxietyAssessmentChart = ({ data }) => {
  const barData = [
    { symptom: 'Nervousness', score: data?.nervousness || 0 },
    { symptom: 'Uncontrollable Worry', score: data?.worry || 0 },
    { symptom: 'Excessive Worry', score: data?.excessiveWorry || 0 },
    { symptom: 'Trouble Relaxing', score: data?.relaxing || 0 },
    { symptom: 'Restlessness', score: data?.restlessness || 0 },
    { symptom: 'Irritability', score: data?.irritability || 0 },
    { symptom: 'Fear', score: data?.fear || 0 }
  ];

  const totalScore = barData.reduce((sum, item) => sum + item.score, 0);
  const severity = totalScore <= 4 ? 'minimal' :
                   totalScore <= 9 ? 'mild' :
                   totalScore <= 14 ? 'moderate' : 'severe';

  return (
    <ChartContainer>
      <ChartTitle>
        Anxiety Assessment (GAD-7 Style)
        <ScoreIndicator severity={severity}>
          Total: {totalScore}/21 - {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </ScoreIndicator>
      </ChartTitle>
      <ChartDescription>
        Generalized Anxiety Disorder assessment measuring frequency and intensity of anxiety symptoms
      </ChartDescription>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="symptom" angle={-45} textAnchor="end" height={80} />
          <YAxis domain={[0, 3]} />
          <Tooltip />
          <Bar dataKey="score" fill={COLORS.warning} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Attachment Style Distribution
export const AttachmentStyleChart = ({ data }) => {
  const pieData = [
    { name: 'Secure', value: data?.secure || 25, color: COLORS.success },
    { name: 'Anxious', value: data?.anxious || 25, color: COLORS.warning },
    { name: 'Avoidant', value: data?.avoidant || 25, color: COLORS.danger },
    { name: 'Disorganized', value: data?.disorganized || 25, color: COLORS.secondary }
  ];

  const dominantStyle = pieData.reduce((max, style) => 
    style.value > max.value ? style : max
  );

  return (
    <ChartContainer>
      <ChartTitle>
        Attachment Style Profile
        <ScoreIndicator style={{ background: dominantStyle.color + '20', color: dominantStyle.color }}>
          Dominant: {dominantStyle.name}
        </ScoreIndicator>
      </ChartTitle>
      <ChartDescription>
        Distribution of attachment patterns based on interpersonal dynamics and relational history
      </ChartDescription>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Defense Mechanisms Hierarchy
export const DefenseMechanismsChart = ({ data }) => {
  const hierarchyData = {
    name: 'Defense Mechanisms',
    children: [
      {
        name: 'Mature',
        color: COLORS.success,
        children: [
          { name: 'Sublimation', size: data?.sublimation || 0 },
          { name: 'Humor', size: data?.humor || 0 },
          { name: 'Anticipation', size: data?.anticipation || 0 },
          { name: 'Suppression', size: data?.suppression || 0 }
        ]
      },
      {
        name: 'Neurotic',
        color: COLORS.warning,
        children: [
          { name: 'Intellectualization', size: data?.intellectualization || 0 },
          { name: 'Repression', size: data?.repression || 0 },
          { name: 'Displacement', size: data?.displacement || 0 },
          { name: 'Reaction Formation', size: data?.reactionFormation || 0 }
        ]
      },
      {
        name: 'Immature',
        color: COLORS.danger,
        children: [
          { name: 'Projection', size: data?.projection || 0 },
          { name: 'Acting Out', size: data?.actingOut || 0 },
          { name: 'Passive Aggression', size: data?.passiveAggression || 0 },
          { name: 'Idealization', size: data?.idealization || 0 }
        ]
      },
      {
        name: 'Primitive',
        color: COLORS.secondary,
        children: [
          { name: 'Denial', size: data?.denial || 0 },
          { name: 'Splitting', size: data?.splitting || 0 },
          { name: 'Dissociation', size: data?.dissociation || 0 },
          { name: 'Distortion', size: data?.distortion || 0 }
        ]
      }
    ]
  };

  const flattenData = (node, level = 0) => {
    const result = [];
    if (node.children) {
      node.children.forEach(child => {
        if (child.size !== undefined) {
          result.push({
            name: child.name,
            value: child.size,
            category: node.name,
            color: node.color
          });
        } else {
          result.push(...flattenData(child, level + 1));
        }
      });
    }
    return result;
  };

  const treemapData = flattenData(hierarchyData);

  return (
    <ChartContainer>
      <ChartTitle>Defense Mechanisms Hierarchy</ChartTitle>
      <ChartDescription>
        Psychodynamic defense mechanisms organized by developmental maturity level
      </ChartDescription>
      <ResponsiveContainer width="100%" height={400}>
        <Treemap
          data={treemapData}
          dataKey="value"
          aspectRatio={4/3}
          stroke="#fff"
          fill={COLORS.primary}
          content={({ x, y, width, height, name, value, color }) => (
            <g>
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                  fill: color || COLORS.primary,
                  stroke: '#fff',
                  strokeWidth: 2,
                  strokeOpacity: 1,
                }}
              />
              {width > 50 && height > 20 && (
                <text
                  x={x + width / 2}
                  y={y + height / 2}
                  fill="#fff"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                >
                  {name}
                </text>
              )}
            </g>
          )}
        />
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Cognitive Distortions Heatmap
export const CognitiveDistortionsChart = ({ data }) => {
  const distortions = [
    { name: 'All-or-Nothing', intensity: data?.allOrNothing || 0 },
    { name: 'Overgeneralization', intensity: data?.overgeneralization || 0 },
    { name: 'Mental Filter', intensity: data?.mentalFilter || 0 },
    { name: 'Disqualifying Positive', intensity: data?.disqualifyingPositive || 0 },
    { name: 'Jumping to Conclusions', intensity: data?.jumpingToConclusions || 0 },
    { name: 'Magnification', intensity: data?.magnification || 0 },
    { name: 'Emotional Reasoning', intensity: data?.emotionalReasoning || 0 },
    { name: 'Should Statements', intensity: data?.shouldStatements || 0 },
    { name: 'Labeling', intensity: data?.labeling || 0 },
    { name: 'Personalization', intensity: data?.personalization || 0 }
  ];

  const getColor = (intensity) => {
    if (intensity <= 1) return '#d1fae5';
    if (intensity <= 2) return '#86efac';
    if (intensity <= 3) return '#fbbf24';
    if (intensity <= 4) return '#fb923c';
    return '#ef4444';
  };

  return (
    <ChartContainer>
      <ChartTitle>Cognitive Distortions Profile</ChartTitle>
      <ChartDescription>
        Intensity mapping of cognitive distortions and thinking errors
      </ChartDescription>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={distortions} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 5]} />
          <YAxis dataKey="name" type="category" width={120} />
          <Tooltip />
          <Bar dataKey="intensity" fill={COLORS.secondary}>
            {distortions.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.intensity)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Risk Assessment Matrix
export const RiskAssessmentMatrix = ({ data }) => {
  const riskData = [
    { category: 'Suicide Risk', level: data?.suicideRisk || 0, factors: data?.suicideFactors || [] },
    { category: 'Violence Risk', level: data?.violenceRisk || 0, factors: data?.violenceFactors || [] },
    { category: 'Substance Use', level: data?.substanceRisk || 0, factors: data?.substanceFactors || [] },
    { category: 'Self-Harm', level: data?.selfHarmRisk || 0, factors: data?.selfHarmFactors || [] }
  ];

  const getRiskColor = (level) => {
    if (level <= 1) return COLORS.success;
    if (level <= 2) return COLORS.warning;
    if (level <= 3) return '#ff8c00';
    return COLORS.danger;
  };

  const getRiskLabel = (level) => {
    if (level <= 1) return 'Low';
    if (level <= 2) return 'Moderate';
    if (level <= 3) return 'High';
    return 'Critical';
  };

  return (
    <ChartContainer>
      <ChartTitle>Clinical Risk Assessment Matrix</ChartTitle>
      <ChartDescription>
        Multi-dimensional risk evaluation with protective and vulnerability factors
      </ChartDescription>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {riskData.map((risk, index) => (
          <div key={index} style={{ 
            border: `2px solid ${getRiskColor(risk.level)}`,
            borderRadius: '8px',
            padding: '16px',
            background: `${getRiskColor(risk.level)}10`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <strong>{risk.category}</strong>
              <span style={{ 
                color: getRiskColor(risk.level),
                fontWeight: 'bold'
              }}>
                {getRiskLabel(risk.level)}
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Factors: {risk.factors.length > 0 ? risk.factors.join(', ') : 'None identified'}
            </div>
          </div>
        ))}
      </div>
    </ChartContainer>
  );
};

// Treatment Progress Timeline
export const TreatmentProgressChart = ({ data }) => {
  const phases = data?.phases || [
    { name: 'Assessment', weeks: 2, status: 'completed', progress: 100 },
    { name: 'Stabilization', weeks: 4, status: 'current', progress: 50 },
    { name: 'Processing', weeks: 8, status: 'pending', progress: 0 },
    { name: 'Integration', weeks: 4, status: 'pending', progress: 0 },
    { name: 'Consolidation', weeks: 2, status: 'pending', progress: 0 }
  ];

  const getStatusColor = (status) => {
    if (status === 'completed') return COLORS.success;
    if (status === 'current') return COLORS.primary;
    return '#e5e7eb';
  };

  return (
    <ChartContainer>
      <ChartTitle>Treatment Progress Timeline</ChartTitle>
      <ChartDescription>
        Evidence-based treatment phases with expected duration and current progress
      </ChartDescription>
      <div style={{ padding: '20px 0' }}>
        {phases.map((phase, index) => (
          <div key={index} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '500' }}>{phase.name}</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {phase.weeks} weeks - {phase.status}
              </span>
            </div>
            <div style={{ 
              height: '24px',
              background: '#e5e7eb',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${phase.progress}%`,
                background: getStatusColor(phase.status),
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ))}
      </div>
    </ChartContainer>
  );
};

// Comprehensive Chart Dashboard
export const PsychologicalAssessmentDashboard = ({ analysisData }) => {
  return (
    <div>
      <DepressionAssessmentChart data={analysisData?.depression} />
      <AnxietyAssessmentChart data={analysisData?.anxiety} />
      <AttachmentStyleChart data={analysisData?.attachment} />
      <DefenseMechanismsChart data={analysisData?.defenseMechanisms} />
      <CognitiveDistortionsChart data={analysisData?.cognitiveDistortions} />
      <RiskAssessmentMatrix data={analysisData?.riskAssessment} />
      <TreatmentProgressChart data={analysisData?.treatmentProgress} />
    </div>
  );
};

export default PsychologicalAssessmentDashboard;
