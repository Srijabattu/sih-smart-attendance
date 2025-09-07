// src/components/activities/ActivityRecommendations.js
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    Grid,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField
} from '@mui/material';
import { Timer, School, TrendingUp, Person } from '@mui/icons-material';
import { activitiesAPI } from '../../services/api';

const ActivityRecommendations = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        duration: '',
        category: '',
        difficulty: ''
    });

    const categories = [
        { value: 'academic', label: 'Academic', icon: <School /> },
        { value: 'skill-development', label: 'Skill Development', icon: <TrendingUp /> },
        { value: 'career-guidance', label: 'Career Guidance', icon: <Person /> },
        { value: 'personal-development', label: 'Personal Development', icon: <Person /> }
    ];

    const difficulties = [
        { value: 'beginner', label: 'Beginner', color: 'success' },
        { value: 'intermediate', label: 'Intermediate', color: 'warning' },
        { value: 'advanced', label: 'Advanced', color: 'error' }
    ];

    useEffect(() => {
        fetchRecommendations();
    }, [filters]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const params = Object.keys(filters).reduce((acc, key) => {
                if (filters[key]) acc[key] = filters[key];
                return acc;
            }, {});

            const response = await activitiesAPI.getRecommendations(params);
            setActivities(response.data.data.activities);
            setError(null);
        } catch (err) {
            console.error('Error fetching recommendations:', err);
            setError('Failed to load activity recommendations');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getDifficultyColor = (difficulty) => {
        const diff = difficulties.find(d => d.value === difficulty);
        return diff ? diff.color : 'default';
    };

    const getCategoryIcon = (category) => {
        const cat = categories.find(c => c.value === category);
        return cat ? cat.icon : <School />;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Recommended Activities for Your Free Time
            </Typography>

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        label="Max Duration (minutes)"
                        type="number"
                        value={filters.duration}
                        onChange={(e) => handleFilterChange('duration', e.target.value)}
                        inputProps={{ min: 5, max: 120 }}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            label="Category"
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map(category => (
                                <MenuItem key={category.value} value={category.value}>
                                    {category.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <InputLabel>Difficulty</InputLabel>
                        <Select
                            value={filters.difficulty}
                            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                            label="Difficulty"
                        >
                            <MenuItem value="">All Levels</MenuItem>
                            {difficulties.map(difficulty => (
                                <MenuItem key={difficulty.value} value={difficulty.value}>
                                    {difficulty.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {/* Activities List */}
            {activities.length === 0 ? (
                <Alert severity="info">
                    No activities found matching your criteria. Try adjusting the filters.
                </Alert>
            ) : (
                <Grid container spacing={2}>
                    {activities.map((activity) => (
                        <Grid item xs={12} md={6} lg={4} key={activity._id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box display="flex" alignItems="center" mb={1}>
                                        {getCategoryIcon(activity.category)}
                                        <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                                            {activity.title}
                                        </Typography>
                                        {activity.recommendationScore > 0 && (
                                            <Chip 
                                                label="Recommended" 
                                                color="primary" 
                                                size="small" 
                                            />
                                        )}
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {activity.description}
                                    </Typography>

                                    <Box display="flex" alignItems="center" mb={1}>
                                        <Timer sx={{ mr: 1, fontSize: 16 }} />
                                        <Typography variant="body2">
                                            {activity.estimatedTime} minutes
                                        </Typography>
                                    </Box>

                                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                        <Chip
                                            label={activity.category.replace('-', ' ')}
                                            size="small"
                                            variant="outlined"
                                        />
                                        <Chip
                                            label={activity.difficulty}
                                            size="small"
                                            color={getDifficultyColor(activity.difficulty)}
                                        />
                                        {activity.tags.slice(0, 2).map((tag, index) => (
                                            <Chip
                                                key={index}
                                                label={tag}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </CardContent>

                                <Box p={2} pt={0}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => {
                                            // Handle activity start/view
                                            console.log('Starting activity:', activity.title);
                                        }}
                                    >
                                        Start Activity
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default ActivityRecommendations;
