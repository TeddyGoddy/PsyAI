const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  psychologist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  session_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50
  },
  session_type: {
    type: DataTypes.ENUM('individual', 'group', 'family', 'couple'),
    defaultValue: 'individual'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'no_show'),
    defaultValue: 'scheduled'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  mood_before: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 10 }
  },
  mood_after: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 10 }
  },
  anxiety_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 10 }
  },
  energy_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 10 }
  },
  key_topics: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  homework_assigned: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  next_session_goals: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Session;
