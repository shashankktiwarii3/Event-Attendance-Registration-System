# QR Event Management System

A comprehensive event registration and attendance management system using QR codes, built with React.js frontend and Node.js backend.

## Features

### Frontend (User Side)
-  Registration form with Name, Email, and auto-generated Registration ID
-  Unique QR code generation for each participant
-  QR code download functionality with multiple fallback methods
-  QR code scanner for marking attendance (web/mobile compatible)
-  Participant lookup functionality with search by ID or email
-  Professional dark theme with gradient accents
-  Responsive design with modern UI/UX
-  Success modal for attendance confirmation
-  Real-time notifications and feedback

### Backend (Server Side)
-  Node.js with Express.js
-  MongoDB database for storing registration & attendance data
- QR code verification and attendance marking
-  Duplicate prevention with timestamp tracking
-  RESTful API endpoints
-  Data cleanup utilities for status management
-  Comprehensive error handling and validation

### Data Export
-  Excel export functionality with comprehensive attendance data
-  Columns: Name, Email, Registration ID, Status, Timestamp, Location
-  Clean data export

### Admin Dashboard
-  Secure admin login with authentication
-  Live attendance tracking with real-time updates
-  Real-time statistics and analytics
-  Download attendance reports to Excel
-  Participant management and lookup
-  Data cleanup tools for status management

## Tech Stack

### Frontend
- React.js 18
- React Router for navigation
- Styled Components for styling
- QR Code React for QR code generation
- QR Scanner for web-based scanning
- Axios for API calls
- React Toastify for notifications
- Lucide React for icons
- HTML2Canvas for QR code download
- QRCode library for direct QR generation

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- QRCode library for QR generation
- XLSX for Excel export
- Moment.js for date handling
- CORS for cross-origin requests

## Installation & Setup

### Prerequisites
- Node.JS
- MongoDB 
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/shashankktiwarii3/Event-Attendance-Registration-System
cd Event-Attendance-Registration-System
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install-all
```

### 3. Database Setup
Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update the MONGODB_URI in server/config.env
```

### 4. Environment Configuration
Update the database connection in `server/config.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/qr-events
NODE_ENV=development
```

### 5. Seed Sample Data (Optional)
```bash
cd server
node scripts/seedData.js
```

This will create 15 sample participants with Indian names and some attendance records for testing.

#### Manual Data Entry Methods

**Method 1: Using the Seed Script (Recommended)**
```bash
# Navigate to server directory
cd server

# Run the seed script
node scripts/seedData.js
```

**Method 2: Using MongoDB Compass (GUI)**
1. Open MongoDB Compass
2. Connect to your database (`mongodb://localhost:27017/qr-events`)
3. Navigate to the `participants` collection
4. Click "Add Data" → "Insert Document"
5. Add participant data in JSON format:
```json
{
  "name": "Your Name",
  "email": "your.email@example.com",
  "registrationId": "ABDC-1234567890-ABC12",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "registeredAt": "2024-01-15T10:30:00.000Z"
}
```

**Method 3: Using MongoDB Shell**
```bash
# Connect to MongoDB
mongosh

# Use the database
use qr-events

# Insert a participant
db.participants.insertOne({
  name: "Test User",
  email: "test@example.com",
  registrationId: "ABDC-1234567890-TEST1",
  qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  registeredAt: new Date()
})

# Insert attendance record
db.attendance.insertOne({
  participantId: ObjectId("..."), // Use actual participant ID
  registrationId: "ABDC-1234567890-TEST1",
  name: "Test User",
  email: "test@example.com",
  status: "present",
  timestamp: new Date(),
  scannedBy: "manual",
  location: "main-hall"
})
```

**Method 4: Bulk Insert with JSON File**
1. Create a JSON file with your data:
```json
[
  {
    "name": "Ram Kumar",
    "email": "ram.kumar@example.com",
    "registrationId": "ABDC-1234567890-RAM01",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "registeredAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "name": "Priya Sharma",
    "email": "priya.sharma@example.com",
    "registrationId": "ABDC-1234567890-PRI01",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "registeredAt": "2024-01-15T10:35:00.000Z"
  }
]
```

2. Import using mongoimport:
```bash
mongoimport --db qr-events --collection participants --file participants.json --jsonArray
```

