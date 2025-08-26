const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  psychologist_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  date_of_birth: {
    type: DataTypes.DATEONLY
  },
  birth_place: {
    type: DataTypes.STRING(100)
  },
  residence: {
    type: DataTypes.STRING(100)
  },
  therapy_start_date: {
    type: DataTypes.DATEONLY
  },
  previous_therapy: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    allowNull: true
  },
  emergency_contact: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  medical_history: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  current_medications: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  therapy_goals: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  psychological_profile: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  session_frequency: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'completed', 'on_hold'),
    defaultValue: 'active'
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
  tableName: 'patients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Patient;
