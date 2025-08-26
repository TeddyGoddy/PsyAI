const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Patient = require('../models/Patient');

// Get psychological profile text for a patient
router.get('/:id/profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    // Simple access control: allow owner or assigned psychologist
    if (patient.user_id !== req.user.id && patient.psychologist_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.json({
      success: true,
      data: {
        id: patient.id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        birth_place: patient.birth_place,
        residence: patient.residence,
        gender: patient.gender,
        therapy_start_date: patient.therapy_start_date,
        previous_therapy: patient.previous_therapy,
        current_medications: patient.current_medications,
        therapy_goals: patient.therapy_goals,
        psychological_profile: patient.psychological_profile || '',
        updated_at: patient.updated_at
      }
    });
  } catch (err) {
    console.error('GET /patients/:id/profile error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update psychological profile text for a patient
router.put('/:id/profile', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { psychological_profile } = req.body;

    if (typeof psychological_profile !== 'string') {
      return res.status(400).json({ success: false, message: 'psychological_profile (string) is required' });
    }

    const patient = await Patient.findByPk(id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    // Access control
    if (patient.psychologist_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only assigned psychologist or admin can update profile' });
    }

    // Update all provided fields with validation
    if (req.body.first_name !== undefined) patient.first_name = req.body.first_name;
    if (req.body.last_name !== undefined) patient.last_name = req.body.last_name;
    
    // Handle date fields with validation
    if (req.body.date_of_birth !== undefined) {
      const dob = req.body.date_of_birth;
      patient.date_of_birth = (dob && dob !== 'Invalid date' && !isNaN(new Date(dob))) ? dob : null;
    }
    
    if (req.body.birth_place !== undefined) patient.birth_place = req.body.birth_place;
    if (req.body.residence !== undefined) patient.residence = req.body.residence;
    if (req.body.gender !== undefined) patient.gender = req.body.gender;
    
    if (req.body.therapy_start_date !== undefined) {
      const tsd = req.body.therapy_start_date;
      patient.therapy_start_date = (tsd && tsd !== 'Invalid date' && !isNaN(new Date(tsd))) ? tsd : null;
    }
    
    if (req.body.previous_therapy !== undefined) patient.previous_therapy = req.body.previous_therapy;
    if (req.body.current_medications !== undefined) patient.current_medications = req.body.current_medications;
    if (req.body.therapy_goals !== undefined) patient.therapy_goals = req.body.therapy_goals;
    patient.psychological_profile = psychological_profile;
    await patient.save();

    return res.json({
      success: true,
      message: 'Profile updated',
      data: {
        id: patient.id,
        psychological_profile: patient.psychological_profile,
        updated_at: patient.updated_at
      }
    });
  } catch (err) {
    console.error('PUT /patients/:id/profile error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Archive a patient (soft delete)
router.put('/:id/archive', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id);
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Access control
    if (patient.psychologist_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    patient.status = 'inactive';
    await patient.save();
    
    return res.json({
      success: true,
      message: 'Patient archived successfully',
      data: { id: patient.id, status: patient.status }
    });
  } catch (err) {
    console.error('PUT /patients/:id/archive error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Restore an archived patient
router.put('/:id/restore', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id);
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Access control
    if (patient.psychologist_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    patient.status = 'active';
    await patient.save();
    
    return res.json({
      success: true,
      message: 'Patient restored successfully',
      data: { id: patient.id, status: patient.status }
    });
  } catch (err) {
    console.error('PUT /patients/:id/restore error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a patient permanently (hard delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id);
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Access control
    if (patient.psychologist_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    await patient.destroy();
    
    return res.json({
      success: true,
      message: 'Patient deleted permanently'
    });
  } catch (err) {
    console.error('DELETE /patients/:id error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
