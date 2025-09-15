const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Participant = require('../models/Participant');
const XLSX = require('xlsx');
const moment = require('moment');

// Get dashboard statistics (simplified to avoid timeouts)
router.get('/dashboard', async (req, res) => {
  try {
    // Get all participants
    const totalRegistered = await Participant.countDocuments();
    
    // Get all attendance records (same logic as live feed)
    const attendanceRecords = await Attendance.find();
    
    // Count present attendees
    const presentCount = attendanceRecords.filter(record => record.status === 'present').length;
    const totalAttended = attendanceRecords.length;
    const absentCount = totalRegistered - presentCount;
    
    // Debug logging
    console.log('Dashboard Debug:', {
      totalRegistered,
      presentCount,
      totalAttended,
      absentCount,
      attendanceRate: totalRegistered > 0 ? Math.round(((presentCount / totalRegistered) * 100) * 100) / 100 : 0
    });

    // Get recent attendance (last 10 records) - simplified
    const recentAttendance = await Attendance.find()
      .select('name email registrationId status timestamp location scannedBy')
      .sort({ timestamp: -1 })
      .limit(10)
      .lean(); // Use lean() for better performance

    res.json({
      today: {
        totalRegistered,
        totalAttended,
        present: presentCount,
        absent: absentCount,
        attendanceRate: totalRegistered > 0 ? Math.round(((presentCount / totalRegistered) * 100) * 100) / 100 : 0
      },
      yesterday: {
        totalAttended: 0, // Simplified - not calculating yesterday for now
        present: 0
      },
      trends: {
        attendanceChange: 0, // Simplified
        direction: 'same'
      },
      recentAttendance
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics', error: error.message });
  }
});

// Export attendance to Excel
router.get('/export/excel', async (req, res) => {
  try {
    const { date, status, format = 'xlsx' } = req.query;

    let query = {};
    
    // Filter by date if provided
    if (date) {
      const startDate = moment(date).startOf('day');
      const endDate = moment(date).endOf('day');
      query.timestamp = {
        $gte: startDate.toDate(),
        $lt: endDate.toDate()
      };
    } else {
      // Default to today if no date specified
      const today = moment().startOf('day');
      query.timestamp = {
        $gte: today.toDate(),
        $lt: moment(today).endOf('day').toDate()
      };
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Get attendance data
    const attendance = await Attendance.find(query)
      .populate('participantId', 'name email registrationId')
      .sort({ timestamp: -1 });

    // Get all registered participants for comparison
    const allParticipants = await Participant.find({ isActive: true });

    // Create Excel data
    const excelData = [];

    // Add header row
    excelData.push([
      'Name',
      'Email',
      'Registration ID',
      'Status',
      'Timestamp',
      'Scanned By',
      'Location'
    ]);

    // Add attendance records
    attendance.forEach(record => {
      excelData.push([
        record.name,
        record.email,
        record.registrationId,
        record.status.toUpperCase(),
        moment(record.timestamp).format('YYYY-MM-DD HH:mm:ss'),
        record.scannedBy,
        record.location
      ]);
    });

    // Add absent participants
    const attendedIds = attendance.map(a => a.participantId._id.toString());
    const absentParticipants = allParticipants.filter(p => 
      !attendedIds.includes(p._id.toString())
    );

    absentParticipants.forEach(participant => {
      excelData.push([
        participant.name,
        participant.email,
        participant.registrationId,
        'ABSENT',
        '-',
        '-',
        '-'
      ]);
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    worksheet['!cols'] = [
      { width: 20 }, // Name
      { width: 30 }, // Email
      { width: 20 }, // Registration ID
      { width: 10 }, // Status
      { width: 20 }, // Timestamp
      { width: 15 }, // Scanned By
      { width: 15 }  // Location
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');

    // Generate buffer
    const buffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: format === 'csv' ? 'csv' : 'xlsx' 
    });

    // Set response headers
    const filename = `attendance-report-${moment().format('YYYY-MM-DD')}.${format === 'csv' ? 'csv' : 'xlsx'}`;
    const contentType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);

  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ message: 'Failed to export attendance data', error: error.message });
  }
});

// Get attendance analytics
router.get('/analytics', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const endDate = moment().endOf('day');
    const startDate = moment().subtract(parseInt(days), 'days').startOf('day');

    // Get daily attendance data
    const dailyStats = await Attendance.aggregate([
      {
        $match: {
          timestamp: {
            $gte: startDate.toDate(),
            $lt: endDate.toDate()
          }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          attendance: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Get hourly distribution for today
    const hourlyStats = await Attendance.aggregate([
      {
        $match: {
          timestamp: {
            $gte: moment().startOf('day').toDate(),
            $lt: moment().endOf('day').toDate()
          }
        }
      },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Get status distribution
    const statusDistribution = await Attendance.aggregate([
      {
        $match: {
          timestamp: {
            $gte: startDate.toDate(),
            $lt: endDate.toDate()
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      dailyStats,
      hourlyStats,
      statusDistribution,
      period: {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        days: parseInt(days)
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

// Get live attendance feed - show all participants with their status
router.get('/live-feed', async (req, res) => {
  try {
    const { limit } = req.query;

    // Get all participants
    let participantsQuery = Participant.find().sort({ registeredAt: -1 });
    if (limit) {
      participantsQuery = participantsQuery.limit(parseInt(limit));
    }
    const participants = await participantsQuery;

    // Get all attendance records
    const attendanceRecords = await Attendance.find();

    // Create a map of attendance by registration ID
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.registrationId] = record;
    });

    // Combine participants with their attendance status
    const liveFeed = participants.map(participant => {
      const attendance = attendanceMap[participant.registrationId];
      return {
        _id: participant._id,
        name: participant.name,
        email: participant.email,
        registrationId: participant.registrationId,
        status: attendance ? attendance.status : 'absent',
        timestamp: attendance ? attendance.timestamp : participant.registeredAt,
        scannedBy: attendance ? attendance.scannedBy : 'not-scanned',
        location: attendance ? attendance.location : 'not-scanned'
      };
    });

    // Sort by timestamp (most recent first)
    liveFeed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      attendance: liveFeed,
      lastUpdated: new Date().toISOString(),
      totalRecords: liveFeed.length,
      presentCount: liveFeed.filter(p => p.status === 'present').length,
      absentCount: liveFeed.filter(p => p.status === 'absent').length
    });
  } catch (error) {
    console.error('Live feed error:', error);
    res.status(500).json({ message: 'Failed to fetch live attendance feed', error: error.message });
  }
});

// Cleanup late status records
router.post('/cleanup-late-status', async (req, res) => {
  try {
    const result = await Attendance.updateMany(
      { status: 'late' },
      { $set: { status: 'present' } }
    );
    
    res.json({
      message: 'Cleanup completed',
      updatedRecords: result.modifiedCount
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: 'Failed to cleanup late status records', error: error.message });
  }
});

module.exports = router;