**Method 5: Custom Seed Script**
Create your own seed script (`server/scripts/customSeed.js`):
```javascript
const mongoose = require('mongoose');
const Participant = require('../models/Participant');
const Attendance = require('../models/Attendance');

const customParticipants = [
  {
    name: "Your Custom Name",
    email: "custom@example.com"
  },
  // Add more participants...
];

const seedCustomData = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/qr-events');
    
    // Clear existing data
    await Participant.deleteMany({});
    await Attendance.deleteMany({});
    
    // Insert custom participants
    for (const participantData of customParticipants) {
      const registrationId = `ABCD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const participant = new Participant({
        name: participantData.name,
        email: participantData.email,
        registrationId,
        qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." // Generate actual QR code
      });
      
      await participant.save();
      console.log(`Created participant: ${participant.name}`);
    }
    
    console.log('Custom data seeded successfully!');
  } catch (error) {
    console.error('Error seeding custom data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedCustomData();
```

Run your custom script:
```bash
cd server
node scripts/customSeed.js
```

#### Data Management Commands

**Clear All Data:**
```bash
# Clear participants and attendance
cd server
node -e "
const mongoose = require('mongoose');
const Participant = require('./models/Participant');
const Attendance = require('./models/Attendance');

mongoose.connect('mongodb://localhost:27017/qr-events').then(async () => {
  await Participant.deleteMany({});
  await Attendance.deleteMany({});
  console.log('All data cleared!');
  process.exit(0);
});
"
```

**View Current Data:**
```bash
# View participants count
mongosh --eval "use qr-events; db.participants.countDocuments()"

# View attendance count
mongosh --eval "use qr-events; db.attendance.countDocuments()"

# View all participants
mongosh --eval "use qr-events; db.participants.find().pretty()"
```

**Backup Data:**
```bash
# Export participants
mongoexport --db qr-events --collection participants --out participants_backup.json

# Export attendance
mongoexport --db qr-events --collection attendance --out attendance_backup.json
```

**Restore Data:**
```bash
# Import participants
mongoimport --db qr-events --collection participants --file participants_backup.json

# Import attendance
mongoimport --db qr-events --collection attendance --file attendance_backup.json
```

### 6. Start the Application
```bash
# Start both frontend and backend concurrently
npm run dev

# Or start them separately:
# Backend only
npm run server

# Frontend only
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage Guide

### 1. Registration
- Navigate to `/register`
- Fill in participant details (Name, Email)
- System generates unique Registration ID and QR code
- Download QR code for offline use

### 2. Attendance Scanning
- Navigate to `/scanner`
- Use camera to scan QR codes or enter Registration ID manually
- System marks attendance with timestamp and prevents duplicates
- Shows attendance status (Present only - simplified system)
- Success modal displays detailed attendance confirmation

### 3. Admin Dashboard
- Navigate to `/admin`
- Login with admin credentials (demo: admin / secure123)
- View real-time attendance statistics
- Monitor live attendance feed
- Export attendance data to Excel
- Track attendance trends
- Clean up data status if needed

### 4. Participant Lookup
- Navigate to `/lookup`
- Search participants by Registration ID or Email
- View attendance history for each participant

## API Endpoints

### Participants
- `POST /api/participants/register` - Register new participant
- `GET /api/participants` - Get all participants
- `GET /api/participants/:registrationId` - Get participant by ID
- `PUT /api/participants/:id` - Update participant
- `DELETE /api/participants/:id` - Delete participant

### Attendance
- `POST /api/attendance/scan` - Mark attendance via QR scan
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/stats` - Get attendance statistics
- `GET /api/attendance/participant/:registrationId` - Get participant attendance

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/export/excel` - Export attendance to Excel
- `GET /api/admin/analytics` - Get attendance analytics
- `GET /api/admin/live-feed` - Get live attendance feed
- `POST /api/admin/cleanup-late-status` - Clean up late status records

## Sample Data

The system includes 15 sample participants with Indian names for testing.

Sample Registration IDs format: `ABDC-{timestamp}-{random}`

## Features in Detail

### QR Code System
- Each participant gets a unique QR code containing:
  - Registration ID
  - Name and Email
  - Registration timestamp
- QR codes are generated as high-quality images
- Compatible with mobile and web scanners

### Attendance Tracking
- Real-time attendance marking
- Simplified status system (Present only)
- Duplicate prevention (one attendance per day)
- Location tracking
- Scanner identification
- Success modal with detailed confirmation

### Data Export
- Excel format with multiple sheets
- Includes all participant data
- Attendance timestamps and status
- Clean data export (Present/Absent only)
- Customizable date ranges

### Security Features
- Input validation and sanitization
- Duplicate email prevention
- QR code verification
- Admin authentication system
- Error handling and logging
- Session management



## Troubleshooting

### Common Issues

1. **Camera not working**: Ensure HTTPS or localhost for camera access
2. **MongoDB connection error**: Check if MongoDB is running
3. **QR scanner not detecting**: Ensure good lighting and clear QR codes
4. **Export not working**: Check browser download permissions
5. **QR download not working**: Try refreshing the page or use manual copy option
6. **Admin login issues**: Use demo credentials (admin / secure123)

### Development

```bash
# Run in development mode with hot reload
npm run dev

# Run tests (when implemented)
npm test

# Build for production
npm run build
```


