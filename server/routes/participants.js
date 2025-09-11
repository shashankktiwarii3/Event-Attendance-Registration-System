const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// Register a new participant
router.post('/register', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if email already exists
    const existingParticipant = await Participant.findOne({ email });
    if (existingParticipant) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate unique registration ID
    const registrationId = `NSCC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Create QR code data
    const qrData = JSON.stringify({
      registrationId,
      name,
      email,
      timestamp: new Date().toISOString()
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(qrData);

    // Create participant
    const participant = new Participant({
      name,
      email,
      registrationId,
      qrCode
    });

    await participant.save();

    res.status(201).json({
      message: 'Registration successful',
      participant: {
        id: participant._id,
        name: participant.name,
        email: participant.email,
        registrationId: participant.registrationId,
        qrCode: participant.qrCode,
        registeredAt: participant.registeredAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Get all participants
router.get('/', async (req, res) => {
  try {
    const participants = await Participant.find({ isActive: true })
      .select('-qrCode') // Exclude QR code from list view
      .sort({ registeredAt: -1 });

    res.json({
      participants,
      total: participants.length
    });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ message: 'Failed to fetch participants', error: error.message });
  }
});

// Get participant by registration ID
router.get('/:registrationId', async (req, res) => {
  try {
    const { registrationId } = req.params;
    
    const participant = await Participant.findOne({ 
      registrationId,
      isActive: true 
    });

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    res.json({
      participant: {
        id: participant._id,
        name: participant.name,
        email: participant.email,
        registrationId: participant.registrationId,
        qrCode: participant.qrCode,
        registeredAt: participant.registeredAt
      }
    });
  } catch (error) {
    console.error('Get participant error:', error);
    res.status(500).json({ message: 'Failed to fetch participant', error: error.message });
  }
});

// Update participant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const participant = await Participant.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    res.json({
      message: 'Participant updated successfully',
      participant
    });
  } catch (error) {
    console.error('Update participant error:', error);
    res.status(500).json({ message: 'Failed to update participant', error: error.message });
  }
});

// Delete participant (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const participant = await Participant.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    res.json({ message: 'Participant deleted successfully' });
  } catch (error) {
    console.error('Delete participant error:', error);
    res.status(500).json({ message: 'Failed to delete participant', error: error.message });
  }
});

module.exports = router;

