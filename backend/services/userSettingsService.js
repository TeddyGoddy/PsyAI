const User = require('../models/User');
const geminiService = require('./geminiService');
const EnhancedGeminiService = require('./enhancedGeminiService');

class UserSettingsService {
  /**
   * Get user settings with AI model configuration
   */
  static async getUserSettings(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const settings = user.user_settings || {};
      return {
        ...settings,
        // Ensure AI settings have defaults
        geminiModel: settings.geminiModel || 'gemini-2.5-flash',
        enhancedGeminiModel: settings.enhancedGeminiModel || 'gemini-2.5-pro',
        debugMode: settings.debugMode || false,
        showDeveloperOptions: settings.showDeveloperOptions || false
      };
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  }

  /**
   * Update user settings and configure AI services
   */
  static async updateUserSettings(userId, newSettings) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update user settings
      user.user_settings = { ...user.user_settings, ...newSettings };
      await user.save();

      // Configure AI services with new models if they changed
      if (newSettings.geminiModel) {
        geminiService.setModel(newSettings.geminiModel);
        console.log(`[UserSettings] Gemini model updated to: ${newSettings.geminiModel}`);
      }

      if (newSettings.enhancedGeminiModel) {
        const enhancedService = new EnhancedGeminiService();
        enhancedService.setModel(newSettings.enhancedGeminiModel);
        console.log(`[UserSettings] Enhanced Gemini model updated to: ${newSettings.enhancedGeminiModel}`);
      }

      if (newSettings.debugMode !== undefined) {
        geminiService.setDebugMode(newSettings.debugMode);
        console.log(`[UserSettings] Debug mode updated to: ${newSettings.debugMode}`);
      }

      return user.user_settings;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  /**
   * Configure AI services for a specific user session
   */
  static async configureAIForUser(userId) {
    try {
      const settings = await this.getUserSettings(userId);
      
      // Configure main Gemini service
      geminiService.setModel(settings.geminiModel);
      geminiService.setDebugMode(settings.debugMode);
      
      // Return settings for enhanced service configuration
      return {
        enhancedModel: settings.enhancedGeminiModel,
        debugMode: settings.debugMode
      };
    } catch (error) {
      console.error('Error configuring AI for user:', error);
      // Return defaults if configuration fails
      return {
        enhancedModel: 'gemini-2.5-pro',
        debugMode: false
      };
    }
  }

  /**
   * Get available AI models
   */
  static getAvailableModels() {
    return {
      gemini: [
        {
          id: 'gemini-2.5-pro',
          name: 'Gemini 2.5 Pro',
          description: 'Migliore qualità, thinking model',
          recommended: true
        },
        {
          id: 'gemini-2.5-flash',
          name: 'Gemini 2.5 Flash',
          description: 'Best price-performance, veloce',
          recommended: true
        },
        {
          id: 'gemini-2.5-flash-lite',
          name: 'Gemini 2.5 Flash-Lite',
          description: 'Ottimizzato per costi e velocità',
          recommended: false
        },
      ]
    };
  }
}

module.exports = UserSettingsService;
