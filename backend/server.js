const express = require('express');
const cors = require('cors');
const User = require('./models/User');
const Analysis = require('./models/Analysis');
const Patient = require('./models/Patient');
const Session = require('./models/Session');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { testConnection, sequelize } = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Startup diagnostics (safe)
console.log('🛠️ Startup config:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: String(PORT),
  FRONTEND_URL: process.env.FRONTEND_URL,
  DEBUG_AUTH: String(process.env.DEBUG_AUTH || ''),
  DEBUG_AI: String(process.env.DEBUG_AI || '')
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const analysisRoutes = require('./routes/analysis');
const dataRoutes = require('./routes/data');
const patientsRoutes = require('./routes/patients');
const archivesRoutes = require('./routes/archives');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/analysis', analysisRoutes);
app.use('/api/v1/data', dataRoutes);
app.use('/api/v1/patients', patientsRoutes);
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/archives', archivesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Define model associations
    User.hasMany(Analysis, { foreignKey: 'user_id' });
    Analysis.belongsTo(User, { foreignKey: 'user_id' });

    User.hasMany(Patient, { foreignKey: 'user_id' });
    Patient.belongsTo(User, { foreignKey: 'user_id' });

    User.hasMany(Patient, { foreignKey: 'psychologist_id', as: 'AssignedPatients' });
    Patient.belongsTo(User, { foreignKey: 'psychologist_id', as: 'Psychologist' });

    Patient.hasMany(Session, { foreignKey: 'patient_id' });
    Session.belongsTo(Patient, { foreignKey: 'patient_id' });

    User.hasMany(Session, { foreignKey: 'psychologist_id', as: 'PsychologistSessions' });
    Session.belongsTo(User, { foreignKey: 'psychologist_id', as: 'Psychologist' });

    // Sync database models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('📊 Database synchronized successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 PsyAI Backend server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
