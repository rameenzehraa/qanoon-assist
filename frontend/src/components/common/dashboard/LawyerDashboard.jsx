import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Grid, Card, CardContent,
    Box, Chip, Button, CircularProgress, Paper,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Alert
} from '@mui/material';
import { 
    PendingActions, CheckCircle, Cancel, 
    HourglassEmpty, Assignment, Email, Phone 
} from '@mui/icons-material';
import { caseRequestAPI } from '../../../services/api';

function LawyerDashboard() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [actionDialog, setActionDialog] = useState({ open: false, request: null, action: null });
    const [responseMessage, setResponseMessage] = useState('');
    const [processing, setProcessing] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await caseRequestAPI.getAll();
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (request, action) => {
        setActionDialog({ open: true, request, action });
        setResponseMessage('');
    };

    const handleCloseDialog = () => {
        setActionDialog({ open: false, request: null, action: null });
        setResponseMessage('');
    };

    const handleAction = async () => {
        const { request, action } = actionDialog;
        setProcessing(true);

        try {
            if (action === 'accept') {
                await caseRequestAPI.accept(request.id, responseMessage || 'Request accepted');
                showAlert('Case request accepted successfully', 'success');
            } else if (action === 'reject') {
                await caseRequestAPI.reject(request.id, responseMessage || 'Request rejected');
                showAlert('Case request rejected', 'info');
            } else if (action === 'start_progress') {
                await caseRequestAPI.startProgress(request.id);
                showAlert('Case marked as in progress', 'success');
            } else if (action === 'complete') {
                await caseRequestAPI.complete(request.id);
                showAlert('Case marked as completed', 'success');
            }

            fetchRequests();
            handleCloseDialog();
        } catch (error) {
            showAlert('Failed to update case request', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const showAlert = (message, severity) => {
        setAlert({ show: true, message, severity });
        setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'accepted': return 'success';
            case 'rejected': return 'error';
            case 'in_progress': return 'info';
            case 'completed': return 'default';
            default: return 'default';
        }
    };

    const stats = {
        pending: requests.filter(r => r.status === 'pending').length,
        accepted: requests.filter(r => r.status === 'accepted').length,
        inProgress: requests.filter(r => r.status === 'in_progress').length,
        completed: requests.filter(r => r.status === 'completed').length,
    };

    const filteredRequests = filter === 'all' 
        ? requests 
        : requests.filter(r => r.status === filter);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {alert.show && (
                <Alert severity={alert.severity} sx={{ mb: 2 }}>
                    {alert.message}
                </Alert>
            )}

            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                Lawyer Dashboard
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#fff8e1' }}>
                        <CardContent>
                            <HourglassEmpty sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                            <Typography color="text.secondary" gutterBottom>
                                Pending
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                                {stats.pending}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#e8f5e9' }}>
                        <CardContent>
                            <CheckCircle sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                            <Typography color="text.secondary" gutterBottom>
                                Accepted
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                {stats.accepted}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#e3f2fd' }}>
                        <CardContent>
                            <PendingActions sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
                            <Typography color="text.secondary" gutterBottom>
                                In Progress
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                                {stats.inProgress}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#f3e5f5' }}>
                        <CardContent>
                            <Assignment sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
                            <Typography color="text.secondary" gutterBottom>
                                Completed
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                                {stats.completed}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter Buttons */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['pending', 'accepted', 'in_progress', 'completed', 'rejected', 'all'].map((status) => (
                    <Button
                        key={status}
                        variant={filter === status ? 'contained' : 'outlined'}
                        onClick={() => setFilter(status)}
                        size="small"
                    >
                        {status.replace('_', ' ').toUpperCase()}
                    </Button>
                ))}
            </Box>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        No case requests found
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredRequests.map((request) => (
                        <Grid item xs={12} key={request.id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                {request.case_title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                <Chip 
                                                    label={request.status.replace('_', ' ').toUpperCase()} 
                                                    color={getStatusColor(request.status)}
                                                    size="small"
                                                />
                                                <Chip 
                                                    label={request.urgency.toUpperCase()} 
                                                    size="small"
                                                    variant="outlined"
                                                    color={request.urgency === 'urgent' ? 'error' : 'default'}
                                                />
                                                <Chip 
                                                    label={request.case_type} 
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {request.description}
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Email fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                {request.requester_details?.user?.email}
                                            </Typography>
                                        </Box>
                                        {request.requester_details?.user?.phone_number && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Phone fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    {request.requester_details.user.phone_number}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {request.status === 'pending' && (
                                            <>
                                                <Button 
                                                    onClick={() => handleOpenDialog(request, 'accept')}
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                >
                                                    Accept
                                                </Button>
                                                <Button 
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleOpenDialog(request, 'reject')}
                                                >
                                                    Decline
                                                </Button>
                                            </>
                                        )}
                                        {request.status === 'accepted' && (
                                            <>
                                                <Button 
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleOpenDialog(request, 'start_progress')}
                                                >
                                                    Start Working
                                                </Button>
                                                <Button 
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => window.location.href = `/messages/${request.id}`}
                                                    sx={{ position: 'relative' }}
                                                >
                                                    💬 Message
                                                    {request.unread_messages_count > 0 && (
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -8,
                                                                right: -8,
                                                                backgroundColor: 'error.main',
                                                                color: 'white',
                                                                borderRadius: '50%',
                                                                width: 20,
                                                                height: 20,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold',
                                                                border: '2px solid white'
                                                            }}
                                                        >
                                                            {request.unread_messages_count}
                                                        </Box>
                                                    )}
                                                </Button>
                                            </>
                                        )}

                                        {request.status === 'in_progress' && (
                                            <>
                                                <Button 
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleOpenDialog(request, 'complete')}
                                                >
                                                    Mark Complete
                                                </Button>
                                                <Button 
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => window.location.href = `/messages/${request.id}`}
                                                    sx={{ position: 'relative' }}
                                                >
                                                    💬 Message
                                                    {request.unread_messages_count > 0 && (
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -8,
                                                                right: -8,
                                                                backgroundColor: 'error.main',
                                                                color: 'white',
                                                                borderRadius: '50%',
                                                                width: 20,
                                                                height: 20,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold',
                                                                border: '2px solid white'
                                                            }}
                                                        >
                                                            {request.unread_messages_count}
                                                        </Box>
                                                    )}
                                                </Button>
                                            </>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Action Dialog */}
            <Dialog open={actionDialog.open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {actionDialog.action === 'accept' && 'Accept Case Request'}
                    {actionDialog.action === 'reject' && 'Reject Case Request'}
                    {actionDialog.action === 'start_progress' && 'Start Working on Case'}
                    {actionDialog.action === 'complete' && 'Mark Case as Complete'}
                </DialogTitle>
                <DialogContent>
                    {(actionDialog.action === 'accept' || actionDialog.action === 'reject') && (
                        <TextField
                            fullWidth
                            label="Message (Optional)"
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                            multiline
                            rows={3}
                            margin="normal"
                            placeholder="Add a message for the client..."
                        />
                    )}
                    {actionDialog.action === 'start_progress' && (
                        <Typography>
                            Are you sure you want to start working on this case?
                        </Typography>
                    )}
                    {actionDialog.action === 'complete' && (
                        <Typography>
                            Are you sure you want to mark this case as completed?
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={processing}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAction} 
                        variant="contained"
                        disabled={processing}
                    >
                        {processing ? <CircularProgress size={24} /> : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default LawyerDashboard;