const express = require('express');
const {
    getRecommendedActivities,
    createActivity,
    getAllActivities
} = require('../controllers/activityController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get personalized recommendations (students)
router.get('/recommendations', restrictTo('student'), getRecommendedActivities);

// Get all activities
router.get('/', getAllActivities);

// Create activity (teachers and admins only)
router.post('/', restrictTo('teacher', 'admin'), createActivity);

module.exports = router;
