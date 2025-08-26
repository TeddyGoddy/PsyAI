const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const geminiService = require('../../services/geminiService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload and analyze document
router.post('/upload-document', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    const { analysisType = 'general', notes } = req.body;
    const userType = req.user.userType;

    // TODO: Process different file types (PDF, images, etc.)
    // For now, mock the analysis
    const mockAnalysis = {
      fileInfo: {
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      },
      analysis: {
        emotions: ['anxiety', 'hope', 'confusion'],
        patterns: ['avoidance behavior', 'self-reflection'],
        themes: ['relationship dynamics', 'personal growth'],
        insights: ['Shows increased self-awareness', 'Demonstrates coping strategies'],
        suggestions: ['Explore underlying fears', 'Build on existing strengths'],
        sentiment: 'mixed',
        confidence: 0.78
      },
      visualizationData: {
        nodes: [
          { id: 'anxiety', type: 'emotion', importance: 0.8, label: 'Anxiety' },
          { id: 'growth', type: 'pattern', importance: 0.6, label: 'Personal Growth' }
        ],
        links: [
          { source: 'anxiety', target: 'growth', weight: 0.5 }
        ]
      }
    };

    res.json({
      success: true,
      analysis: mockAnalysis,
      documentId: req.file.filename
    });

  } catch (error) {
    console.error('Document analysis error:', error);
    res.status(500).json({
      error: 'Document analysis failed',
      message: error.message
    });
  }
});

// Create visualization data
router.post('/create-visualization', authMiddleware, async (req, res) => {
  try {
    const { dataType, sessionIds, timeRange, userType } = req.body;

    // Mock visualization data based on type
    let visualizationData = {};

    switch (dataType) {
      case 'random-forest':
        visualizationData = {
          nodes: [
            { id: 'trauma1', type: 'event', importance: 0.9, label: 'Childhood Event', x: 100, y: 150 },
            { id: 'anxiety', type: 'emotion', importance: 0.8, label: 'Anxiety', x: 200, y: 100 },
            { id: 'avoidance', type: 'behavior', importance: 0.7, label: 'Avoidance', x: 300, y: 200 },
            { id: 'therapy', type: 'event', importance: 0.6, label: 'Started Therapy', x: 400, y: 150 }
          ],
          links: [
            { source: 'trauma1', target: 'anxiety', weight: 0.8 },
            { source: 'anxiety', target: 'avoidance', weight: 0.7 },
            { source: 'therapy', target: 'anxiety', weight: -0.5 }
          ]
        };
        break;

      case 'timeline':
        visualizationData = [
          { date: '2024-01-01', mood: 4, anxiety: 7, energy: 3 },
          { date: '2024-01-15', mood: 5, anxiety: 6, energy: 4 },
          { date: '2024-02-01', mood: 6, anxiety: 5, energy: 5 },
          { date: '2024-02-15', mood: 7, anxiety: 4, energy: 6 },
          { date: '2024-03-01', mood: 6, anxiety: 5, energy: 5 }
        ];
        break;

      case 'thematic-map':
        visualizationData = [
          { name: 'anxiety', frequency: 15, category: 'emotion', sentiment: 'negative' },
          { name: 'growth', frequency: 8, category: 'behavior', sentiment: 'positive' },
          { name: 'relationships', frequency: 12, category: 'thought', sentiment: 'mixed' },
          { name: 'work stress', frequency: 10, category: 'event', sentiment: 'negative' },
          { name: 'self-care', frequency: 6, category: 'behavior', sentiment: 'positive' }
        ];
        break;

      default:
        return res.status(400).json({
          error: 'Invalid visualization type'
        });
    }

    res.json({
      success: true,
      data: visualizationData,
      type: dataType,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Visualization creation error:', error);
    res.status(500).json({
      error: 'Visualization creation failed',
      message: error.message
    });
  }
});

// Generate executive report
router.post('/generate-report', authMiddleware, async (req, res) => {
  try {
    const { sessionIds, timeRange, reportType = 'executive' } = req.body;
    const userType = req.user.userType;

    if (userType !== 'psychologist') {
      return res.status(403).json({
        error: 'Access denied. Executive reports are only available to psychologists.'
      });
    }

    // Mock report generation
    const mockReport = {
      reportId: `report_${Date.now()}`,
      type: reportType,
      generatedAt: new Date().toISOString(),
      timeRange: timeRange || 'Last 30 days',
      summary: {
        totalSessions: 8,
        keyThemes: ['anxiety management', 'relationship patterns', 'coping strategies'],
        overallProgress: 'positive',
        riskFactors: ['occasional high anxiety episodes'],
        strengths: ['increased self-awareness', 'active engagement in therapy']
      },
      sections: [
        {
          title: 'Recurring Themes',
          content: 'Patient consistently discusses anxiety related to work performance and interpersonal relationships.',
          insights: ['Work-related stress is primary trigger', 'Social anxiety impacts daily functioning']
        },
        {
          title: 'Behavioral Patterns',
          content: 'Notable improvement in coping strategy implementation over the reporting period.',
          insights: ['Increased use of mindfulness techniques', 'Better boundary setting in relationships']
        },
        {
          title: 'Therapeutic Recommendations',
          content: 'Continue current approach with increased focus on exposure therapy for social situations.',
          insights: ['CBT techniques showing effectiveness', 'Consider group therapy for social skills']
        }
      ],
      nextSteps: [
        'Continue weekly sessions',
        'Introduce exposure exercises',
        'Monitor anxiety levels closely'
      ]
    };

    res.json({
      success: true,
      report: mockReport
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      error: 'Report generation failed',
      message: error.message
    });
  }
});

module.exports = router;
