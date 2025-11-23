import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Grid, Card, CardContent,
    Box, Chip, Button, CircularProgress, Paper,
    Tabs, Tab
} from '@mui/material';
import { 
    PendingActions, CheckCircle, Cancel, 
    HourglassEmpty, Assignment, Dashboard,
    Message, Visibility, Person
} from '@mui/icons-material';
import { caseRequestAPI } from '../../../services/api';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

function CitizenDashboard() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await caseRequestAPI.getAll();
            console.log('🔍 Case Requests Data:', response.data);
            console.log('🔍 First Request:', response.data[0]);
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <HourglassEmpty />;
            case 'accepted': return <CheckCircle />;
            case 'rejected': return <Cancel />;
            case 'in_progress': return <PendingActions />;
            case 'completed': return <Assignment />;
            default: return <Assignment />;
        }
    };

    const stats = {
        total: requests.length,
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
                        My Case Requests
                    </Typography>
                </Box>

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
                                    <Assignment sx={{ fontSize: 40, color: '#64b5f6', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {stats.total}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                            Total Requests
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
                                    <HourglassEmpty sx={{ fontSize: 40, color: '#ffc107', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {stats.pending}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                            Pending
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
                                    <CheckCircle sx={{ fontSize: 40, color: '#81c784', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {stats.accepted}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                            Accepted
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
                                    <PendingActions sx={{ fontSize: 40, color: '#4db8ff', mr: 2 }} />
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
                            const filters = ['all', 'pending', 'accepted', 'in_progress', 'completed', 'rejected'];
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
                        <Tab label={`All (${stats.total})`} />
                        <Tab label={`Pending (${stats.pending})`} />
                        <Tab label={`Accepted (${stats.accepted})`} />
                        <Tab label={`In Progress (${stats.inProgress})`} />
                        <Tab label={`Completed (${stats.completed})`} />
                        <Tab label="Rejected" />
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
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                            No case requests found
                        </Typography>
                        <Button 
                            variant="contained" 
                            sx={{ 
                                mt: 2,
                                background: 'rgba(33, 150, 243, 0.8)',
                                color: 'white',
                                '&:hover': { background: '#2196f3' }
                            }}
                            href="/lawyers"
                        >
                            Find a Lawyer
                        </Button>
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
                                                        icon={getStatusIcon(request.status)}
                                                        label={request.status.replace('_', ' ').toUpperCase()} 
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

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                            <Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Person sx={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }} />
                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                        Lawyer: <strong style={{ color: 'white' }}>{request.lawyer_name || 'Not assigned'}</strong>
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }} display="block">
                                                    Requested: {new Date(request.request_date).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button 
                                                    variant="outlined" 
                                                    size="small"
                                                    startIcon={<Visibility />}
                                                    onClick={() => window.location.href = `/case-details/${request.id}`}
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
                                                    Details
                                                    {request.has_new_updates && (
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -8,
                                                                right: -8,
                                                                backgroundColor: '#f44336',
                                                                borderRadius: '50%',
                                                                width: 12,
                                                                height: 12,
                                                                border: '2px solid #000'
                                                            }}
                                                        />
                                                    )}
                                                </Button>
                                                {(request.status === 'accepted' || request.status === 'in_progress') && (
                                                    <Button 
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<Message />}
                                                        onClick={() => window.location.href = `/messages/${request.id}`}
                                                        sx={{ 
                                                            position: 'relative',
                                                            background: 'rgba(33, 150, 243, 0.8)',
                                                            color: 'white',
                                                            '&:hover': { background: '#2196f3' }
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
                                                )}
                                            </Box>
                                        </Box>

                                        {request.response_message && (
                                            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                                    Lawyer's Response:
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                                                    {request.response_message}
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}

export default CitizenDashboard;