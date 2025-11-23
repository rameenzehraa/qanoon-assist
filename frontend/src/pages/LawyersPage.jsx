import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Card, CardContent, CardMedia, Typography,
    Button, Box, Chip, TextField, MenuItem, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress, Alert, Paper
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

    const caseTypes = [
        'Criminal Law', 'Civil Law', 'Family Law', 'Corporate Law',
        'Property Law', 'Labor Law', 'Tax Law', 'Immigration Law', 'Other'
    ];

    const openRequestDialog = (lawyer) => {
        setSelectedLawyer(lawyer);
        setRequestDialog(true);
        setRequestError('');
        setRequestSuccess('');
    };

    const closeRequestDialog = () => {
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
            setTimeout(() => closeRequestDialog(), 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to send request.';
            setRequestError(errorMsg);
        } finally {
            setRequesting(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#0c0c0c'
                }}
            >
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: '#000',
                backgroundImage: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
                color: 'white',
                py: 6
            }}
        >
            <Container maxWidth="lg">
                {/* Title */}
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 800,
                        mb: 4,
                        textAlign: 'center',
                        color: 'white'
                    }}
                >
                    Find a Lawyer
                </Typography>

                {/* Filters */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        mb: 5,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: 3,
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            label="City"
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            InputLabelProps={{ style: { color: '#ccc' } }}
                            sx={{
                                minWidth: 200,
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': { borderColor: '#666' },
                                    '&:hover fieldset': { borderColor: 'white' }
                                }
                            }}
                        />

                        <TextField
                            select
                            label="Specialty"
                            value={filters.specialty}
                            onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                            InputLabelProps={{ style: { color: '#ccc' } }}
                            sx={{
                                minWidth: 200,
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': { borderColor: '#666' },
                                    '&:hover fieldset': { borderColor: 'white' }
                                }
                            }}
                        >
                            <MenuItem value="">All</MenuItem>
                            {specialties.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </Paper>

                {/* Lawyers List */}
                <Grid container spacing={4}>
                    {lawyers.length === 0 ? (
                        <Grid item xs={12}>
                            <Typography align="center" sx={{ opacity: 0.7 }}>
                                No lawyers found.
                            </Typography>
                        </Grid>
                    ) : (
                        lawyers.map((lawyer) => (
                            <Grid item xs={12} md={6} key={lawyer.id}>
                                <Card
                                    sx={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: 4,
                                        backdropFilter: 'blur(4px)',
                                        transition: '0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: '0 10px 30px rgba(255,255,255,0.2)'
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', p: 2 }}>
                                        {/* Circular Image */}
                                        <Box
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                borderRadius: '50%',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '3px solid white',
                                                marginRight: 2
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                                image={lawyer.profile_picture_url || '/default-avatar.png'}
                                            />
                                        </Box>

                                        <CardContent sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                                                {lawyer.user.first_name} {lawyer.user.last_name}
                                            </Typography>

                                            {/* Chips */}
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, my: 1 }}>
                                                {lawyer.specialties.map((sp) => (
                                                    <Chip
                                                        key={sp.id}
                                                        label={sp.name}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'rgba(255,255,255,0.1)',
                                                            color: 'white',
                                                            border: '1px solid rgba(255,255,255,0.3)'
                                                        }}
                                                    />
                                                ))}
                                            </Box>

                                            {/* Info */}
                                            <Box sx={{ color: 'white', opacity: 0.9 }}>
                                                <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                                                    <LocationOn sx={{ fontSize: 18, color: 'white' }} />
                                                    <Typography sx={{ color: 'white' }}>{lawyer.city}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                                                    <School sx={{ fontSize: 18, color: 'white' }} />
                                                    <Typography sx={{ color: 'white' }}>
                                                        {lawyer.experience_years} years experience
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <AttachMoney sx={{ fontSize: 18, color: 'white' }} />
                                                    <Typography sx={{ color: 'white' }}>
                                                        Rs. {lawyer.consultation_fee}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Box>

                                    <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Email />}
                                            href={`mailto:${lawyer.user.email}`}
                                            sx={{ borderColor: 'white', color: 'white' }}
                                        >
                                            Email
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Phone />}
                                            href={`tel:${lawyer.user.phone_number}`}
                                            sx={{ borderColor: 'white', color: 'white' }}
                                        >
                                            Call
                                        </Button>

                                        {isCitizen && (
                                            <Button
                                                variant="contained"
                                                onClick={() => openRequestDialog(lawyer)}
                                                sx={{
                                                    ml: 'auto',
                                                    background: 'white',
                                                    color: '#000',
                                                    fontWeight: 700
                                                }}
                                            >
                                                Request Case
                                            </Button>
                                        )}
                                    </Box>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>

                {/* REQUEST DIALOG */}
                <Dialog
                    open={requestDialog}
                    onClose={closeRequestDialog}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            background: '#111',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: 'white'
                        }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 800, color: 'white' }}>
                        Request Case – {selectedLawyer?.user.first_name}
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
                            sx={{ input: { color: 'white' } }}
                            InputLabelProps={{ style: { color: '#ccc' } }}
                        />

                        <TextField
                            fullWidth
                            select
                            label="Case Type"
                            value={requestForm.case_type}
                            onChange={(e) => setRequestForm({ ...requestForm, case_type: e.target.value })}
                            margin="normal"
                            sx={{ color: 'white', '& .MuiSvgIcon-root': { color: 'white' } }}
                            InputLabelProps={{ style: { color: '#ccc' } }}
                        >
                            {caseTypes.map((type) => (
                                <MenuItem value={type} key={type}>{type}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            select
                            label="Urgency"
                            value={requestForm.urgency}
                            onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                            margin="normal"
                            sx={{ color: 'white', '& .MuiSvgIcon-root': { color: 'white' } }}
                            InputLabelProps={{ style: { color: '#ccc' } }}
                        >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="urgent">Urgent</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={4}
                            value={requestForm.description}
                            onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                            margin="normal"
                            sx={{ textarea: { color: 'white' } }}
                            InputLabelProps={{ style: { color: '#ccc' } }}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={closeRequestDialog} sx={{ color: '#aaa' }}>
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleSubmitRequest}
                            disabled={requesting}
                            sx={{
                                background: 'white',
                                color: '#000',
                                fontWeight: 700
                            }}
                        >
                            {requesting ? <CircularProgress size={24} /> : 'Send Request'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}

export default LawyersPage;
