import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import styled from 'styled-components';

const TimelineContainer = styled.div`
  width: 100%;
  height: 400px;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.text.light};
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const TimelineTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: 1.25rem;
`;

const EventMarker = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${props => props.theme.colors.error};
  border-radius: 50%;
  transform: translate(-50%, -50%);
`;

const Timeline = ({ data, events = [], userType = 'psychologist' }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          <p>{`Data: ${formatDate(label)}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <TimelineContainer>
      <TimelineHeader>
        <TimelineTitle>Timeline Emotiva</TimelineTitle>
      </TimelineHeader>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="#64748b"
          />
          <YAxis 
            domain={[0, 10]}
            stroke="#64748b"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Emotional state lines */}
          <Line 
            type="monotone" 
            dataKey="mood" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Umore"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="anxiety" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Ansia"
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="energy" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Energia"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          />
          
          {/* Event markers */}
          {events.map((event, index) => (
            <ReferenceLine 
              key={index}
              x={event.date} 
              stroke="#f59e0b" 
              strokeDasharray="5 5"
              label={{ value: event.label, position: 'top' }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </TimelineContainer>
  );
};

export default Timeline;
