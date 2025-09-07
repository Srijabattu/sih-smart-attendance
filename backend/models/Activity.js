const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['academic', 'skill-development', 'career-guidance', 'personal-development'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    estimatedTime: {
        type: Number, // in minutes
        required: true
    },
    tags: [String],
    resources: [{
        type: String,
        url: String,
        description: String
    }],
    targetAudience: {
        department: [String],
        semester: [Number],
        interests: [String]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
