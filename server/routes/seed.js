const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const Attendance = require('../models/Attendance');
const QRCode = require('qrcode');

const sampleParticipants = [
  { name: "Ram Kumar", email: "ram.kumar@example.com" },
  { name: "Priya Sharma", email: "priya.sharma@example.com" },
  { name: "Amit Singh", email: "amit.singh@example.com" },
  { name: "Sneha Patel", email: "sneha.patel@example.com" },
  { name: "Vikram Gupta", email: "vikram.gupta@example.com" },
  { name: "Anita Reddy", email: "anita.reddy@example.com" },
  { name: "Rajesh Kumar", email: "rajesh.kumar@example.com" },
  { name: "Sunita Verma", email: "sunita.verma@example.com" },
  { name: "Deepak Joshi", email: "deepak.joshi@example.com" },
  { name: "Kavita Agarwal", email: "kavita.agarwal@example.com" }
];

// Seed data endpoint
router.post('/seed-data', async (req, res) => {
  try {
    console.log('Starting data seeding...');
    
    // Clear existing data
    await Participant.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

    const createdParticipants = [];
    
    // Create participants
    for (const participantData of sampleParticipants) {
      const registrationId = `ABDC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(registrationId);
      
      const participant = new Participant({
        name: participantData.name,
        email: participantData.email,
        registrationId,
        qrCode: qrCodeDataURL
      });
      
      await participant.save();
      createdParticipants.push(participant);
      console.log(`Created participant: ${participant.name}`);
    }

    // Create some sample attendance records
    for (let i = 0; i < Math.min(5, createdParticipants.length); i++) {
      const participant = createdParticipants[i];
      
      const attendance = new Attendance({
        participantId: participant._id,
        registrationId: participant.registrationId,
        name: participant.name,
        email: participant.email,
        status: 'present',
        timestamp: new Date(),
        scannedBy: 'admin',
        location: 'main-hall'
      });
      
      await attendance.save();
      console.log(`Created attendance record for: ${participant.name}`);
    }

    res.json({
      message: 'Data seeded successfully!',
      participantsCreated: createdParticipants.length,
      attendanceRecordsCreated: Math.min(5, createdParticipants.length)
    });
    
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ 
      message: 'Failed to seed data', 
      error: error.message 
    });
  }
});

module.exports = router;



