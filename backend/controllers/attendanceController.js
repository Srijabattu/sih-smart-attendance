const Attendance = require('../models/Attendance');
const ClassSession = require('../models/ClassSession');
const User = require('../models/User');
const QRCode = require('qrcode');
const crypto = require('crypto');

// Generate QR Code for class session
const generateQRCode = async (req, res) => {
    try {
        const { classSessionId } = req.body;
        const teacherId = req.user.id;

        // Find class session
        const classSession = await ClassSession.findById(classSessionId);
        if (!classSession) {
            return res.status(404).json({
                success: false,
                message: 'Class session not found'
            });
        }

        // Check if teacher owns this session
        if (classSession.teacher.toString() !== teacherId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to generate QR code for this class'
            });
        }

        // Generate unique QR code data
        const qrData = {
            classSessionId: classSession._id,
            timestamp: Date.now(),
            token: crypto.randomBytes(16).toString('hex')
        };

        // Generate QR code
        const qrCodeString = await QRCode.toDataURL(JSON.stringify(qrData));

        // Update class session with QR code info
        classSession.qrCode = qrData.token;
        classSession.qrCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
        await classSession.save();

        // Emit QR code to connected clients in this class
        const io = req.app.get('io');
        io.to(classSessionId).emit('qr-code-generated', {
            qrCode: qrCodeString,
            expiryTime: classSession.qrCodeExpiry
        });

        res.status(200).json({
            success: true,
            message: 'QR Code generated successfully',
            qrCode: qrCodeString,
            expiryTime: classSession.qrCodeExpiry
        });
    } catch (error) {
        console.error('QR Code generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate QR code',
            error: error.message
        });
    }
};

// Mark attendance via QR code
const markAttendanceQR = async (req, res) => {
    try {
        const { qrData } = req.body;
        const studentId = req.user.id;

        // Parse QR data
        const parsedData = JSON.parse(qrData);
        const { classSessionId, token } = parsedData;

        // Find class session
        const classSession = await ClassSession.findById(classSessionId)
            .populate('teacher', 'name email');
        
        if (!classSession) {
            return res.status(404).json({
                success: false,
                message: 'Invalid QR code - class session not found'
            });
        }

        // Check QR code validity
        if (classSession.qrCode !== token || new Date() > classSession.qrCodeExpiry) {
            return res.status(400).json({
                success: false,
                message: 'QR code has expired or is invalid'
            });
        }

        // Check if student is enrolled in this class
        if (!classSession.enrolledStudents.includes(studentId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not enrolled in this class'
            });
        }

        // Check if attendance already marked
        const existingAttendance = await Attendance.findOne({
            classSession: classSessionId,
            student: studentId,
            date: {
                $gte: new Date().setHours(0, 0, 0, 0),
                $lt: new Date().setHours(23, 59, 59, 999)
            }
        });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: 'Attendance already marked for this class today'
            });
        }

        // Create attendance record
        const attendance = await Attendance.create({
            classSession: classSessionId,
            student: studentId,
            teacher: classSession.teacher._id,
            subject: classSession.subject,
            checkInTime: new Date(),
            method: 'qr-code',
            location: classSession.classroom,
            verified: true
        });

        // Update attendance count
        classSession.attendanceCount += 1;
        await classSession.save();

        // Emit real-time update
        const io = req.app.get('io');
        io.to(classSessionId).emit('attendance-marked', {
            studentId,
            studentName: req.user.name,
            timestamp: attendance.checkInTime
        });

        res.status(200).json({
            success: true,
            message: 'Attendance marked successfully',
            attendance: {
                id: attendance._id,
                subject: attendance.subject,
                checkInTime: attendance.checkInTime,
                status: attendance.status
            }
        });
    } catch (error) {
        console.error('QR Attendance marking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark attendance',
            error: error.message
        });
    }
};

// Get attendance for a student
const getStudentAttendance = async (req, res) => {
    try {
        const studentId = req.user.role === 'student' ? req.user.id : req.params.studentId;
        const { startDate, endDate, subject } = req.query;

        let query = { student: studentId };

        // Add date filter if provided
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Add subject filter if provided
        if (subject) {
            query.subject = subject;
        }

        const attendance = await Attendance.find(query)
            .populate('classSession', 'subject classroom startTime endTime')
            .populate('teacher', 'name email')
            .sort({ date: -1 });

        // Calculate attendance statistics
        const totalClasses = attendance.length;
        const presentClasses = attendance.filter(a => a.status === 'present').length;
        const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                attendance,
                statistics: {
                    totalClasses,
                    presentClasses,
                    absentClasses: totalClasses - presentClasses,
                    attendancePercentage: parseFloat(attendancePercentage)
                }
            }
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attendance',
            error: error.message
        });
    }
};

module.exports = {
    generateQRCode,
    markAttendanceQR,
    getStudentAttendance
};
