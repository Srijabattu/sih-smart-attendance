const Activity = require('../models/Activity');
const User = require('../models/User');

// Get personalized activity recommendations
const getRecommendedActivities = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { duration, category, difficulty } = req.query;

        // Get student profile
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Build query for activity recommendations
        let query = { isActive: true };

        // Filter by duration if provided
        if (duration) {
            query.estimatedTime = { $lte: parseInt(duration) };
        }

        // Filter by category if provided
        if (category) {
            query.category = category;
        }

        // Filter by difficulty if provided
        if (difficulty) {
            query.difficulty = difficulty;
        }

        // Add targeting filters based on student profile
        if (student.department) {
            query.$or = [
                { 'targetAudience.department': student.department },
                { 'targetAudience.department': { $size: 0 } }
            ];
        }

        if (student.semester) {
            if (query.$or) {
                query.$and = [
                    { $or: query.$or },
                    {
                        $or: [
                            { 'targetAudience.semester': student.semester },
                            { 'targetAudience.semester': { $size: 0 } }
                        ]
                    }
                ];
                delete query.$or;
            } else {
                query.$or = [
                    { 'targetAudience.semester': student.semester },
                    { 'targetAudience.semester': { $size: 0 } }
                ];
            }
        }

        // Get recommended activities
        const activities = await Activity.find(query)
            .limit(10)
            .sort({ createdAt: -1 });

        // Simple recommendation scoring based on student profile match
        const scoredActivities = activities.map(activity => {
            let score = 0;
            
            // Department match
            if (activity.targetAudience.department.includes(student.department)) {
                score += 3;
            }
            
            // Semester match
            if (activity.targetAudience.semester.includes(student.semester)) {
                score += 2;
            }
            
            // Difficulty appropriateness (prefer beginner for new students)
            if (student.semester <= 2 && activity.difficulty === 'beginner') {
                score += 1;
            } else if (student.semester > 2 && activity.difficulty === 'intermediate') {
                score += 1;
            }

            return {
                ...activity.toObject(),
                recommendationScore: score
            };
        });

        // Sort by recommendation score
        scoredActivities.sort((a, b) => b.recommendationScore - a.recommendationScore);

        res.status(200).json({
            success: true,
            message: 'Activity recommendations fetched successfully',
            data: {
                activities: scoredActivities,
                count: scoredActivities.length,
                filters: {
                    duration,
                    category,
                    difficulty
                }
            }
        });
    } catch (error) {
        console.error('Activity recommendation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity recommendations',
            error: error.message
        });
    }
};

// Create a new activity (admin/teacher only)
const createActivity = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            difficulty,
            estimatedTime,
            tags,
            resources,
            targetAudience
        } = req.body;

        const activity = await Activity.create({
            title,
            description,
            category,
            difficulty,
            estimatedTime,
            tags,
            resources,
            targetAudience
        });

        res.status(201).json({
            success: true,
            message: 'Activity created successfully',
            data: activity
        });
    } catch (error) {
        console.error('Activity creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create activity',
            error: error.message
        });
    }
};

// Get all activities with filtering
const getAllActivities = async (req, res) => {
    try {
        const { category, difficulty, search, page = 1, limit = 20 } = req.query;

        let query = { isActive: true };

        // Add filters
        if (category) {
            query.category = category;
        }

        if (difficulty) {
            query.difficulty = difficulty;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const activities = await Activity.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Activity.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                activities,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activities',
            error: error.message
        });
    }
};

module.exports = {
    getRecommendedActivities,
    createActivity,
    getAllActivities
};
