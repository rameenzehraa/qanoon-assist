import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, isAdmin } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar 
            position="static"
            sx={{
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                borderBottom: '1px solid #34495e',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                minHeight: 80, // Increased height
                py: 1 // Added padding
            }}
        >
            <Toolbar sx={{ minHeight: 80, py: 2 }}> {/* Increased toolbar height and padding */}
                <Typography 
                    variant="h5" // Larger font size
                    sx={{ 
                        flexGrow: 1, 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        fontSize: '1.5rem' // Explicit font size
                    }}
                    onClick={() => navigate('/')}
                >
                    Qanoon Assist
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}> {/* Increased gap */}
                    <Button 
                        color="inherit" 
                        onClick={() => navigate('/lawyers')}
                        sx={{
                            fontSize: '1rem', // Larger font
                            py: 1, // More vertical padding
                            px: 2, // More horizontal padding
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Find Lawyers
                    </Button>

                    {isAuthenticated ? (
                        <>
                            <Button 
                                color="inherit" 
                                onClick={() => navigate('/dashboard')}
                                sx={{
                                    fontSize: '1rem',
                                    py: 1,
                                    px: 2,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Dashboard
                            </Button>

                            {/* Admin Panel Button - Only show for admin users */}
                            {isAdmin && (
                                <Button 
                                    color="inherit" 
                                    onClick={() => navigate('/admin/dashboard')}
                                    sx={{
                                        fontSize: '1rem',
                                        py: 1,
                                        px: 2,
                                        backgroundColor: 'rgba(231, 76, 60, 0.2)',
                                        border: '1px solid rgba(231, 76, 60, 0.5)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(231, 76, 60, 0.3)',
                                            border: '1px solid rgba(231, 76, 60, 0.8)',
                                            transform: 'translateY(-1px)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    Admin Panel
                                </Button>
                            )}

                            <Chip 
                                label={`${user?.username} (${user?.user_type})`}
                                size="medium" // Larger chip
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    py: 2, // More chip padding
                                    height: 'auto'
                                }}
                            />
                            <Button 
                                color="inherit" 
                                onClick={handleLogout}
                                sx={{
                                    fontSize: '1rem',
                                    py: 1,
                                    px: 2,
                                    '&:hover': {
                                        backgroundColor: 'rgba(231, 76, 60, 0.2)',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button 
                                color="inherit" 
                                onClick={() => navigate('/login')}
                                sx={{
                                    fontSize: '1rem',
                                    py: 1,
                                    px: 2,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Login
                            </Button>
                            <Button 
                                color="inherit" 
                                onClick={() => navigate('/register')}
                                sx={{
                                    fontSize: '1rem',
                                    py: 1,
                                    px: 2,
                                    border: '2px solid rgba(255,255,255,0.6)', // Thicker border
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        border: '2px solid rgba(255,255,255,0.9)',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Register
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;