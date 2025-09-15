const mongoose = require('mongoose');
const Participant = require('../models/Participant');
const Attendance = require('../models/Attendance');
const QRCode = require('qrcode');

// Use production MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qr-events';

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

const seedProductionData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Clear existing data
    await Participant.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

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
      console.log(`Created participant: ${participant.name}`);
    }

    console.log('Production data seeded successfully!');
    console.log(`Created ${sampleParticipants.length} participants`);
    
  } catch (error) {
    console.error('Error seeding production data:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedProductionData();



