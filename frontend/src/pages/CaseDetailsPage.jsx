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
    LocationOn, Description
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
            
            // ADD THIS BLOCK - Mark as viewed if citizen
            if (!isLawyer) {
                try {
                    await caseRequestAPI.markViewed(requestId);
                } catch (error) {
                    console.error('Failed to mark as viewed:', error);
                }
            }
            // END OF NEW BLOCK
            
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
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!caseRequest) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">Case not found</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {alert.show && (
                <Alert severity={alert.severity} sx={{ mb: 2 }}>
                    {alert.message}
                </Alert>
            )}

            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/dashboard')}
                >
                    Back to Dashboard
                </Button>
            </Box>

            {/* Case Information Card */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {caseRequest.case_title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip label={caseRequest.status.toUpperCase()} color="primary" />
                        <Chip label={caseRequest.case_type} variant="outlined" />
                        <Chip label={caseRequest.urgency.toUpperCase()} color={caseRequest.urgency === 'urgent' ? 'error' : 'default'} />
                    </Box>

                    <Typography variant="body1" paragraph>
                        <strong>Client:</strong> {caseRequest.requester_name}
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                        <strong>Description:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {caseRequest.description}
                    </Typography>
                </CardContent>
            </Card>

            {/* Action Buttons - Only show for lawyers with in_progress cases */}
            {caseRequest.status === 'in_progress' && isLawyer && (
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<Event />}
                        onClick={() => setHearingDialog(true)}
                    >
                        Schedule Hearing
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<Update />}
                        onClick={() => setUpdateDialog(true)}
                    >
                        Add Update
                    </Button>
                </Box>
            )}

            {/* Hearings and Updates Grid */}
            <Grid container spacing={3}>
                {/* Hearings Section */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday /> Hearings
                        </Typography>
                        
                        {hearings.length === 0 ? (
                            <Typography color="text.secondary">No hearings scheduled yet</Typography>
                        ) : (
                            <List>
                                {hearings.map((hearing) => (
                                    <ListItem key={hearing.id} sx={{ flexDirection: 'column', alignItems: 'start' }}>
                                        <ListItemText
                                            primary={hearing.title}
                                            secondary={
                                                <>
                                                    <Typography variant="body2">
                                                        Date: {new Date(hearing.hearing_date).toLocaleString()}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Location: {hearing.location}
                                                    </Typography>
                                                    {hearing.notes && (
                                                        <Typography variant="body2">
                                                            Notes: {hearing.notes}
                                                        </Typography>
                                                    )}
                                                </>
                                            }
                                        />
                                        <Divider sx={{ width: '100%', mt: 1 }} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>

                {/* Updates Section */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Description /> Case Updates
                        </Typography>
                        
                        {updates.length === 0 ? (
                            <Typography color="text.secondary">No updates posted yet</Typography>
                        ) : (
                            <List>
                                {updates.map((update) => (
                                    <ListItem key={update.id} sx={{ flexDirection: 'column', alignItems: 'start' }}>
                                        <ListItemText
                                            primary={update.title}
                                            secondary={
                                                <>
                                                    <Typography variant="body2">
                                                        {update.description}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(update.created_at).toLocaleString()}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                        <Divider sx={{ width: '100%', mt: 1 }} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Add Hearing Dialog - We'll implement this in next step */}
            {/* Add Update Dialog - We'll implement this in next step */}
            {/* Add Hearing Dialog */}
            <Dialog open={hearingDialog} onClose={() => setHearingDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Schedule Hearing</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Hearing Title"
                        value={hearingForm.title}
                        onChange={(e) => setHearingForm({ ...hearingForm, title: e.target.value })}
                        margin="normal"
                        required
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
                    />
                    <TextField
                        fullWidth
                        label="Location"
                        value={hearingForm.location}
                        onChange={(e) => setHearingForm({ ...hearingForm, location: e.target.value })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Notes"
                        value={hearingForm.notes}
                        onChange={(e) => setHearingForm({ ...hearingForm, notes: e.target.value })}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <TextField
                        fullWidth
                        label="Next Date (Optional)"
                        type="datetime-local"
                        value={hearingForm.next_date}
                        onChange={(e) => setHearingForm({ ...hearingForm, next_date: e.target.value })}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHearingDialog(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAddHearing}
                        variant="contained"
                        disabled={processing}
                    >
                        {processing ? <CircularProgress size={24} /> : 'Schedule'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Update Dialog */}
            <Dialog open={updateDialog} onClose={() => setUpdateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Case Update</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Update Title"
                        value={updateForm.title}
                        onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                        margin="normal"
                        required
                        placeholder="e.g., Petition Filed"
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUpdateDialog(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAddUpdate}
                        variant="contained"
                        disabled={processing}
                    >
                        {processing ? <CircularProgress size={24} /> : 'Add Update'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default CaseDetailsPage;