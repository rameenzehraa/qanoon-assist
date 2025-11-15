import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Grid, Paper, Box,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Avatar, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Alert, CircularProgress
} from '@mui/material';
import { CheckCircle, Cancel, Pending } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI, lawyerAPI } from '../../services/api';

function AdminDashboard() {
    const { isAdmin } = useAuth();
    const [stats, setStats] = useState(null);
    const [pendingLawyers, setPendingLawyers] = useState([]);
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAdmin) {
            fetchDashboardData();
        }
    }, [isAdmin]);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, lawyersRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getPendingLawyers()
            ]);
            setStats(statsRes.data);
            setPendingLawyers(lawyersRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setMessage({ type: 'error', text: 'Failed to load dashboard data' });
        }
        setLoading(false);
    };

    const handleVerify = async (lawyerId) => {
        try {
            const response = await lawyerAPI.verify(lawyerId);
            setMessage({ type: 'success', text: response.data.message });
            fetchDashboardData(); // Refresh data
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
            fetchDashboardData(); // Refresh data
        } catch (error) {
            console.error('Reject error:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.error || 'Failed to reject lawyer' 
            });
        }
    };

    if (!isAdmin) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">Access Denied. Admin privileges required.</Alert>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            {message && (
                <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
                    {message.text}
                </Alert>
            )}

            {/* Statistics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h3" color="primary">
                            {stats?.total_users || 0}
                        </Typography>
                        <Typography color="text.secondary">Total Users</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h3" color="success.main">
                            {stats?.verified_lawyers || 0}
                        </Typography>
                        <Typography color="text.secondary">Verified Lawyers</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h3" color="warning.main">
                            {stats?.pending_verification || 0}
                        </Typography>
                        <Typography color="text.secondary">Pending Verification</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h3" color="info.main">
                            {stats?.total_citizens || 0}
                        </Typography>
                        <Typography color="text.secondary">Citizens</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Pending Lawyers Table */}
            <Paper>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Lawyers Pending Verification ({pendingLawyers.length})
                    </Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Photo</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Bar Council #</TableCell>
                                <TableCell>CNIC</TableCell>
                                <TableCell>City</TableCell>
                                <TableCell>Experience</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingLawyers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        <Typography color="text.secondary">
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
                                        <TableCell>{lawyer.cnic || 'N/A'}</TableCell>
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