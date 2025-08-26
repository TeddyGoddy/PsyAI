const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Mock user profile data
    const mockProfile = {
      id: userId,
      email: req.user.email,
      firstName: 'Demo',
      lastName: 'User',
      userType: req.user.userType,
      createdAt: '2024-01-01T00:00:00Z',
      preferences: {
        language: 'it',
        timezone: 'Europe/Rome',
        notifications: {
          email: true,
          push: false,
          reminders: true
        },
        privacy: {
          dataSharing: false,
          analytics: true
        }
      },
      stats: {
        totalSessions: 15,
        totalAnalyses: 8,
        lastActive: new Date().toISOString()
      }
    };

    if (req.user.userType === 'psychologist') {
      mockProfile.professional = {
        licenseNumber: 'PSY-12345',
        specializations: ['Anxiety Disorders', 'Cognitive Behavioral Therapy'],
        yearsExperience: 8,
        patients: {
          active: 12,
          total: 45
        }
      };
    }

    res.json({
      success: true,
      profile: mockProfile
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

// Update user preferences
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { preferences } = req.body;

    // TODO: Update preferences in database
    const updatedPreferences = {
      ...preferences,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      preferences: updatedPreferences,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      error: 'Failed to update preferences',
      message: error.message
    });
  }
});

module.exports = router;
