const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Participant = require('../models/Participant');
const moment = require('moment');

// Mark attendance by scanning QR code
router.post('/scan', async (req, res) => {
  try {
    const { qrData, scannedBy, location } = req.body;

    if (!qrData) {
      return res.status(400).json({ message: 'QR code data is required' });
    }

    // Parse QR code data
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    const { registrationId, name, email } = parsedData;

    // Verify participant exists and is active
    const participant = await Participant.findOne({ 
      registrationId,
      isActive: true 
    });

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found or inactive' });
    }

    // Check if already marked attendance today
    const today = moment().startOf('day');
    const existingAttendance = await Attendance.findOne({
      participantId: participant._id,
      timestamp: {
        $gte: today.toDate(),
        $lt: moment(today).endOf('day').toDate()
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        message: 'Attendance already marked for today',
        attendance: existingAttendance
      });
    }

    // Set status to present for all attendance
    const status = 'present';

    // Create attendance record
    const attendance = new Attendance({
      participantId: participant._id,
      registrationId: participant.registrationId,
      name: participant.name,
      email: participant.email,
      status,
      scannedBy: scannedBy || 'system',
      location: location || 'main-hall'
    });

    await attendance.save();

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: {
        id: attendance._id,
        name: attendance.name,
        email: attendance.email,
        registrationId: attendance.registrationId,
        status: attendance.status,
        timestamp: attendance.timestamp,
        scannedBy: attendance.scannedBy,
        location: attendance.location
      }
    });

  } catch (error) {
    console.error('Attendance scan error:', error);
    res.status(500).json({ message: 'Failed to mark attendance', error: error.message });
  }
});

// Get all attendance records
router.get('/', async (req, res) => {
  try {
    const { date, status, limit = 100, page = 1 } = req.query;
    
    let query = {};
    
    // Filter by date if provided
    if (date) {
      const startDate = moment(date).startOf('day');
      const endDate = moment(date).endOf('day');
      query.timestamp = {
        $gte: startDate.toDate(),
        $lt: endDate.toDate()
      };
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const attendance = await Attendance.find(query)
      .populate('participantId', 'name email registrationId')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Attendance.countDocuments(query);

    res.json({
      attendance,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
});

// Get attendance statistics
router.get('/stats', async (req, res) => {
  try {
    const { date } = req.query;
    
    let dateFilter = {};
    if (date) {
      const startDate = moment(date).startOf('day');
      const endDate = moment(date).endOf('day');
      dateFilter.timestamp = {
        $gte: startDate.toDate(),
        $lt: endDate.toDate()
      };
    }

    // Get total registered participants
    const totalRegistered = await Participant.countDocuments({ isActive: true });

    // Get attendance statistics
    const stats = await Attendance.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const attendanceStats = {
      present: 0,
      absent: 0
    };

    stats.forEach(stat => {
      attendanceStats[stat._id] = stat.count;
    });

    const totalAttended = attendanceStats.present;
    const absentCount = totalRegistered - totalAttended;

    res.json({
      totalRegistered,
      totalAttended,
      present: attendanceStats.present,
      absent: absentCount,
      attendanceRate: totalRegistered > 0 ? ((totalAttended / totalRegistered) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance statistics', error: error.message });
  }
});

// Get attendance for a specific participant
router.get('/participant/:registrationId', async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { date } = req.query;

    // Find participant
    const participant = await Participant.findOne({ 
      registrationId,
      isActive: true 
    });

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    let query = { participantId: participant._id };
    
    if (date) {
      const startDate = moment(date).startOf('day');
      const endDate = moment(date).endOf('day');
      query.timestamp = {
        $gte: startDate.toDate(),
        $lt: endDate.toDate()
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ timestamp: -1 });

    res.json({
      participant: {
        id: participant._id,
        name: participant.name,
        email: participant.email,
        registrationId: participant.registrationId
      },
      attendance
    });
  } catch (error) {
    console.error('Get participant attendance error:', error);
    res.status(500).json({ message: 'Failed to fetch participant attendance', error: error.message });
  }
});

// Update attendance record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('participantId', 'name email registrationId');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({
      message: 'Attendance updated successfully',
      attendance
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Failed to update attendance', error: error.message });
  }
});

module.exports = router;
