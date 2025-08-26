const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const Patient = require('../models/Patient');
const Session = require('../models/Session');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

// Get dashboard statistics
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type;

    let stats = {};

    if (userType === 'psychologist') {
      // Get psychologist statistics
      const [activePatients, todaySessions, completedAnalyses] = await Promise.all([
        Patient.count({ 
          where: { 
            psychologist_id: userId, 
            status: 'active' 
          } 
        }),
        Session.count({
          where: {
            psychologist_id: userId,
            session_date: {
              [require('sequelize').Op.gte]: new Date().setHours(0, 0, 0, 0),
              [require('sequelize').Op.lt]: new Date().setHours(23, 59, 59, 999)
            }
          }
        }),
        Analysis.count({
          where: { user_id: userId }
        })
      ]);

      // Calculate improvement percentage (mock calculation for now)
      const recentSessions = await Session.findAll({
        where: {
          psychologist_id: userId,
          status: 'completed',
          mood_before: { [require('sequelize').Op.ne]: null },
          mood_after: { [require('sequelize').Op.ne]: null }
        },
        limit: 50,
        order: [['session_date', 'DESC']]
      });

      let improvementPercentage = 0;
      if (recentSessions.length > 0) {
        const totalImprovement = recentSessions.reduce((sum, session) => {
          return sum + (session.mood_after - session.mood_before);
        }, 0);
        improvementPercentage = Math.round((totalImprovement / recentSessions.length) * 10);
      }

      stats = {
        activePatients,
        todaySessions,
        completedAnalyses,
        improvementPercentage: `+${Math.max(0, improvementPercentage)}%`
      };
    } else {
      // Patient statistics
      const [totalSessions, completedAnalyses] = await Promise.all([
        Session.count({
          include: [{
            model: Patient,
            where: { user_id: userId }
          }]
        }),
        Analysis.count({
          where: { user_id: userId }
        })
      ]);

      stats = {
        totalSessions,
        completedAnalyses,
        currentStreak: 7, // Mock data
        moodTrend: '+5%' // Mock data
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get timeline data
router.get('/timeline', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type;

    let timelineData = [];

    if (userType === 'psychologist') {
      // Get sessions for psychologist's patients
      const sessions = await Session.findAll({
        where: {
          psychologist_id: userId,
          status: 'completed',
          mood_before: { [require('sequelize').Op.ne]: null },
          anxiety_level: { [require('sequelize').Op.ne]: null },
          energy_level: { [require('sequelize').Op.ne]: null }
        },
        order: [['session_date', 'ASC']],
        limit: 30
      });

      timelineData = sessions.map(session => ({
        date: session.session_date.toISOString().split('T')[0],
        mood: session.mood_after || session.mood_before,
        anxiety: session.anxiety_level,
        energy: session.energy_level
      }));
    } else {
      // Get patient's own sessions
      const patient = await Patient.findOne({ where: { user_id: userId } });
      if (patient) {
        const sessions = await Session.findAll({
          where: {
            patient_id: patient.id,
            status: 'completed',
            mood_before: { [require('sequelize').Op.ne]: null }
          },
          order: [['session_date', 'ASC']],
          limit: 30
        });

        timelineData = sessions.map(session => ({
          date: session.session_date.toISOString().split('T')[0],
          mood: session.mood_after || session.mood_before,
          anxiety: session.anxiety_level,
          energy: session.energy_level
        }));
      }
    }

    res.json(timelineData);
  } catch (error) {
    console.error('Timeline data error:', error);
    res.status(500).json({ error: 'Failed to fetch timeline data' });
  }
});

