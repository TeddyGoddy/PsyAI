const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const router = express.Router();

// Debug logging helper controlled by env DEBUG_AUTH=true
const DEBUG_AUTH = String(process.env.DEBUG_AUTH || '').toLowerCase() === 'true';
const logAuth = (...args) => { if (DEBUG_AUTH) console.log('[AUTH]', ...args); };

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  userType: Joi.string().valid('psychologist', 'patient').required(),
  licenseNumber: Joi.when('userType', {
    is: 'psychologist',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Helper: normalize payload (map Italian labels, trim, lowercases)
const normalizeRegisterPayload = (body) => {
  const mapUserType = (val) => {
    if (!val) return val;
    const v = String(val).toLowerCase().trim();
    if (['psicologo', 'psychologist'].includes(v)) return 'psychologist';
    if (['paziente', 'patient'].includes(v)) return 'patient';
    return val; // allow Joi to flag invalid
  };
  return {
    email: String(body.email || '').trim().toLowerCase(),
    password: body.password,
    firstName: String(body.firstName || body.first_name || '').trim(),
    lastName: String(body.lastName || body.last_name || '').trim(),
    userType: mapUserType(body.userType || body.user_type),
    licenseNumber: body.licenseNumber || body.license_number
  };
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const payload = normalizeRegisterPayload(req.body || {});
    logAuth('POST /auth/register payload (sanitized):', {
      email: payload.email,
      userType: payload.userType,
      hasPassword: Boolean(payload.password)
    });
    const { error, value } = registerSchema.validate(payload);
    if (error) {
      logAuth('Validation error:', error.details?.[0]?.message);
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { email, password, firstName, lastName, userType, licenseNumber } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logAuth('User already exists:', email);
      return res.status(400).json({
        error: 'User already exists',
        details: 'An account with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in database
    const newUser = await User.create({
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      user_type: userType,
      license_number: userType === 'psychologist' ? licenseNumber : null
    });

    logAuth('User created with id:', newUser.id, '| type:', newUser.user_type);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        userType: newUser.user_type 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        userType: newUser.user_type
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    logAuth('Registration error message:', error?.message);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Internal server error'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const raw = req.body || {};
    const loginPayload = {
      email: String(raw.email || '').trim().toLowerCase(),
      password: raw.password
    };
    logAuth('POST /auth/login payload (sanitized):', { email: loginPayload.email, hasPassword: Boolean(loginPayload.password) });
    const { error, value } = loginSchema.validate(loginPayload);
    if (error) {
      logAuth('Validation error:', error.details?.[0]?.message);
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { email, password } = value;

    // Find user in database
    const user = await User.findOne({ where: { email, is_active: true } });
    if (!user) {
      logAuth('Login failed: user not found or inactive:', email);
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      logAuth('Login failed: invalid password for user id:', user.id);
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        userType: user.user_type 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    logAuth('Login error message:', error?.message);
    res.status(500).json({
      error: 'Login failed',
      message: 'Internal server error'
    });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    res.json({
      valid: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token'
    });
  }
});

module.exports = router;
