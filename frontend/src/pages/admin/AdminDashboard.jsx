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
    Person, PersonAdd, Work, HourglassEmpty
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
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">Access Denied. Admin privileges required.</Alert>
            </Container>
        );
    }

    if (dataLoading) {
        return (
            <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Admin Dashboard
            </Typography>

            {message && (
                <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
                    {message.text}
                </Alert>
            )}

            {/* Main Statistics Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* User Statistics */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <People sx={{ fontSize: 40, color: 'white', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {stats?.total_users || 0}
                                    </Typography>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                        Total Users
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                    Citizens: {stats?.total_citizens || 0}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                    Lawyers: {stats?.total_lawyers || 0}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Lawyer Verification */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <PersonAdd sx={{ fontSize: 40, color: 'white', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {stats?.pending_verification || 0}
                                    </Typography>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                        Pending Verification
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 1 }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                Verified: {stats?.verified_lawyers || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Case Requests */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Description sx={{ fontSize: 40, color: 'white', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {stats?.total_case_requests || 0}
                                    </Typography>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                        Case Requests
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 1 }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                Pending: {stats?.pending_requests || 0} | Active: {stats?.in_progress_cases || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Active Cases */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Gavel sx={{ fontSize: 40, color: 'white', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {stats?.active_cases || 0}
                                    </Typography>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                        Active Cases
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 1 }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                Total Cases: {stats?.total_cases || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Additional Stats Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Schedule sx={{ fontSize: 40, color: '#FF6B6B', mb: 1 }} />
                        <Typography variant="h4" color="primary">
                            {stats?.upcoming_hearings || 0}
                        </Typography>
                        <Typography color="text.secondary">Upcoming Hearings</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Total: {stats?.total_hearings || 0}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <TrendingUp sx={{ fontSize: 40, color: '#4ECDC4', mb: 1 }} />
                        <Typography variant="h4" color="success.main">
                            {stats?.total_case_updates || 0}
                        </Typography>
                        <Typography color="text.secondary">Case Updates</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Message sx={{ fontSize: 40, color: '#95E1D3', mb: 1 }} />
                        <Typography variant="h4" color="info.main">
                            {stats?.total_messages || 0}
                        </Typography>
                        <Typography color="text.secondary">Total Messages</Typography>
                        <Typography variant="caption" color="warning.main">
                            Unread: {stats?.unread_messages || 0}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <CheckCircle sx={{ fontSize: 40, color: '#A8E6CF', mb: 1 }} />
                        <Typography variant="h4" color="success.main">
                            {stats?.completed_cases || 0}
                        </Typography>
                        <Typography color="text.secondary">Completed Cases</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Tabs for Different Sections */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} centered>
                    <Tab label={`Pending Lawyers (${pendingLawyers.length})`} />
                    <Tab label="Recent Activity" />
                </Tabs>
            </Paper>

            {/* Tab 1: Pending Lawyers Table */}
            <TabPanel value={tabValue} index={0}>
                <Paper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Photo</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Bar Council #</TableCell>
                                    <TableCell>City</TableCell>
                                    <TableCell>Experience</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingLawyers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Typography color="text.secondary" sx={{ py: 4 }}>
                                                No lawyers pending verification
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pendingLawyers.map((lawyer) => (
                                        <TableRow key={lawyer.id}>
                                            <TableCell>
                                                <Avatar src={lawyer.profile_picture_url}>
                                                    {lawyer.user?.first_name?.[0]}{lawyer.user?.last_name?.[0]}
                                                </Avatar>
                                            </TableCell>
                                            <TableCell>
                                                {lawyer.user?.first_name} {lawyer.user?.last_name}
                                            </TableCell>
                                            <TableCell>{lawyer.user?.email}</TableCell>
                                            <TableCell>{lawyer.bar_council_number}</TableCell>
                                            <TableCell>{lawyer.city}</TableCell>
                                            <TableCell>{lawyer.experience_years} years</TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={<Pending />}
                                                    label="Pending"
                                                    color="warning"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        startIcon={<CheckCircle />}
                                                        onClick={() => handleVerify(lawyer.id)}
                                                    >
                                                        Verify
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<Cancel />}
                                                        onClick={() => {
                                                            setSelectedLawyer(lawyer);
                                                            setRejectDialogOpen(true);
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
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Recent Case Requests
                            </Typography>
                            <List>
                                {recentActivity?.recent_requests?.length === 0 ? (
                                    <ListItem>
                                        <ListItemText 
                                            primary="No recent requests"
                                            secondary="Case requests will appear here"
                                        />
                                    </ListItem>
                                ) : (
                                    recentActivity?.recent_requests?.map((req) => (
                                        <ListItem key={req.id} divider>
                                            <ListItemText
                                                primary={req.title}
                                                secondary={
                                                    <>
                                                        {req.citizen} → {req.lawyer}
                                                        <br />
                                                        {new Date(req.date).toLocaleDateString()}
                                                    </>
                                                }
                                            />
                                            <Chip 
                                                label={req.status} 
                                                color={getStatusColor(req.status)} 
                                                size="small" 
                                            />
                                        </ListItem>
                                    ))
                                )}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Recent Cases */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Recent Cases
                            </Typography>
                            <List>
                                {recentActivity?.recent_cases?.length === 0 ? (
                                    <ListItem>
                                        <ListItemText 
                                            primary="No recent cases"
                                            secondary="Active cases will appear here"
                                        />
                                    </ListItem>
                                ) : (
                                    recentActivity?.recent_cases?.map((caseItem) => (
                                        <ListItem key={caseItem.id} divider>
                                            <ListItemText
                                                primary={`${caseItem.case_number} - ${caseItem.title}`}
                                                secondary={
                                                    <>
                                                        {caseItem.citizen} & {caseItem.lawyer}
                                                        <br />
                                                        {new Date(caseItem.date).toLocaleDateString()}
                                                    </>
                                                }
                                            />
                                            <Chip 
                                                label={caseItem.status} 
                                                color={getStatusColor(caseItem.status)} 
                                                size="small" 
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
            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
                <DialogTitle>Reject Lawyer Application</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleReject} color="error" variant="contained">
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default AdminDashboard;