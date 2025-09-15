const mongoose = require('mongoose');
const QRCode = require('qrcode');
require('dotenv').config({ path: '../config.env' });

const Participant = require('../models/Participant');
const Attendance = require('../models/Attendance');

// Sample participants data with Indian names
const sampleParticipants = [
  {
    name: 'Ram Kumar',
    email: 'ram.kumar@example.com'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com'
  },
  {
    name: 'Arjun Singh',
    email: 'arjun.singh@example.com'
  },
  {
    name: 'Kavya Patel',
    email: 'kavya.patel@example.com'
  },
  {
    name: 'Vikram Gupta',
    email: 'vikram.gupta@example.com'
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com'
  },
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com'
  },
  {
    name: 'Ananya Joshi',
    email: 'ananya.joshi@example.com'
  },
  {
    name: 'Karthik Nair',
    email: 'karthik.nair@example.com'
  },
  {
    name: 'Meera Iyer',
    email: 'meera.iyer@example.com'
  },
  {
    name: 'Shyam Sundar',
    email: 'shyam.sundar@example.com'
  },
  {
    name: 'Deepika Agarwal',
    email: 'deepika.agarwal@example.com'
  },
  {
    name: 'Rohit Malhotra',
    email: 'rohit.malhotra@example.com'
  },
  {
    name: 'Pooja Mehta',
    email: 'pooja.mehta@example.com'
  },
  {
    name: 'Amit Kumar',
    email: 'amit.kumar@example.com'
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qr-events');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const generateQRCode = async (data) => {
  return await QRCode.toDataURL(JSON.stringify(data));
};

const seedParticipants = async () => {
  try {
    // Clear existing participants
    await Participant.deleteMany({});
    console.log('Cleared existing participants');

    const participants = [];
    
    for (const participantData of sampleParticipants) {
      // Generate unique registration ID
      const registrationId = `ABDC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Create QR code data
      const qrData = {
        registrationId,
        name: participantData.name,
        email: participantData.email,
        timestamp: new Date().toISOString()
      };

      // Generate QR code
      const qrCode = await generateQRCode(qrData);

      // Create participant
      const participant = new Participant({
        name: participantData.name,
        email: participantData.email,
        registrationId,
        qrCode
      });

      participants.push(participant);
    }

    // Save all participants
    await Participant.insertMany(participants);
    console.log(`Created ${participants.length} participants`);

    return participants;
  } catch (error) {
    console.error('Error seeding participants:', error);
    throw error;
  }
};

const seedAttendance = async (participants) => {
  try {
    // Clear existing attendance
    await Attendance.deleteMany({});
    console.log('Cleared existing attendance records');

    const attendanceRecords = [];
    const now = new Date();
    
    // Mark attendance for some participants (simulate different scenarios)
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      
      // Skip some participants to simulate absentees
      if (i >= 7) continue;
      
      // Create attendance record
      const attendanceTime = new Date(now.getTime() - (Math.random() * 2 * 60 * 60 * 1000)); // Random time within last 2 hours
      const status = 'present';
      
      const attendance = new Attendance({
        participantId: participant._id,
        registrationId: participant.registrationId,
        name: participant.name,
        email: participant.email,
        status,
        timestamp: attendanceTime,
        scannedBy: 'system',
        location: 'main-hall'
      });

      attendanceRecords.push(attendance);
    }

    // Save all attendance records
    await Attendance.insertMany(attendanceRecords);
    console.log(`Created ${attendanceRecords.length} attendance records`);

    return attendanceRecords;
  } catch (error) {
    console.error('Error seeding attendance:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    const participants = await seedParticipants();
    const attendance = await seedAttendance(participants);
    
    console.log('\n=== SEEDING COMPLETE ===');
    console.log(`Participants created: ${participants.length}`);
    console.log(`Attendance records created: ${attendance.length}`);
    console.log('\nSample Registration IDs:');
    participants.slice(0, 5).forEach(p => {
      console.log(`- ${p.name}: ${p.registrationId}`);
    });
    
    console.log('\nYou can now test the system with these sample participants!');
    
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedParticipants, seedAttendance };
