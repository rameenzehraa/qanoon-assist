import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Typography, Grid, Card, CardContent,
    CardActions, Button, TextField, MenuItem, Box,
    Chip, CircularProgress, Avatar, Paper
} from '@mui/material';
import { LocationOn, Work, VerifiedUser } from '@mui/icons-material';
import { lawyerAPI, specialtyAPI } from '../services/api';

function LawyersPage() {
    const [lawyers, setLawyers] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        city: '',
        specialty: ''
    });

    const fetchLawyers = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.city) params.city = filters.city;
            if (filters.specialty) params.specialty = filters.specialty;
            
            const response = await lawyerAPI.getAll(params);
            setLawyers(response.data);
        } catch (error) {
            console.error('Failed to fetch lawyers:', error);
        }
        setLoading(false);
    }, [filters]);

    useEffect(() => {
        fetchSpecialties();
    }, []);

    useEffect(() => {
        fetchLawyers();
    }, [fetchLawyers]);

    const fetchSpecialties = async () => {
        try {
            const response = await specialtyAPI.getAll();
            setSpecialties(response.data);
        } catch (error) {
            console.error('Failed to fetch specialties:', error);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleSearch = () => {
        fetchLawyers();
    };

    const handleClearFilters = () => {
        setFilters({
            city: '',
            specialty: ''
        });
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    textAlign: 'center',
                    mb: 3
                }}
            >
                Find Your Legal Expert
            </Typography>

            {/* Filters Section */}
            <Paper 
                elevation={2} 
                sx={{ 
                    p: 3, 
                    mb: 4,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}
            >
                <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 2 }}>
                    Search Lawyers
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        label="City"
                        name="city"
                        value={filters.city}
                        onChange={handleFilterChange}
                        sx={{ 
                            minWidth: 200,
                            background: 'white',
                            borderRadius: 1
                        }}
                        placeholder="e.g. Karachi, Lahore"
                        size="small"
                    />
                    <TextField
                        select
                        label="Specialty"
                        name="specialty"
                        value={filters.specialty}
                        onChange={handleFilterChange}
                        sx={{ 
                            minWidth: 200,
                            background: 'white',
                            borderRadius: 1
                        }}
                        size="small"
                    >
                        <MenuItem value="">All Specialties</MenuItem>
                        {specialties.map((specialty) => (
                            <MenuItem key={specialty.id} value={specialty.id}>
                                {specialty.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button 
                        variant="contained" 
                        onClick={handleSearch}
                        sx={{ 
                            background: 'white',
                            color: '#667eea',
                            fontWeight: 'bold',
                            '&:hover': {
                                background: '#f8f9fa'
                            }
                        }}
                    >
                        Search Lawyers
                    </Button>
                    <Button 
                        variant="outlined" 
                        onClick={handleClearFilters}
                        sx={{ 
                            borderColor: 'white',
                            color: 'white',
                            '&:hover': {
                                borderColor: 'white',
                                background: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        Clear
                    </Button>
                </Box>
            </Paper>

            {/* Lawyers List */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {lawyers.length === 0 ? (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No lawyers found
                                </Typography>
                                <Typography color="text.secondary">
                                    Try adjusting your search filters or check back later.
                                </Typography>
                            </Paper>
                        </Grid>
                    ) : (
                        lawyers.map((lawyer) => (
                            <Grid item xs={12} md={6} key={lawyer.id}>
                                <Card 
                                    sx={{ 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 3
                                        }
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                        {/* Lawyer Info - Text First */}
                                        <Box sx={{ mb: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        color: '#2c3e50'
                                                    }}
                                                >
                                                    {lawyer.user.first_name} {lawyer.user.last_name}
                                                </Typography>
                                                {lawyer.is_verified && (
                                                    <VerifiedUser 
                                                        fontSize="small" 
                                                        color="primary" 
                                                        titleAccess="Verified Lawyer"
                                                    />
                                                )}
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <LocationOn fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                    {lawyer.city}
                                                </Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                <Work fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                    {lawyer.experience_years} years experience
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Bio */}
                                        <Typography 
                                            variant="body2" 
                                            paragraph
                                            sx={{ 
                                                color: 'text.secondary',
                                                lineHeight: 1.6,
                                                mb: 2
                                            }}
                                        >
                                            {lawyer.bio || 'Professional legal expert dedicated to providing quality legal services and consultation.'}
                                        </Typography>
                                        
                                        {/* Details */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                <strong>Consultation Fee:</strong> PKR {lawyer.consultation_fee}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Bar Council:</strong> {lawyer.bar_council_number}
                                            </Typography>
                                        </Box>
                                        
                                        {/* Specialties */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                                SPECIALTIES:
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {lawyer.specialties && lawyer.specialties.length > 0 ? (
                                                    lawyer.specialties.map((specialty) => (
                                                        <Chip 
                                                            key={specialty.id} 
                                                            label={specialty.name} 
                                                            size="small"
                                                            variant="outlined"
                                                            color="primary"
                                                        />
                                                    ))
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        No specialties listed
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Avatar - Placed Last */}
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                            <Avatar
                                                sx={{ 
                                                    width: 80, 
                                                    height: 80,
                                                    bgcolor: 'primary.main',
                                                    fontSize: '1.25rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {getInitials(lawyer.user.first_name, lawyer.user.last_name)}
                                            </Avatar>
                                        </Box>
                                    </CardContent>
                                    
                                    <CardActions sx={{ p: 3, pt: 0 }}>
                                        <Button 
                                            size="small" 
                                            color="primary"
                                            variant="outlined"
                                        >
                                            View Profile
                                        </Button>
                                        <Button 
                                            size="small" 
                                            variant="contained"
                                            sx={{ ml: 'auto' }}
                                        >
                                            Request Consultation
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}
        </Container>
    );
}

export default LawyersPage;