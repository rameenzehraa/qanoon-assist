import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Grid, Paper, Box,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Avatar, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Alert, CircularProgress, Card, CardContent,
    Divider, List, ListItem, ListItemText, Tab, Tabs
} from '@mui/material';
import {
    CheckCircle, Cancel, Pending, People, Gavel,
    Description, Schedule, Message, TrendingUp,
    Person, PersonAdd, Work, HourglassEmpty,
    Dashboard, CaseIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI, lawyerAPI } from '../../services/api';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

function AdminDashboard() {
    const { isAdmin, user, loading: authLoading } = useAuth();
    console.log('⚡ AdminDashboard - isAdmin:', isAdmin);
    const [stats, setStats] = useState(null);
    const [pendingLawyers, setPendingLawyers] = useState([]);
    const [recentActivity, setRecentActivity] = useState(null);
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [message, setMessage] = useState(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (isAdmin) {
            fetchDashboardData();
        }
    }, [isAdmin]);

    const fetchDashboardData = async () => {
        console.log('🔍 fetchDashboardData called');
        console.log('🔍 isAdmin:', isAdmin);
        
        try {
            console.log('📡 Making API calls...');
            
            const [statsRes, lawyersRes, activityRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getPendingLawyers(),
                adminAPI.getRecentActivity()
            ]);
            
            console.log('✅ Stats response:', statsRes.data);
            console.log('✅ Lawyers response:', lawyersRes.data);
            console.log('✅ Activity response:', activityRes.data);
            
            setStats(statsRes.data);
            setPendingLawyers(lawyersRes.data);
            setRecentActivity(activityRes.data);
        } catch (error) {
            console.error('❌ Failed to fetch dashboard data:', error);
            console.error('❌ Error details:', error.response?.data);
            setMessage({ type: 'error', text: 'Failed to load dashboard data' });
        }
        setDataLoading(false);
    };

    const handleVerify = async (lawyerId) => {
        try {
            const response = await lawyerAPI.verify(lawyerId);
            setMessage({ type: 'success', text: response.data.message });
            fetchDashboardData();
        } catch (error) {
            console.error('Verify error:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.error || 'Failed to verify lawyer' 
            });
        }
    };

    const handleReject = async () => {
        if (!selectedLawyer) return;
        
        try {
            await lawyerAPI.reject(selectedLawyer.id, { reason: rejectReason });
            setMessage({ type: 'success', text: 'Lawyer rejected' });
            setRejectDialogOpen(false);
            setRejectReason('');
            setSelectedLawyer(null);
            fetchDashboardData();
        } catch (error) {
            console.error('Reject error:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.error || 'Failed to reject lawyer' 
            });
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'warning',
            accepted: 'info',
            in_progress: 'primary',
            completed: 'success',
            rejected: 'error',
            active: 'success',
        };
        return colors[status] || 'default';
    };

    if (!isAdmin) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    backgroundColor: '#000',
                    backgroundImage: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
                    color: 'white',
                    py: 6,
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Container>
                    <Alert severity="error" sx={{ 
                        background: 'rgba(244, 67, 54, 0.1)', 
                        border: '1px solid rgba(244, 67, 54, 0.3)', 
                        color: '#ff7675',
                        borderRadius: 2
                    }}>
                        Access Denied. Admin privileges required.
                    </Alert>
                </Container>
            </Box>
        );
    }

    if (dataLoading) {
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
                        Admin Dashboard
                    </Typography>
                </Box>

                {message && (
                    <Alert 
                        severity={message.type} 
                        sx={{ 
                            mb: 4,
                            background: message.type === 'error' 
                                ? 'rgba(244, 67, 54, 0.1)' 
                                : 'rgba(76, 175, 80, 0.1)',
                            border: message.type === 'error'
                                ? '1px solid rgba(244, 67, 54, 0.3)'
                                : '1px solid rgba(76, 175, 80, 0.3)',
                            color: message.type === 'error' ? '#ff7675' : '#81c784',
                            borderRadius: 2
                        }} 
                        onClose={() => setMessage(null)}
                    >
                        {message.text}
                    </Alert>
                )}

                {/* Main Statistics Grid */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    {/* User Statistics */}
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
                                    <People sx={{ fontSize: 40, color: '#64b5f6', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {stats?.total_users || 0}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                            Total Users
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1.5 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                                            Citizens
                                        </Typography>
                                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                                            {stats?.total_citizens || 0}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                                            Lawyers
                                        </Typography>
                                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                                            {stats?.total_lawyers || 0}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Lawyer Verification */}
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
                                    <PersonAdd sx={{ fontSize: 40, color: '#ffc107', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {stats?.pending_verification || 0}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                            Pending Verification
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1.5 }} />
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                                        Verified Lawyers
                                    </Typography>
                                    <Typography sx={{ color: 'white', fontWeight: 600 }}>
                                        {stats?.verified_lawyers || 0}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Case Requests */}
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
                                    <Description sx={{ fontSize: 40, color: '#81c784', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {stats?.total_case_requests || 0}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                            Case Requests
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1.5 }} />
                                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                            Pending
                                        </Typography>
                                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                                            {stats?.pending_requests || 0}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                            Active
                                        </Typography>
                                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                                            {stats?.in_progress_cases || 0}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Active Cases */}
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
                                    <Gavel sx={{ fontSize: 40, color: '#e57373', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {stats?.active_cases || 0}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                            Active Cases
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1.5 }} />
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                                        Total Cases
                                    </Typography>
                                    <Typography sx={{ color: 'white', fontWeight: 600 }}>
                                        {stats?.total_cases || 0}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Additional Stats Row */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 3,
                            backdropFilter: 'blur(4px)',
                            textAlign: 'center',
                            p: 2
                        }}>
                            <Schedule sx={{ fontSize: 40, color: '#ff7043', mb: 1 }} />
                            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                                {stats?.upcoming_hearings || 0}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                Upcoming Hearings
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                Total: {stats?.total_hearings || 0}
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 3,
                            backdropFilter: 'blur(4px)',
                            textAlign: 'center',
                            p: 2
                        }}>
                            <TrendingUp sx={{ fontSize: 40, color: '#4db8ff', mb: 1 }} />
                            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                                {stats?.total_case_updates || 0}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                Case Updates
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 3,
                            backdropFilter: 'blur(4px)',
                            textAlign: 'center',
                            p: 2
                        }}>
                            <Message sx={{ fontSize: 40, color: '#b39ddb', mb: 1 }} />
                            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                                {stats?.total_messages || 0}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                Total Messages
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#ffc107' }}>
                                Unread: {stats?.unread_messages || 0}
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 3,
                            backdropFilter: 'blur(4px)',
                            textAlign: 'center',
                            p: 2
                        }}>
                            <CheckCircle sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                                {stats?.completed_cases || 0}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                Completed Cases
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tabs for Different Sections */}
                <Paper sx={{ 
                    mb: 4,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: 3
                }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={(e, newValue) => setTabValue(newValue)} 
                        centered
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
                        <Tab label={`Pending Lawyers (${pendingLawyers.length})`} />
                        <Tab label="Recent Activity" />
                    </Tabs>
                </Paper>

                {/* Tab 1: Pending Lawyers Table */}
                <TabPanel value={tabValue} index={0}>
                    <Paper sx={{ 
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ background: 'rgba(255,255,255,0.08)' }}>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Photo</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Name</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Email</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Bar Council #</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>City</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Experience</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingLawyers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <Typography sx={{ py: 4, color: 'rgba(255,255,255,0.5)' }}>
                                                    No lawyers pending verification
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pendingLawyers.map((lawyer) => (
                                            <TableRow key={lawyer.id} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <TableCell>
                                                    <Avatar src={lawyer.profile_picture_url} sx={{ bgcolor: '#64b5f6' }}>
                                                        {lawyer.user?.first_name?.[0]}{lawyer.user?.last_name?.[0]}
                                                    </Avatar>
                                                </TableCell>
                                                <TableCell sx={{ color: 'white' }}>
                                                    {lawyer.user?.first_name} {lawyer.user?.last_name}
                                                </TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                    {lawyer.user?.email}
                                                </TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                    {lawyer.bar_council_number}
                                                </TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                    {lawyer.city}
                                                </TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                    {lawyer.experience_years} years
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={<Pending />}
                                                        label="Pending"
                                                        sx={{
                                                            bgcolor: 'rgba(255, 193, 7, 0.2)',
                                                            color: '#ffc107',
                                                            border: '1px solid rgba(255, 193, 7, 0.3)',
                                                            fontWeight: 600
                                                        }}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            startIcon={<CheckCircle />}
                                                            onClick={() => handleVerify(lawyer.id)}
                                                            sx={{
                                                                background: 'rgba(76, 175, 80, 0.8)',
                                                                color: 'white',
                                                                '&:hover': { background: '#4caf50' }
                                                            }}
                                                        >
                                                            Verify
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<Cancel />}
                                                            onClick={() => {
                                                                setSelectedLawyer(lawyer);
                                                                setRejectDialogOpen(true);
                                                            }}
                                                            sx={{
                                                                borderColor: 'rgba(244, 67, 54, 0.5)',
                                                                color: '#ff7675',
                                                                '&:hover': {
                                                                    borderColor: '#f44336',
                                                                    background: 'rgba(244, 67, 54, 0.1)'
                                                                }
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </TabPanel>

                {/* Tab 2: Recent Activity */}
                <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={3}>
                        {/* Recent Case Requests */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ 
                                p: 3,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(4px)',
                                borderRadius: 3,
                                height: '100%'
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
                                    Recent Case Requests
                                </Typography>
                                <List>
                                    {recentActivity?.recent_requests?.length === 0 ? (
                                        <ListItem>
                                            <ListItemText 
                                                primary={<Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>No recent requests</Typography>}
                                                secondary={<Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>Case requests will appear here</Typography>}
                                            />
                                        </ListItem>
                                    ) : (
                                        recentActivity?.recent_requests?.map((req) => (
                                            <ListItem key={req.id} divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                                <ListItemText
                                                    primary={<Typography sx={{ color: 'white', fontWeight: 600 }}>{req.title}</Typography>}
                                                    secondary={
                                                        <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                                            {req.citizen} → {req.lawyer}
                                                            <br />
                                                            {new Date(req.date).toLocaleDateString()}
                                                        </Typography>
                                                    }
                                                />
                                                <Chip 
                                                    label={req.status}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'rgba(255,255,255,0.1)',
                                                        color: 'white',
                                                        border: '1px solid rgba(255,255,255,0.2)'
                                                    }}
                                                />
                                            </ListItem>
                                        ))
                                    )}
                                </List>
                            </Paper>
                        </Grid>

                        {/* Recent Cases */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ 
                                p: 3,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(4px)',
                                borderRadius: 3,
                                height: '100%'
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
                                    Recent Cases
                                </Typography>
                                <List>
                                    {recentActivity?.recent_cases?.length === 0 ? (
                                        <ListItem>
                                            <ListItemText 
                                                primary={<Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>No recent cases</Typography>}
                                                secondary={<Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>Active cases will appear here</Typography>}
                                            />
                                        </ListItem>
                                    ) : (
                                        recentActivity?.recent_cases?.map((caseItem) => (
                                            <ListItem key={caseItem.id} divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                                <ListItemText
                                                    primary={<Typography sx={{ color: 'white', fontWeight: 600 }}>{`${caseItem.case_number} - ${caseItem.title}`}</Typography>}
                                                    secondary={
                                                        <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                                            {caseItem.citizen} & {caseItem.lawyer}
                                                            <br />
                                                            {new Date(caseItem.date).toLocaleDateString()}
                                                        </Typography>
                                                    }
                                                />
                                                <Chip 
                                                    label={caseItem.status} 
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'rgba(255,255,255,0.1)',
                                                        color: 'white',
                                                        border: '1px solid rgba(255,255,255,0.2)'
                                                    }}
                                                />
                                            </ListItem>
                                        ))
                                    )}
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* Reject Dialog */}
                <Dialog 
                    open={rejectDialogOpen} 
                    onClose={() => setRejectDialogOpen(false)}
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
                        Reject Lawyer Application
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
                            Are you sure you want to reject {selectedLawyer?.user?.first_name} {selectedLawyer?.user?.last_name}?
                        </Typography>
                        <TextField
                            fullWidth
                            label="Reason for Rejection"
                            multiline
                            rows={3}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter reason for rejection..."
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
                            onClick={() => setRejectDialogOpen(false)}
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
                            onClick={handleReject} 
                            variant="contained"
                            sx={{
                                background: 'rgba(244, 67, 54, 0.8)',
                                color: 'white',
                                '&:hover': { 
                                    background: '#f44336',
                                    boxShadow: '0 0 20px rgba(244, 67, 54, 0.4)'
                                }
                            }}
                        >
                            Reject Application
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}

export default AdminDashboard;