import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import CitizenDashboard from '../components/common/dashboard/CitizenDashboard';
import LawyerDashboard from '../components/common/dashboard/LawyerDashboard';
import { Container, Typography, Paper, Chip } from '@mui/material';

function DashboardPage() {
    const { user, isAuthenticated, isCitizen, isLawyer, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Show appropriate dashboard based on user type
    if (isCitizen) {
        return <CitizenDashboard />;
    }

    if (isLawyer) {
        // Check if lawyer is verified
        if (!user?.profile?.is_verified) {
            return (
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Paper 
                        elevation={6} 
                        sx={{ 
                            p: 6,
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}
                    >
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Account Pending Verification
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
                            Your lawyer account is currently under review by our admin team.
                            You will be notified once your account is verified.
                        </Typography>
                        <Chip 
                            label="PENDING VERIFICATION"
                            sx={{
                                backgroundColor: '#fff3cd',
                                color: '#856404',
                                fontWeight: 'bold',
                                fontSize: '1rem'
                            }}
                        />
                    </Paper>
                </Container>
            );
        }
        return <LawyerDashboard />;
    }

    if (isAdmin) {
        return <Navigate to="/admin/dashboard" />;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={6} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Welcome, {user?.first_name || user?.username}!
                </Typography>
            </Paper>
        </Container>
    );
}

export default DashboardPage;