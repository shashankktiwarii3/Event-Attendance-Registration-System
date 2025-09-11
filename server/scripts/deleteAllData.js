const mongoose = require('mongoose');
const Participant = require('../models/Participant');
const Attendance = require('../models/Attendance');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shashank:0eqNi0glGAfokSCv@cluster0.tcnnfu6.mongodb.net/nscc-qr-events';

async function deleteAllData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 Current data count:');
    const participantCount = await Participant.countDocuments();
    const attendanceCount = await Attendance.countDocuments();
    console.log(`- Participants: ${participantCount}`);
    console.log(`- Attendance records: ${attendanceCount}`);

    if (participantCount === 0 && attendanceCount === 0) {
      console.log('\n✅ Database is already empty!');
      return;
    }

    console.log('\n⚠️  WARNING: This will delete ALL data!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\n🗑️  Deleting all participants...');
    const participantResult = await Participant.deleteMany({});
    console.log(`✅ Deleted ${participantResult.deletedCount} participants`);

    console.log('🗑️  Deleting all attendance records...');
    const attendanceResult = await Attendance.deleteMany({});
    console.log(`✅ Deleted ${attendanceResult.deletedCount} attendance records`);

    console.log('\n🎉 All data deleted successfully!');
    console.log('\n📊 Final count:');
    console.log(`- Participants: ${await Participant.countDocuments()}`);
    console.log(`- Attendance records: ${await Attendance.countDocuments()}`);

  } catch (error) {
    console.error('❌ Error deleting data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
deleteAllData();