// Get thematic analysis data
router.get('/themes', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type;

    // Get analyses and extract themes
    let analyses = [];
    
    if (userType === 'psychologist') {
      analyses = await Analysis.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 100
      });
    } else {
      analyses = await Analysis.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 50
      });
    }

    // Extract themes from AI analysis results
    const themeMap = new Map();
    
    analyses.forEach(analysis => {
      if (analysis.ai_analysis && analysis.ai_analysis.themes) {
        analysis.ai_analysis.themes.forEach(theme => {
          if (themeMap.has(theme.name)) {
            const existing = themeMap.get(theme.name);
            existing.frequency += 1;
          } else {
            themeMap.set(theme.name, {
              name: theme.name,
              frequency: 1,
              category: theme.category || 'general',
              sentiment: theme.sentiment || 'neutral'
            });
          }
        });
      }
    });

    const themes = Array.from(themeMap.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20);

    res.json(themes);
  } catch (error) {
    console.error('Themes data error:', error);
    res.status(500).json({ error: 'Failed to fetch themes data' });
  }
});

// Get patients list (for psychologists)
router.get('/patients', auth, async (req, res) => {
  try {
    if (req.user.user_type !== 'psychologist') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const patients = await Patient.findAll({
      where: { psychologist_id: req.user.id },
      include: [{
        model: User,
        attributes: ['first_name', 'last_name', 'email']
      }],
      order: [['created_at', 'DESC']]
    });

    const patientsWithStats = await Promise.all(
      patients.map(async (patient) => {
        const sessionCount = await Session.count({
          where: { patient_id: patient.id }
        });

        const lastSession = await Session.findOne({
          where: { patient_id: patient.id },
          order: [['session_date', 'DESC']]
        });

        return {
          id: patient.id,
          user: patient.User,
          status: patient.status,
          sessionCount,
          lastSession: lastSession ? lastSession.session_date : null,
          therapyGoals: patient.therapy_goals,
          createdAt: patient.created_at
        };
      })
    );

    res.json(patientsWithStats);
  } catch (error) {
    console.error('Patients data error:', error);
    res.status(500).json({ error: 'Failed to fetch patients data' });
  }
});

// Create new patient (for psychologists)
router.post('/patients', auth, async (req, res) => {
  try {
    const userType = req.user.userType || req.user.user_type;
    if (userType !== 'psychologist') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate input
    const schema = Joi.object({
      first_name: Joi.string().min(2).max(100).required(),
      last_name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().allow('', null),
      date_of_birth: Joi.string().allow('', null),
      gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').allow(null),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Validation error', details: error.details[0].message });
    }

    const { first_name, last_name, email, phone, date_of_birth, gender } = value;

    // Check if a user with this email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create a patient user with a generated password
    const tempPassword = Math.random().toString(36).slice(-10);
    const password_hash = await bcrypt.hash(tempPassword, 12);

    const newUser = await User.create({
      email,
      password_hash,
      first_name,
      last_name,
      user_type: 'patient',
      phone: phone || null,
    });

    const newPatient = await Patient.create({
      user_id: newUser.id,
      psychologist_id: req.user.id,
      date_of_birth: date_of_birth || null,
      gender: gender || null,
      status: 'active',
    });

    // Return a flattened shape suitable for the frontend
    return res.status(201).json({
      patient: {
        id: newPatient.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        status: newPatient.status,
        createdAt: newPatient.created_at,
      }
    });
  } catch (error) {
    console.error('Create patient error:', error);
    return res.status(500).json({ error: 'Failed to create patient' });
  }
});

// Get analysis history
router.get('/analyses', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, patient_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: req.user.id };
    if (type) {
      whereClause.type = type;
    }
    if (patient_id) {
      whereClause.patient_id = patient_id;
      console.log(`[ANALYSES] Filtering by patient_id: ${patient_id}`);
    } else {
      console.log(`[ANALYSES] No patient_id filter provided`);
    }
    
    console.log(`[ANALYSES] Where clause:`, whereClause);

    const { count, rows: analyses } = await Analysis.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        'id', 'type', 'title', 'confidence_score', 
        'processing_time', 'tags', 'created_at', 'patient_id'
      ]
    });

    console.log(`[ANALYSES] Found ${count} analyses matching criteria`);
    analyses.forEach(analysis => {
      console.log(`[ANALYSES] Analysis ${analysis.id}: patient_id=${analysis.patient_id}, type=${analysis.type}`);
    });

    res.json({
      analyses,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Analyses data error:', error);
    res.status(500).json({ error: 'Failed to fetch analyses data' });
  }
});

module.exports = router;
