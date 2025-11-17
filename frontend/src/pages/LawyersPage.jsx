import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Card, CardContent, CardMedia, Typography,
    Button, Box, Chip, TextField, MenuItem, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress, Alert
} from '@mui/material';
import { Email, Phone, LocationOn, School, AttachMoney } from '@mui/icons-material';
import { lawyerAPI, specialtyAPI, caseRequestAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function LawyersPage() {
    const { user, isCitizen } = useAuth();
    const [lawyers, setLawyers] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        city: '',
        specialty: ''
    });

    // Case request dialog state
    const [requestDialog, setRequestDialog] = useState(false);
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [requesting, setRequesting] = useState(false);
    const [requestForm, setRequestForm] = useState({
        case_title: '',
        case_type: '',
        description: '',
        urgency: 'medium'
    });
    const [requestError, setRequestError] = useState('');
    const [requestSuccess, setRequestSuccess] = useState('');

    useEffect(() => {
        fetchLawyers();
        fetchSpecialties();
    }, [filters]);

    const fetchLawyers = async () => {
        try {
            setLoading(true);
            const response = await lawyerAPI.getAll(filters);
            setLawyers(response.data);
        } catch (error) {
            console.error('Error fetching lawyers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSpecialties = async () => {
        try {
            const response = await specialtyAPI.getAll();
            setSpecialties(response.data);
        } catch (error) {
            console.error('Error fetching specialties:', error);
        }
    };

    const handleOpenRequestDialog = (lawyer) => {
        setSelectedLawyer(lawyer);
        setRequestDialog(true);
        setRequestError('');
        setRequestSuccess('');
    };

    const handleCloseRequestDialog = () => {
        setRequestDialog(false);
        setSelectedLawyer(null);
        setRequestForm({
            case_title: '',
            case_type: '',
            description: '',
            urgency: 'medium'
        });
        setRequestError('');
        setRequestSuccess('');
    };

    const handleSubmitRequest = async () => {
        if (!requestForm.case_title || !requestForm.case_type || !requestForm.description) {
            setRequestError('Please fill in all required fields');
            return;
        }

        setRequesting(true);
        setRequestError('');

        try {
            await caseRequestAPI.create({
                ...requestForm,
                lawyer: selectedLawyer.id
            });

            setRequestSuccess('Case request sent successfully!');
            setTimeout(() => {
                handleCloseRequestDialog();
            }, 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to send request. Please try again.';
            setRequestError(errorMsg);
        } finally {
            setRequesting(false);
        }
    };

    const caseTypes = [
        'Criminal Law',
        'Civil Law',
        'Family Law',
        'Corporate Law',
        'Property Law',
        'Labor Law',
        'Tax Law',
        'Immigration Law',
        'Other'
    ];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                Find a Lawyer
            </Typography>

            {/* Filters */}
            <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                <TextField
                    label="Filter by City"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    sx={{ minWidth: 200 }}
                />
                <TextField
                    select
                    label="Filter by Specialty"
                    value={filters.specialty}
                    onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">All Specialties</MenuItem>
                    {specialties.map((specialty) => (
                        <MenuItem key={specialty.id} value={specialty.id}>
                            {specialty.name}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            {/* Lawyers Grid */}
            <Grid container spacing={3}>
                {lawyers.length === 0 ? (
                    <Grid item xs={12}>
                        <Card sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary">
                                No lawyers found matching your criteria
                            </Typography>
                        </Card>
                    </Grid>
                ) : (
                    lawyers.map((lawyer) => (
                        <Grid item xs={12} md={6} key={lawyer.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', p: 2 }}>
                                    <CardMedia
                                        component="img"
                                        sx={{ width: 120, height: 120, borderRadius: 2, objectFit: 'cover' }}
                                        image={lawyer.profile_picture_url || '/default-avatar.png'}
                                        alt={lawyer.user.first_name}
                                    />
                                    <CardContent sx={{ flex: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            {lawyer.user.first_name} {lawyer.user.last_name}
                                        </Typography>

                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                            {lawyer.specialties.map((specialty) => (
                                                <Chip
                                                    key={specialty.id}
                                                    label={specialty.name}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LocationOn fontSize="small" color="action" />
                                                <Typography variant="body2">{lawyer.city}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <School fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    {lawyer.experience_years} years experience
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AttachMoney fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    Rs. {lawyer.consultation_fee} consultation fee
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Box>

                                <Box sx={{ p: 2, pt: 0 }}>
                                    {lawyer.bio && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {lawyer.bio}
                                        </Typography>
                                    )}

                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Email />}
                                            href={`mailto:${lawyer.user.email}`}
                                            size="small"
                                        >
                                            Email
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Phone />}
                                            href={`tel:${lawyer.user.phone_number}`}
                                            size="small"
                                        >
                                            Call
                                        </Button>
                                        {isCitizen && (
                                            <Button
                                                variant="contained"
                                                onClick={() => handleOpenRequestDialog(lawyer)}
                                                size="small"
                                                sx={{ ml: 'auto' }}
                                            >
                                                Request Case
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Case Request Dialog */}
            <Dialog open={requestDialog} onClose={handleCloseRequestDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Request Case from {selectedLawyer?.user.first_name} {selectedLawyer?.user.last_name}
                </DialogTitle>
                <DialogContent>
                    {requestError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {requestError}
                        </Alert>
                    )}
                    {requestSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {requestSuccess}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="Case Title"
                        value={requestForm.case_title}
                        onChange={(e) => setRequestForm({ ...requestForm, case_title: e.target.value })}
                        margin="normal"
                        required
                    />

                    <TextField
                        fullWidth
                        select
                        label="Case Type"
                        value={requestForm.case_type}
                        onChange={(e) => setRequestForm({ ...requestForm, case_type: e.target.value })}
                        margin="normal"
                        required
                    >
                        {caseTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        select
                        label="Urgency"
                        value={requestForm.urgency}
                        onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                        margin="normal"
                    >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        label="Case Description"
                        value={requestForm.description}
                        onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                        margin="normal"
                        multiline
                        rows={4}
                        required
                        placeholder="Describe your case in detail..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRequestDialog} disabled={requesting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitRequest}
                        variant="contained"
                        disabled={requesting}
                    >
                        {requesting ? <CircularProgress size={24} /> : 'Send Request'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default LawyersPage;