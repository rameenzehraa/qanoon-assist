import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Grid, Card, CardContent,
    Box, Chip, Button, CircularProgress, Paper,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Alert, Tabs, Tab
} from '@mui/material';
import { 
    PendingActions, CheckCircle, Cancel, 
    HourglassEmpty, Assignment, Email, Phone,
    Dashboard, Message, Work, TaskAlt
} from '@mui/icons-material';
import { caseRequestAPI } from '../../../services/api';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

function LawyerDashboard() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [actionDialog, setActionDialog] = useState({ open: false, request: null, action: null });
    const [responseMessage, setResponseMessage] = useState('');
    const [processing, setProcessing] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
    const [tabValue, setTabValue] = useState(0);

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
            showAlert('Failed to load case requests', 'error');
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
        total: requests.length
    };

    const filteredRequests = filter === 'all' 
        ? requests 
        : requests.filter(r => r.status === filter);

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
                {/* Header */}
                <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Dashboard sx={{ fontSize: 40, color: 'white' }} />
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
                        Lawyer Dashboard
                    </Typography>
                </Box>

                {alert.show && (
                    <Alert 
                        severity={alert.severity} 
                        sx={{ 
                            mb: 4,
                            background: alert.severity === 'error' 
                                ? 'rgba(244, 67, 54, 0.1)' 
                                : alert.severity === 'warning'
                                ? 'rgba(255, 193, 7, 0.1)'
                                : 'rgba(76, 175, 80, 0.1)',
                            border: alert.severity === 'error'
                                ? '1px solid rgba(244, 67, 54, 0.3)'
                                : alert.severity === 'warning'
                                ? '1px solid rgba(255, 193, 7, 0.3)'
                                : '1px solid rgba(76, 175, 80, 0.3)',
                            color: alert.severity === 'error' ? '#ff7675' : 
                                  alert.severity === 'warning' ? '#ffc107' : '#81c784',
                            borderRadius: 2
                        }} 
                        onClose={() => setAlert({ show: false, message: '', severity: 'success' })}
                    >
                        {alert.message}
                    </Alert>
                )}

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 3,
                            backdropFilter: 'blur(4px)',
                            height: '100%',
                            transition: '0.3s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 10px 30px rgba(255,255,255,0.2)'
                            }
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <HourglassEmpty sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {stats.pending}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                            Pending Requests
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 3,
                            backdropFilter: 'blur(4px)',
                            height: '100%',
                            transition: '0.3s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 10px 30px rgba(255,255,255,0.2)'
                            }
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <CheckCircle sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {stats.accepted}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                            Accepted Cases
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 3,
                            backdropFilter: 'blur(4px)',
                            height: '100%',
                            transition: '0.3s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 10px 30px rgba(255,255,255,0.2)'
                            }
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <PendingActions sx={{ fontSize: 40, color: '#2196f3', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {stats.inProgress}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                            In Progress
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 3,
                            backdropFilter: 'blur(4px)',
                            height: '100%',
                            transition: '0.3s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 10px 30px rgba(255,255,255,0.2)'
                            }
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Assignment sx={{ fontSize: 40, color: '#9c27b0', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {stats.completed}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                            Completed
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tabs for Filter */}
                <Paper sx={{ 
                    mb: 4,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: 3
                }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={(e, newValue) => {
                            setTabValue(newValue);
                            const filters = ['pending', 'accepted', 'in_progress', 'completed', 'all'];
                            setFilter(filters[newValue]);
                        }} 
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': {
                                color: 'rgba(255,255,255,0.6)',
                                '&.Mui-selected': {
                                    color: 'white'
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'white'
                            }
                        }}
                    >
                        <Tab label={`Pending (${stats.pending})`} />
                        <Tab label={`Accepted (${stats.accepted})`} />
                        <Tab label={`In Progress (${stats.inProgress})`} />
                        <Tab label={`Completed (${stats.completed})`} />
                        <Tab label={`All Cases (${stats.total})`} />
                    </Tabs>
                </Paper>

                {/* Requests List */}
                {filteredRequests.length === 0 ? (
                    <Paper sx={{ 
                        p: 6, 
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: 3
                    }}>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                            No case requests found
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            {filter === 'all' ? 'You have no case requests yet.' : `No ${filter.replace('_', ' ')} cases found.`}
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {filteredRequests.map((request) => (
                            <Grid item xs={12} key={request.id}>
                                <Card sx={{ 
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(4px)',
                                    borderRadius: 3,
                                    transition: '0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(255,255,255,0.1)'
                                    }
                                }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                                                    {request.case_title}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                                    <Chip 
                                                        label={request.status.replace('_', ' ').toUpperCase()} 
                                                        color={getStatusColor(request.status)}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: getStatusColor(request.status) === 'warning' ? 'rgba(255, 193, 7, 0.2)' :
                                                                    getStatusColor(request.status) === 'success' ? 'rgba(76, 175, 80, 0.2)' :
                                                                    getStatusColor(request.status) === 'info' ? 'rgba(33, 150, 243, 0.2)' :
                                                                    getStatusColor(request.status) === 'error' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(255,255,255,0.1)',
                                                            color: 'white',
                                                            border: '1px solid rgba(255,255,255,0.2)'
                                                        }}
                                                    />
                                                    <Chip 
                                                        label={request.urgency.toUpperCase()} 
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            borderColor: request.urgency === 'urgent' ? '#f44336' : 'rgba(255,255,255,0.3)',
                                                            color: request.urgency === 'urgent' ? '#ff7675' : 'rgba(255,255,255,0.8)'
                                                        }}
                                                    />
                                                    <Chip 
                                                        label={request.case_type} 
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            borderColor: 'rgba(255,255,255,0.3)',
                                                            color: 'rgba(255,255,255,0.8)'
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3, lineHeight: 1.6 }}>
                                            {request.description}
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Email fontSize="small" sx={{ color: 'rgba(255,255,255,0.6)' }} />
                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                    {request.requester_details?.user?.email}
                                                </Typography>
                                            </Box>
                                            {request.requester_details?.user?.phone_number && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Phone fontSize="small" sx={{ color: 'rgba(255,255,255,0.6)' }} />
                                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                        {request.requester_details.user.phone_number}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {request.status === 'pending' && (
                                                <>
                                                    <Button 
                                                        onClick={() => handleOpenDialog(request, 'accept')}
                                                        variant="contained"
                                                        startIcon={<CheckCircle />}
                                                        size="small"
                                                        sx={{
                                                            background: 'rgba(76, 175, 80, 0.8)',
                                                            color: 'white',
                                                            '&:hover': { background: '#4caf50' }
                                                        }}
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button 
                                                        variant="outlined"
                                                        startIcon={<Cancel />}
                                                        size="small"
                                                        onClick={() => handleOpenDialog(request, 'reject')}
                                                        sx={{
                                                            borderColor: 'rgba(244, 67, 54, 0.5)',
                                                            color: '#ff7675',
                                                            '&:hover': {
                                                                borderColor: '#f44336',
                                                                background: 'rgba(244, 67, 54, 0.1)'
                                                            }
                                                        }}
                                                    >
                                                        Decline
                                                    </Button>
                                                </>
                                            )}
                                            {request.status === 'accepted' && (
                                                <>
                                                    <Button 
                                                        variant="contained"
                                                        startIcon={<Work />}
                                                        size="small"
                                                        onClick={() => handleOpenDialog(request, 'start_progress')}
                                                        sx={{
                                                            background: 'rgba(33, 150, 243, 0.8)',
                                                            color: 'white',
                                                            '&:hover': { background: '#2196f3' }
                                                        }}
                                                    >
                                                        Start Working
                                                    </Button>
                                                    <Button 
                                                        variant="outlined"
                                                        startIcon={<Message />}
                                                        size="small"
                                                        onClick={() => window.location.href = `/messages/${request.id}`}
                                                        sx={{ 
                                                            position: 'relative',
                                                            borderColor: 'rgba(255,255,255,0.3)',
                                                            color: 'rgba(255,255,255,0.8)',
                                                            '&:hover': {
                                                                borderColor: 'white',
                                                                color: 'white'
                                                            }
                                                        }}
                                                    >
                                                        Message
                                                        {request.unread_messages_count > 0 && (
                                                            <Box
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: -8,
                                                                    right: -8,
                                                                    backgroundColor: '#f44336',
                                                                    color: 'white',
                                                                    borderRadius: '50%',
                                                                    width: 20,
                                                                    height: 20,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 'bold',
                                                                    border: '2px solid #000'
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
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => window.location.href = `/case-details/${request.id}`}
                                                        sx={{
                                                            background: 'rgba(33, 150, 243, 0.8)',
                                                            '&:hover': { background: '#2196f3' }
                                                        }}
                                                    >
                                                        View Details
                                                    </Button>
                                                    <Button 
                                                        variant="contained"
                                                        startIcon={<TaskAlt />}
                                                        size="small"
                                                        onClick={() => handleOpenDialog(request, 'complete')}
                                                        sx={{
                                                            background: 'rgba(76, 175, 80, 0.8)',
                                                            color: 'white',
                                                            '&:hover': { background: '#4caf50' }
                                                        }}
                                                    >
                                                        Mark Complete
                                                    </Button>
                                                    <Button 
                                                        variant="outlined"
                                                        startIcon={<Message />}
                                                        size="small"
                                                        onClick={() => window.location.href = `/messages/${request.id}`}
                                                        sx={{ 
                                                            position: 'relative',
                                                            borderColor: 'rgba(255,255,255,0.3)',
                                                            color: 'rgba(255,255,255,0.8)',
                                                            '&:hover': {
                                                                borderColor: 'white',
                                                                color: 'white'
                                                            }
                                                        }}
                                                    >
                                                        Message
                                                        {request.unread_messages_count > 0 && (
                                                            <Box
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: -8,
                                                                    right: -8,
                                                                    backgroundColor: '#f44336',
                                                                    color: 'white',
                                                                    borderRadius: '50%',
                                                                    width: 20,
                                                                    height: 20,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 'bold',
                                                                    border: '2px solid #000'
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
                <Dialog 
                    open={actionDialog.open} 
                    onClose={handleCloseDialog}
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
                        )}
                        {actionDialog.action === 'start_progress' && (
                            <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                Are you sure you want to start working on this case?
                            </Typography>
                        )}
                        {actionDialog.action === 'complete' && (
                            <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                Are you sure you want to mark this case as completed?
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={handleCloseDialog} 
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
                            onClick={handleAction} 
                            variant="contained"
                            disabled={processing}
                            sx={{
                                background: actionDialog.action === 'reject' 
                                    ? 'rgba(244, 67, 54, 0.8)' 
                                    : 'rgba(33, 150, 243, 0.8)',
                                color: 'white',
                                '&:hover': { 
                                    background: actionDialog.action === 'reject' ? '#f44336' : '#2196f3',
                                    boxShadow: '0 0 20px rgba(255,255,255,0.2)'
                                },
                                '&:disabled': {
                                    background: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            {processing ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Confirm'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}

export default LawyerDashboard;