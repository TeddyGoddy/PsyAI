const express = require('express');
const router = express.Router();
const geminiService = require('../../services/geminiService');
const authMiddleware = require('../../middleware/auth');

// Analyze text content
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { text, analysisType = 'general', userType } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'Text content is required'
      });
    }

    const analysis = await geminiService.analyzeText(text, analysisType, userType);

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

// Generate adaptive questions
router.post('/generate-questions', authMiddleware, async (req, res) => {
  try {
    const { context, previousAnswers = [], userType, sessionType = 'journaling' } = req.body;

    const questions = await geminiService.generateQuestions({
      context,
      previousAnswers,
      userType,
      sessionType
    });

    res.json({
      success: true,
      questions,
      sessionId: `session_${Date.now()}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({
      error: 'Question generation failed',
      message: error.message
    });
  }
});

// Generate what-if scenarios
router.post('/what-if-scenarios', authMiddleware, async (req, res) => {
  try {
    const { baseScenario, context, userType } = req.body;

    if (!baseScenario) {
      return res.status(400).json({
        error: 'Base scenario is required'
      });
    }

    const scenarios = await geminiService.generateWhatIfScenarios({
      baseScenario,
      context,
      userType
    });

    res.json({
      success: true,
      scenarios,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scenario generation error:', error);
    res.status(500).json({
      error: 'Scenario generation failed',
      message: error.message
    });
  }
});

// Extract themes and patterns
router.post('/extract-themes', authMiddleware, async (req, res) => {
  try {
    const { texts, userType } = req.body;

    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({
        error: 'Array of texts is required'
      });
    }

    const themes = await geminiService.extractThemes(texts, userType);

    res.json({
      success: true,
      themes,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Theme extraction error:', error);
    res.status(500).json({
      error: 'Theme extraction failed',
      message: error.message
    });
  }
});

module.exports = router;
