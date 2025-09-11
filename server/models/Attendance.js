const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true
  },
  registrationId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'present'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  scannedBy: {
    type: String,
    default: 'system'
  },
  location: {
    type: String,
    default: 'main-hall'
  }
});

// Compound index to prevent duplicate attendance
attendanceSchema.index({ participantId: 1, timestamp: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
