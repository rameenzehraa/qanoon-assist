import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import CitizenDashboard from '../components/common/dashboard/CitizenDashboard';
import LawyerDashboard from '../components/common/dashboard/LawyerDashboard';
import { Container, Typography, Paper, Chip, Box } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

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
                <Box
                    sx={{
                        minHeight: '100vh',
                        backgroundColor: '#000',
                        backgroundImage: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
                        color: 'white',
                        py: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Container maxWidth="md">
                        <Paper
                            elevation={6}
                            sx={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: 4,
                                backdropFilter: 'blur(4px)',
                                p: 6,
                                textAlign: 'center',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                            }}
                        >
                            {/* Icon */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mb: 3
                                }}
                            >
                                <PendingActionsIcon
                                    sx={{
                                        fontSize: 64,
                                        color: '#ffc107',
                                        animation: 'pulse 2s ease-in-out infinite'
                                    }}
                                />
                            </Box>

                            {/* Heading */}
                            <Typography
                                variant="h3"
                                gutterBottom
                                sx={{
                                    fontWeight: 800,
                                    color: 'white',
                                    mb: 2
                                }}
                            >
                                Account Pending Verification
                            </Typography>

                            {/* Subheading */}
                            <Typography
                                variant="h6"
                                sx={{
                                    mt: 3,
                                    mb: 4,
                                    color: 'rgba(255,255,255,0.8)',
                                    lineHeight: 1.8,
                                    fontWeight: 400
                                }}
                            >
                                Your lawyer account is currently under review by our admin team.
                                You will be notified once your account is verified.
                            </Typography>

                            {/* Status Chip */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Chip
                                    icon={<PendingActionsIcon />}
                                    label="PENDING VERIFICATION"
                                    sx={{
                                        backgroundColor: 'rgba(255, 193, 7, 0.15)',
                                        color: '#ffc107',
                                        fontWeight: 700,
                                        fontSize: '0.95rem',
                                        padding: '24px 8px',
                                        border: '1px solid rgba(255, 193, 7, 0.3)',
                                        '& .MuiChip-icon': {
                                            color: '#ffc107 !important'
                                        }
                                    }}
                                />
                            </Box>

                            {/* Additional Info */}
                            <Box
                                sx={{
                                    mt: 5,
                                    p: 3,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 2,
                                    backdropFilter: 'blur(2px)'
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'rgba(255,255,255,0.6)',
                                        lineHeight: 1.8
                                    }}
                                >
                                    ℹ️ Verification typically takes 24-48 hours. Check your email for updates from our admin team.
                                </Typography>
                            </Box>
                        </Paper>
                    </Container>

                    <style>{`
                        @keyframes pulse {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.7; }
                        }
                    `}</style>
                </Box>
            );
        }
        return <LawyerDashboard />;
    }

    if (isAdmin) {
        return <Navigate to="/admin/dashboard" />;
    }

    // Default welcome page
    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: '#000',
                backgroundImage: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
                color: 'white',
                py: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={6}
                    sx={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 4,
                        backdropFilter: 'blur(4px)',
                        p: 6,
                        textAlign: 'center',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }}
                >
                    {/* Icon */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 3
                        }}
                    >
                        <VerifiedUserIcon
                            sx={{
                                fontSize: 64,
                                color: 'white'
                            }}
                        />
                    </Box>

                    {/* Welcome Message */}
                    <Typography
                        variant="h3"
                        gutterBottom
                        sx={{
                            fontWeight: 800,
                            color: 'white',
                            mb: 2
                        }}
                    >
                        Welcome, {user?.first_name || user?.username}!
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'rgba(255,255,255,0.7)',
                            mt: 3,
                            fontSize: '1.1rem',
                            lineHeight: 1.8
                        }}
                    >
                        You're all set to access the platform. Choose an action from the navigation menu to get started.
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}

export default DashboardPage;