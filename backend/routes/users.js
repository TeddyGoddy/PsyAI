const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const UserSettingsService = require('../services/userSettingsService');

// Get user settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Return user settings (stored in user_settings JSONB field or default values)
    const settings = user.user_settings || {
      displayName: user.first_name || '',
      email: user.email || '',
      theme: 'light',
      language: 'italiano',
      autoSave: true,
      showAdvancedAnalysis: true,
      enableNotifications: true,
      dataRetention: '1year',
      exportFormat: 'pdf',
      // Developer settings
      geminiModel: 'gemini-2.5-flash',
      enhancedGeminiModel: 'gemini-2.5-pro',
      debugMode: false,
      showDeveloperOptions: false
    };

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('GET /users/settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Settings object required' });
    }

    // Update basic profile fields if provided
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (settings.displayName) {
      user.first_name = settings.displayName;
    }
    if (settings.email) {
      user.email = settings.email;
    }

    // Use UserSettingsService to handle AI model configuration
    const updatedSettings = await UserSettingsService.updateUserSettings(req.user.id, settings);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('PUT /users/settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get available AI models
router.get('/ai-models', authenticateToken, async (req, res) => {
  try {
    const models = UserSettingsService.getAvailableModels();
    res.json({
      success: true,
      models
    });
  } catch (error) {
    console.error('GET /users/ai-models error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
