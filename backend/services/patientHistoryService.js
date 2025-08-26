const { Op } = require('sequelize');
const Analysis = require('../models/Analysis');
const Session = require('../models/Session');
const Patient = require('../models/Patient');
const User = require('../models/User');

class PatientHistoryService {
  /**
   * Get comprehensive patient profile with demographics and history
   * @param {string} patientId - Patient UUID
   * @param {number} userId - User ID making the request
   * @returns {Object} Complete patient profile with history
   */
  static async getPatientProfile(patientId, userId) {
    try {
      // Get patient details with user info
      const patient = await Patient.findOne({
        where: { 
          id: patientId,
          [Op.or]: [
            { user_id: userId },
            { psychologist_id: userId }
          ]
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['first_name', 'last_name', 'email']
        }]
      });

      if (!patient) {
        throw new Error('Patient not found or access denied');
      }

      // Calculate age from date of birth
      const age = patient.date_of_birth ? 
        Math.floor((new Date() - new Date(patient.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) : 
        null;

      // Get all analyses for this patient
      const analyses = await Analysis.findAll({
        where: { 
          patient_id: patientId,
          user_id: userId 
        },
        order: [['created_at', 'DESC']],
        limit: 50 // Limit to last 50 analyses for performance
      });

      // Get all sessions for this patient
      const sessions = await Session.findAll({
        where: { 
          patient_id: patientId,
          user_id: userId
        },
        order: [['session_date', 'DESC']],
        limit: 20 // Last 20 sessions
      });

      // Aggregate psychological patterns from analyses
      const patterns = this.extractPsychologicalPatterns(analyses);
      
      // Build comprehensive profile
      const profile = {
        demographics: {
          id: patient.id,
          name: `${patient.user?.first_name || ''} ${patient.user?.last_name || ''}`.trim(),
          age,
          gender: patient.gender,
          dateOfBirth: patient.date_of_birth,
          email: patient.user?.email
        },
        clinical: {
          status: patient.status,
          therapyGoals: patient.therapy_goals,
          medicalHistory: patient.medical_history,
          currentMedications: patient.current_medications || [],
          sessionFrequency: patient.session_frequency,
          emergencyContact: patient.emergency_contact
        },
        analysisHistory: {
          totalAnalyses: analyses.length,
          recentAnalyses: analyses.slice(0, 5).map(a => ({
            id: a.id,
            date: a.created_at,
            type: a.analysis_type,
            summary: this.extractAnalysisSummary(a.results)
          })),
          patterns
        },
        sessionHistory: {
          totalSessions: sessions.length,
          recentSessions: sessions.slice(0, 5).map(s => ({
            id: s.id,
            date: s.session_date,
            duration: s.duration,
            status: s.status,
            keyThemes: s.notes ? this.extractKeyThemes(s.notes) : []
          }))
        },
        psychologicalProfile: this.buildPsychologicalProfile(analyses, sessions),
        metadata: {
          profileGeneratedAt: new Date(),
          dataTimeRange: this.calculateTimeRange(analyses, sessions)
        }
      };

      return profile;
    } catch (error) {
      console.error('Error getting patient profile:', error);
      throw error;
    }
  }

  /**
   * Extract psychological patterns from analysis history
   * @param {Array} analyses - Array of analysis records
   * @returns {Object} Extracted patterns
   */
  static extractPsychologicalPatterns(analyses) {
    const patterns = {
      recurringThemes: new Map(),
      emotionalStates: new Map(),
      copingMechanisms: new Map(),
      riskFactors: new Map(),
      protectiveFactors: new Map(),
      behavioralPatterns: new Map(),
      cognitivePatterns: new Map(),
      interpersonalDynamics: new Map()
    };

    analyses.forEach(analysis => {
      if (!analysis.results) return;
      
      const results = typeof analysis.results === 'string' ? 
        JSON.parse(analysis.results) : analysis.results;

      // Extract themes
      if (results.themes) {
        results.themes.forEach(theme => {
          const count = patterns.recurringThemes.get(theme) || 0;
          patterns.recurringThemes.set(theme, count + 1);
        });
      }

      // Extract emotional states
      if (results.emotionalAnalysis) {
        Object.entries(results.emotionalAnalysis).forEach(([emotion, score]) => {
          const current = patterns.emotionalStates.get(emotion) || { count: 0, avgScore: 0 };
          current.count++;
          current.avgScore = (current.avgScore * (current.count - 1) + score) / current.count;
          patterns.emotionalStates.set(emotion, current);
        });
      }

      // Extract coping mechanisms
      if (results.copingStrategies) {
        results.copingStrategies.forEach(strategy => {
          const count = patterns.copingMechanisms.get(strategy) || 0;
          patterns.copingMechanisms.set(strategy, count + 1);
        });
      }

      // Extract risk and protective factors
      if (results.riskAssessment) {
        results.riskAssessment.factors?.forEach(factor => {
          const count = patterns.riskFactors.get(factor) || 0;
          patterns.riskFactors.set(factor, count + 1);
        });
      }

      if (results.protectiveFactors) {
        results.protectiveFactors.forEach(factor => {
          const count = patterns.protectiveFactors.get(factor) || 0;
          patterns.protectiveFactors.set(factor, count + 1);
        });
      }

      // Extract behavioral patterns
      if (results.behavioralPatterns) {
        results.behavioralPatterns.forEach(pattern => {
          const count = patterns.behavioralPatterns.get(pattern) || 0;
          patterns.behavioralPatterns.set(pattern, count + 1);
        });
      }

      // Extract cognitive patterns
      if (results.cognitivePatterns) {
        results.cognitivePatterns.forEach(pattern => {
          const count = patterns.cognitivePatterns.get(pattern) || 0;
          patterns.cognitivePatterns.set(pattern, count + 1);
        });
      }

      // Extract interpersonal dynamics
      if (results.interpersonalAnalysis) {
        Object.entries(results.interpersonalAnalysis).forEach(([dynamic, value]) => {
          const current = patterns.interpersonalDynamics.get(dynamic) || { count: 0, details: [] };
          current.count++;
          if (typeof value === 'string') current.details.push(value);
          patterns.interpersonalDynamics.set(dynamic, current);
        });
      }
    });

    // Convert maps to sorted arrays
    return {
      recurringThemes: this.mapToSortedArray(patterns.recurringThemes),
      emotionalStates: this.mapToSortedArray(patterns.emotionalStates),
      copingMechanisms: this.mapToSortedArray(patterns.copingMechanisms),
      riskFactors: this.mapToSortedArray(patterns.riskFactors),
      protectiveFactors: this.mapToSortedArray(patterns.protectiveFactors),
      behavioralPatterns: this.mapToSortedArray(patterns.behavioralPatterns),
      cognitivePatterns: this.mapToSortedArray(patterns.cognitivePatterns),
      interpersonalDynamics: this.mapToSortedArray(patterns.interpersonalDynamics)
    };
  }

  /**
   * Build comprehensive psychological profile
   * @param {Array} analyses - Analysis records
   * @param {Array} sessions - Session records
   * @returns {Object} Psychological profile
   */
  static buildPsychologicalProfile(analyses, sessions) {
    const profile = {
      primaryDiagnosticImpressions: [],
      personalityTraits: [],
      attachmentStyle: null,
      defenseMechanisms: [],
      developmentalConsiderations: [],
      strengthsAndResources: [],
      areasForGrowth: [],
      therapeuticRecommendations: [],
      prognosticIndicators: {
        positive: [],
        challenging: []
      }
    };

    // Analyze patterns across all data
    analyses.forEach(analysis => {
      const results = typeof analysis.results === 'string' ? 
        JSON.parse(analysis.results) : analysis.results;

      // Extract diagnostic impressions
      if (results.diagnosticImpressions) {
        profile.primaryDiagnosticImpressions.push(...results.diagnosticImpressions);
      }

      // Extract personality traits
      if (results.personalityAssessment) {
        profile.personalityTraits.push(...Object.keys(results.personalityAssessment));
      }

      // Extract attachment style
      if (results.attachmentStyle && !profile.attachmentStyle) {
        profile.attachmentStyle = results.attachmentStyle;
      }

      // Extract defense mechanisms
      if (results.defenseMechanisms) {
        profile.defenseMechanisms.push(...results.defenseMechanisms);
      }

      // Extract strengths
      if (results.strengths) {
        profile.strengthsAndResources.push(...results.strengths);
      }

      // Extract areas for growth
      if (results.challenges || results.areasForGrowth) {
        profile.areasForGrowth.push(...(results.challenges || results.areasForGrowth));
      }

      // Extract therapeutic recommendations
      if (results.recommendations) {
        profile.therapeuticRecommendations.push(...results.recommendations);
      }
    });

    // Remove duplicates and prioritize by frequency
    Object.keys(profile).forEach(key => {
      if (Array.isArray(profile[key])) {
        profile[key] = [...new Set(profile[key])].slice(0, 10); // Top 10 unique items
      }
    });

    return profile;
  }

  /**
   * Extract summary from analysis results
   * @param {Object|string} results - Analysis results
   * @returns {string} Summary
   */
  static extractAnalysisSummary(results) {
    const data = typeof results === 'string' ? JSON.parse(results) : results;
    
    if (data.summary) return data.summary;
    if (data.mainFindings) return data.mainFindings.slice(0, 200) + '...';
    if (data.keyInsights) return data.keyInsights[0] || 'Analysis completed';
    
    return 'Analysis data available';
  }

  /**
   * Extract key themes from session notes
   * @param {string} notes - Session notes
   * @returns {Array} Key themes
   */
  static extractKeyThemes(notes) {
    // Simple keyword extraction - can be enhanced with NLP
    const keywords = [
      'anxiety', 'depression', 'stress', 'trauma', 'relationship',
      'family', 'work', 'self-esteem', 'anger', 'grief', 'loss',
      'addiction', 'sleep', 'eating', 'mood', 'panic', 'fear',
      'phobia', 'obsession', 'compulsion', 'identity', 'boundaries'
    ];
    
    const themes = [];
    const lowerNotes = notes.toLowerCase();
    
    keywords.forEach(keyword => {
      if (lowerNotes.includes(keyword)) {
        themes.push(keyword);
      }
    });
    
    return themes;
  }

  /**
   * Convert Map to sorted array
   * @param {Map} map - Map to convert
   * @returns {Array} Sorted array
   */
  static mapToSortedArray(map) {
    return Array.from(map.entries())
      .sort((a, b) => {
        // Sort by count/frequency if it's a number
        if (typeof a[1] === 'number' && typeof b[1] === 'number') {
          return b[1] - a[1];
        }
        // Sort by count property if it exists
        if (a[1].count !== undefined && b[1].count !== undefined) {
          return b[1].count - a[1].count;
        }
        return 0;
      })
      .slice(0, 10) // Top 10 items
      .map(([key, value]) => ({ key, value }));
  }

  /**
   * Calculate time range of data
   * @param {Array} analyses - Analysis records
   * @param {Array} sessions - Session records
   * @returns {Object} Time range
   */
  static calculateTimeRange(analyses, sessions) {
    const dates = [
      ...analyses.map(a => new Date(a.created_at)),
      ...sessions.map(s => new Date(s.session_date))
    ].filter(d => !isNaN(d));

    if (dates.length === 0) {
      return { start: null, end: null, duration: null };
    }

    const sortedDates = dates.sort((a, b) => a - b);
    const start = sortedDates[0];
    const end = sortedDates[sortedDates.length - 1];
    const durationDays = Math.floor((end - start) / (24 * 60 * 60 * 1000));

    return {
      start,
      end,
      durationDays,
      durationText: this.formatDuration(durationDays)
    };
  }

  /**
   * Format duration in human-readable text
   * @param {number} days - Number of days
   * @returns {string} Formatted duration
   */
  static formatDuration(days) {
    if (days === 0) return 'Single day';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  }

  /**
   * Get analysis context for AI prompt enhancement
   * @param {string} patientId - Patient UUID
   * @param {number} userId - User ID
   * @returns {Object} Context for AI analysis
   */
  static async getAnalysisContext(patientId, userId) {
    try {
      const profile = await this.getPatientProfile(patientId, userId);
      
      // Build context string for AI prompt
      const context = {
        demographics: `Patient: ${profile.demographics.age ? profile.demographics.age + ' year old' : 'Age unknown'} ${profile.demographics.gender || 'gender unspecified'}`,
        clinicalBackground: profile.clinical.medicalHistory || 'No medical history provided',
        currentMedications: profile.clinical.currentMedications.length > 0 ? 
          `Currently taking: ${profile.clinical.currentMedications.join(', ')}` : 
          'No current medications',
        therapyGoals: profile.clinical.therapyGoals || 'No specific therapy goals documented',
        recentThemes: profile.analysisHistory.patterns.recurringThemes.slice(0, 5).map(t => t.key).join(', '),
        emotionalProfile: profile.analysisHistory.patterns.emotionalStates.slice(0, 5)
          .map(e => `${e.key}: ${e.value.avgScore?.toFixed(1) || e.value}`)
          .join(', '),
        copingStrategies: profile.analysisHistory.patterns.copingMechanisms.slice(0, 3).map(c => c.key).join(', '),
        primaryConcerns: profile.psychologicalProfile.areasForGrowth.slice(0, 3).join(', '),
        strengths: profile.psychologicalProfile.strengthsAndResources.slice(0, 3).join(', '),
        previousAnalysesCount: profile.analysisHistory.totalAnalyses,
        sessionCount: profile.sessionHistory.totalSessions
      };

      return context;
    } catch (error) {
      console.error('Error getting analysis context:', error);
      // Return minimal context if error occurs
      return {
        demographics: 'Patient demographics unavailable',
        clinicalBackground: '',
        currentMedications: '',
        therapyGoals: '',
        recentThemes: '',
        emotionalProfile: '',
        copingStrategies: '',
        primaryConcerns: '',
        strengths: '',
        previousAnalysesCount: 0,
        sessionCount: 0
      };
    }
  }
}

module.exports = PatientHistoryService;
