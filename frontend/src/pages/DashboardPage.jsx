import React from 'react';
import { Container, Typography, Paper, Box, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function DashboardPage() {
    const { user, isAuthenticated, isCitizen, isLawyer, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper 
                elevation={6} 
                sx={{ 
                    p: 4,
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    color: 'white',
                    border: '1px solid #34495e'
                }}
            >
                <Typography 
                    variant="h4" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                >
                    Welcome, {user?.first_name || user?.username}!
                </Typography>
                
                <Chip 
                    label={user?.user_type?.toUpperCase()}
                    sx={{
                        backgroundColor: '#ecf0f1',
                        color: '#2c3e50',
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                    }}
                />
            </Paper>

            <Paper 
                elevation={4} 
                sx={{ 
                    p: 4, 
                    mt: 3,
                    background: '#ffffff',
                    border: '1px solid #ecf0f1'
                }}
            >
                <Box sx={{ mb: 4 }}>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: '#2c3e50', 
                            mb: 2,
                            fontWeight: 'bold'
                        }}
                    >
                        Account Information
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#7f8c8d', mb: 1 }}>
                        <strong>Email:</strong> {user?.email || 'Not provided'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#7f8c8d', mb: 1 }}>
                        <strong>Phone:</strong> {user?.phone_number || 'Not provided'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
                        <strong>User Type:</strong> {user?.user_type}
                    </Typography>
                </Box>

                <Box>
                    {isCitizen && (
                        <>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    color: '#2c3e50', 
                                    mb: 2,
                                    fontWeight: 'bold'
                                }}
                            >
                                Citizen Dashboard
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
                                Here you can browse lawyers, request cases, and manage your cases.
                            </Typography>
                        </>
                    )}

                    {isLawyer && (
                        <>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    color: '#2c3e50', 
                                    mb: 2,
                                    fontWeight: 'bold'
                                }}
                            >
                                Lawyer Dashboard
                            </Typography>
                            {user?.profile?.is_verified ? (
                                <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
                                    Your account is verified! You can now accept cases.
                                </Typography>
                            ) : (
                                <Typography variant="body1" sx={{ color: '#e74c3c' }}>
                                    Your account is pending verification by admin.
                                </Typography>
                            )}
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    color: '#2c3e50', 
                                    mb: 2,
                                    fontWeight: 'bold'
                                }}
                            >
                                Admin Dashboard
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
                                Manage lawyers, verify accounts, and oversee the platform.
                            </Typography>
                        </>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}

export default DashboardPage;