const express = require('express');
const {
    generateQRCode,
    markAttendanceQR,
    getStudentAttendance
} = require('../controllers/attendanceController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// QR Code generation (teachers only)
router.post('/generate-qr', restrictTo('teacher', 'admin'), generateQRCode);

// Mark attendance via QR code (students only)
router.post('/mark-qr', restrictTo('student'), markAttendanceQR);

// Get attendance records
router.get('/student/:studentId?', getStudentAttendance);

module.exports = router;
