import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Grid, Card, CardContent,
    Box, Chip, Button, CircularProgress, Paper,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Alert, Divider, List, ListItem, ListItemText
} from '@mui/material';
import {
    ArrowBack, Event, Update, Add, CalendarToday,
    LocationOn, Description, Dashboard,
    Person, Schedule, Info
} from '@mui/icons-material';
import { caseRequestAPI, hearingAPI, caseUpdateAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function CaseDetailsPage() {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const { isLawyer } = useAuth();
    const [caseRequest, setCaseRequest] = useState(null);
    const [hearings, setHearings] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
    
    // Dialog states
    const [hearingDialog, setHearingDialog] = useState(false);
    const [updateDialog, setUpdateDialog] = useState(false);
    const [processing, setProcessing] = useState(false);
    
    // Form states
    const [hearingForm, setHearingForm] = useState({
        title: '',
        hearing_date: '',
        location: '',
        notes: '',
        next_date: ''
    });
    
    const [updateForm, setUpdateForm] = useState({
        title: '',
        description: ''
    });

    useEffect(() => {
        fetchCaseDetails();
    }, [requestId]);

    const fetchCaseDetails = async () => {
        try {
            setLoading(true);
            const response = await caseRequestAPI.getById(requestId);
            setCaseRequest(response.data);
            
            // If case exists, fetch hearings and updates
            if (response.data.case_id) {
                // Fetch hearings
                const hearingsResponse = await hearingAPI.getAll();
                const caseHearings = hearingsResponse.data.filter(h => h.case === response.data.case_id);
                setHearings(caseHearings);
                
                // Fetch updates
                const updatesResponse = await caseUpdateAPI.getAll();
                const caseUpdates = updatesResponse.data.filter(u => u.case === response.data.case_id);
                setUpdates(caseUpdates);
            }
            
            // Mark as viewed if citizen
            if (!isLawyer) {
                try {
                    await caseRequestAPI.markViewed(requestId);
                } catch (error) {
                    console.error('Failed to mark as viewed:', error);
                }
            }
            
        } catch (error) {
            console.error('Error fetching case details:', error);
            showAlert('Failed to load case details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (message, severity) => {
        setAlert({ show: true, message, severity });
        setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
    };

    const handleAddHearing = async () => {
        if (!hearingForm.title || !hearingForm.hearing_date || !hearingForm.location) {
            showAlert('Please fill in all required fields', 'error');
            return;
        }

        if (!caseRequest.case_id) {
            showAlert('Case not found. Please contact support.', 'error');
            return;
        }

        setProcessing(true);
        try {
            await hearingAPI.create({
                case: caseRequest.case_id,
                title: hearingForm.title,
                hearing_date: hearingForm.hearing_date,
                location: hearingForm.location,
                notes: hearingForm.notes,
                next_date: hearingForm.next_date || null
            });
            
            showAlert('Hearing scheduled successfully!', 'success');
            setHearingDialog(false);
            setHearingForm({ title: '', hearing_date: '', location: '', notes: '', next_date: '' });
            fetchCaseDetails(); // Refresh data
        } catch (error) {
            console.error('Error adding hearing:', error);
            showAlert('Failed to schedule hearing', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleAddUpdate = async () => {
        if (!updateForm.title || !updateForm.description) {
            showAlert('Please fill in all required fields', 'error');
            return;
        }

        if (!caseRequest.case_id) {
            showAlert('Case not found. Please contact support.', 'error');
            return;
        }

        setProcessing(true);
        try {
            await caseUpdateAPI.create({
                case: caseRequest.case_id,
                title: updateForm.title,
                description: updateForm.description
            });
            
            showAlert('Case update added successfully!', 'success');
            setUpdateDialog(false);
            setUpdateForm({ title: '', description: '' });
            fetchCaseDetails(); // Refresh data
        } catch (error) {
            console.error('Error adding update:', error);
            showAlert('Failed to add update', 'error');
        } finally {
            setProcessing(false);
        }
    };
    
    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    backgroundColor: '#000',
                    backgroundImage: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        );
    }

    if (!caseRequest) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    backgroundColor: '#000',
                    backgroundImage: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Container maxWidth="lg">
                    <Alert severity="error" sx={{ 
                        background: 'rgba(244, 67, 54, 0.1)', 
                        border: '1px solid rgba(244, 67, 54, 0.3)', 
                        color: '#ff7675',
                        borderRadius: 2
                    }}>
                        Case not found
                    </Alert>
                </Container>
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
            <Container maxWidth="xl">
                {alert.show && (
                    <Alert 
                        severity={alert.severity} 
                        sx={{ 
                            mb: 4,
                            background: alert.severity === 'error' 
                                ? 'rgba(244, 67, 54, 0.1)' 
                                : 'rgba(76, 175, 80, 0.1)',
                            border: alert.severity === 'error'
                                ? '1px solid rgba(244, 67, 54, 0.3)'
                                : '1px solid rgba(76, 175, 80, 0.3)',
                            color: alert.severity === 'error' ? '#ff7675' : '#81c784',
                            borderRadius: 2
                        }} 
                    >
                        {alert.message}
                    </Alert>
                )}

                {/* Header */}
                <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/dashboard')}
                        sx={{
                            color: 'rgba(255,255,255,0.7)',
                            '&:hover': {
                                color: 'white',
                                background: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        Back to Dashboard
                    </Button>
                </Box>

                {/* Case Information Card */}
                <Card sx={{ 
                    mb: 4,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: 3
                }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
                            {caseRequest.case_title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                            <Chip 
                                label={caseRequest.status.replace('_', ' ').toUpperCase()} 
                                sx={{
                                    bgcolor: 'rgba(33, 150, 243, 0.2)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    fontWeight: 600
                                }}
                            />
                            <Chip 
                                label={caseRequest.case_type} 
                                variant="outlined"
                                sx={{
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    color: 'rgba(255,255,255,0.8)'
                                }}
                            />
                            <Chip 
                                label={caseRequest.urgency.toUpperCase()} 
                                sx={{
                                    bgcolor: caseRequest.urgency === 'urgent' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(255,255,255,0.1)',
                                    color: caseRequest.urgency === 'urgent' ? '#ff7675' : 'rgba(255,255,255,0.8)',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Person sx={{ color: 'rgba(255,255,255,0.6)' }} />
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                <strong style={{ color: 'white' }}>Client:</strong> {caseRequest.requester_name}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                                Case Description:
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                                {caseRequest.description}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Action Buttons - Only show for lawyers with in_progress cases */}
                {caseRequest.status === 'in_progress' && isLawyer && (
                    <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<Event />}
                            onClick={() => setHearingDialog(true)}
                            sx={{
                                background: 'rgba(76, 175, 80, 0.8)',
                                color: 'white',
                                '&:hover': { background: '#4caf50' }
                            }}
                        >
                            Schedule Hearing
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Update />}
                            onClick={() => setUpdateDialog(true)}
                            sx={{
                                background: 'rgba(33, 150, 243, 0.8)',
                                color: 'white',
                                '&:hover': { background: '#2196f3' }
                            }}
                        >
                            Add Update
                        </Button>
                    </Box>
                )}

                {/* Hearings and Updates Grid */}
                <Grid container spacing={3}>
                    {/* Hearings Section */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ 
                            p: 3,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(4px)',
                            borderRadius: 3,
                            height: '100%'
                        }}>
                            <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                                <CalendarToday /> Hearings
                            </Typography>
                            
                            {hearings.length === 0 ? (
                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', py: 2 }}>
                                    No hearings scheduled yet
                                </Typography>
                            ) : (
                                <List>
                                    {hearings.map((hearing, index) => (
                                        <ListItem 
                                            key={hearing.id} 
                                            sx={{ 
                                                flexDirection: 'column', 
                                                alignItems: 'start',
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: 2,
                                                mb: 1,
                                                p: 2
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <Schedule sx={{ fontSize: 20, color: '#64b5f6' }} />
                                                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                                                    {hearing.title}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ pl: 3 }}>
                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5 }}>
                                                    📅 {new Date(hearing.hearing_date).toLocaleString()}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5 }}>
                                                    📍 {hearing.location}
                                                </Typography>
                                                {hearing.notes && (
                                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                                                        📝 {hearing.notes}
                                                    </Typography>
                                                )}
                                            </Box>
                                            {index < hearings.length - 1 && (
                                                <Divider sx={{ width: '100%', mt: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
                                            )}
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Grid>

                    {/* Updates Section */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ 
                            p: 3,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(4px)',
                            borderRadius: 3,
                            height: '100%'
                        }}>
                            <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                                <Description /> Case Updates
                            </Typography>
                            
                            {updates.length === 0 ? (
                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', py: 2 }}>
                                    No updates posted yet
                                </Typography>
                            ) : (
                                <List>
                                    {updates.map((update, index) => (
                                        <ListItem 
                                            key={update.id} 
                                            sx={{ 
                                                flexDirection: 'column', 
                                                alignItems: 'start',
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: 2,
                                                mb: 1,
                                                p: 2
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <Info sx={{ fontSize: 20, color: '#81c784' }} />
                                                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                                                    {update.title}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ pl: 3 }}>
                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1, lineHeight: 1.5 }}>
                                                    {update.description}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                                    🕒 {new Date(update.created_at).toLocaleString()}
                                                </Typography>
                                            </Box>
                                            {index < updates.length - 1 && (
                                                <Divider sx={{ width: '100%', mt: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
                                            )}
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                {/* Add Hearing Dialog */}
                <Dialog 
                    open={hearingDialog} 
                    onClose={() => setHearingDialog(false)} 
                    maxWidth="sm" 
                    fullWidth
                    PaperProps={{
                        sx: {
                            background: 'rgba(255,255,255,0.04)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 3
                        }
                    }}
                >
                    <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>
                        Schedule Hearing
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Hearing Title"
                            value={hearingForm.title}
                            onChange={(e) => setHearingForm({ ...hearingForm, title: e.target.value })}
                            margin="normal"
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255,255,255,0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'white',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255,255,255,0.7)',
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Hearing Date & Time"
                            type="datetime-local"
                            value={hearingForm.hearing_date}
                            onChange={(e) => setHearingForm({ ...hearingForm, hearing_date: e.target.value })}
                            margin="normal"
                            required
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255,255,255,0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'white',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255,255,255,0.7)',
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Location"
                            value={hearingForm.location}
                            onChange={(e) => setHearingForm({ ...hearingForm, location: e.target.value })}
                            margin="normal"
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255,255,255,0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'white',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255,255,255,0.7)',
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Notes"
                            value={hearingForm.notes}
                            onChange={(e) => setHearingForm({ ...hearingForm, notes: e.target.value })}
                            margin="normal"
                            multiline
                            rows={3}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255,255,255,0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'white',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255,255,255,0.7)',
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Next Date (Optional)"
                            type="datetime-local"
                            value={hearingForm.next_date}
                            onChange={(e) => setHearingForm({ ...hearingForm, next_date: e.target.value })}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255,255,255,0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'white',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255,255,255,0.7)',
                                },
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={() => setHearingDialog(false)} 
                            disabled={processing}
                            sx={{
                                color: 'rgba(255,255,255,0.7)',
                                '&:hover': {
                                    color: 'white',
                                    background: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleAddHearing}
                            variant="contained"
                            disabled={processing}
                            sx={{
                                background: 'rgba(76, 175, 80, 0.8)',
                                color: 'white',
                                '&:hover': { 
                                    background: '#4caf50',
                                    boxShadow: '0 0 20px rgba(76, 175, 80, 0.4)'
                                }
                            }}
                        >
                            {processing ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Schedule Hearing'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Add Update Dialog */}
                <Dialog 
                    open={updateDialog} 
                    onClose={() => setUpdateDialog(false)} 
                    maxWidth="sm" 
                    fullWidth
                    PaperProps={{
                        sx: {
                            background: 'rgba(255,255,255,0.04)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 3
                        }
                    }}
                >
                    <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>
                        Add Case Update
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Update Title"
                            value={updateForm.title}
                            onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                            margin="normal"
                            required
                            placeholder="e.g., Petition Filed"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255,255,255,0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'white',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255,255,255,0.7)',
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={updateForm.description}
                            onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                            margin="normal"
                            required
                            multiline
                            rows={4}
                            placeholder="Describe the update in detail..."
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255,255,255,0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'white',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255,255,255,0.7)',
                                },
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={() => setUpdateDialog(false)} 
                            disabled={processing}
                            sx={{
                                color: 'rgba(255,255,255,0.7)',
                                '&:hover': {
                                    color: 'white',
                                    background: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleAddUpdate}
                            variant="contained"
                            disabled={processing}
                            sx={{
                                background: 'rgba(33, 150, 243, 0.8)',
                                color: 'white',
                                '&:hover': { 
                                    background: '#2196f3',
                                    boxShadow: '0 0 20px rgba(33, 150, 243, 0.4)'
                                }
                            }}
                        >
                            {processing ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Add Update'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}

export default CaseDetailsPage;