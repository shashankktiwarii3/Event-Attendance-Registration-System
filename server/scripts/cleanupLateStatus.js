const mongoose = require('mongoose');
require('dotenv').config({ path: '../config.env' });

const Attendance = require('../models/Attendance');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nscc-qr-events');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const cleanupLateStatus = async () => {
  try {
    console.log('Starting cleanup of late status records...');
    
    // Find all records with 'late' status
    const lateRecords = await Attendance.find({ status: 'late' });
    console.log(`Found ${lateRecords.length} records with 'late' status`);
    
    if (lateRecords.length > 0) {
      // Update all 'late' records to 'present'
      const result = await Attendance.updateMany(
        { status: 'late' },
        { $set: { status: 'present' } }
      );
      
      console.log(`Updated ${result.modifiedCount} records from 'late' to 'present'`);
    }
    
    // Verify cleanup
    const remainingLateRecords = await Attendance.find({ status: 'late' });
    console.log(`Remaining records with 'late' status: ${remainingLateRecords.length}`);
    
    console.log('Cleanup completed successfully!');
    
  } catch (error) {
    console.error('Cleanup error:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run cleanup if this file is executed directly
if (require.main === module) {
  connectDB().then(() => {
    cleanupLateStatus();
  });
}

module.exports = { cleanupLateStatus };

