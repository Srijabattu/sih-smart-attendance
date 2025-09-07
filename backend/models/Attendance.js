const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    classSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassSession',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    checkInTime: {
        type: Date,
        required: true
    },
    checkOutTime: Date,
    status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        default: 'present'
    },
    method: {
        type: String,
        enum: ['qr-code', 'face-recognition', 'manual'],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
attendanceSchema.index({ student: 1, date: 1, subject: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
