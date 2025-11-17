import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Grid, Card, CardContent,
    Box, Chip, Button, CircularProgress, Paper
} from '@mui/material';
import { 
    PendingActions, CheckCircle, Cancel, 
    HourglassEmpty, Assignment 
} from '@mui/icons-material';
import { caseRequestAPI } from '../../../services/api';

function CitizenDashboard() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

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
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                My Case Requests
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#f0f4ff' }}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Total Requests
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                                {stats.total}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#fff8e1' }}>
                        <CardContent>
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
                            <Typography color="text.secondary" gutterBottom>
                                In Progress
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                                {stats.inProgress}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter Buttons */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['all', 'pending', 'accepted', 'in_progress', 'completed', 'rejected'].map((status) => (
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
                    <Button 
                        variant="contained" 
                        sx={{ mt: 2 }}
                        href="/lawyers"
                    >
                        Find a Lawyer
                    </Button>
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
                                                    icon={getStatusIcon(request.status)}
                                                    label={request.status.replace('_', ' ').toUpperCase()} 
                                                    color={getStatusColor(request.status)}
                                                    size="small"
                                                />
                                                <Chip 
                                                    label={request.urgency.toUpperCase()} 
                                                    size="small"
                                                    variant="outlined"
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

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Lawyer: <strong>{request.lawyer_name}</strong>
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Requested: {new Date(request.request_date).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button variant="outlined" size="small">
                                                View Details
                                            </Button>
                                            {(request.status === 'accepted' || request.status === 'in_progress') && (
                                                <Button 
                                                    variant="contained"
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
                                                                fontWeight: 'bold'
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
                                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Lawyer's Response:
                                            </Typography>
                                            <Typography variant="body2">
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
    );
}

export default CitizenDashboard;