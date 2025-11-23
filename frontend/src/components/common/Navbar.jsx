import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MenuBookIcon from '@mui/icons-material/MenuBook';

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
                background: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                minHeight: 80,
                py: 1
            }}
        >
            <Toolbar sx={{ minHeight: 80, py: 2 }}>
                {/* Logo/Brand */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5,
                        flexGrow: 1,
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate('/')}
                >
                    {/* 🎯 Logo Image Integration */}
                    <img
                        src="/images/qanoon_assist_logo.png" // Path to image in public/images
                        alt="Qanoon Assist Logo"
                        style={{
                            height: '50px', // Adjust size as needed for a good fit in the Navbar
                            width: '60px',
                            filter: "invert(1)",
                        }}
                    />
                    
                    <Typography 
                        variant="h5"
                        sx={{ 
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            fontSize: '1.5rem',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        Qanoon Assist
                    </Typography>
                </Box>

                {/* Navigation Links (Rest of the code remains the same) */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button 
                        color="inherit" 
                        onClick={() => navigate('/')}
                        sx={{
                            fontSize: '0.95rem',
                            py: 1,
                            px: 2.5,
                            color: 'rgba(209, 213, 219, 1)',
                            textTransform: 'none',
                            fontWeight: 400,
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Home
                    </Button>

                    <Button 
                        color="inherit" 
                        onClick={() => navigate('/lawyers')}
                        sx={{
                            fontSize: '0.95rem',
                            py: 1,
                            px: 2.5,
                            color: 'rgba(209, 213, 219, 1)',
                            textTransform: 'none',
                            fontWeight: 400,
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Find Lawyers
                    </Button>

                    <Button 
                        color="inherit" 
                        startIcon={<MenuBookIcon />}
                        onClick={() => navigate('/knowledge-base')}
                        sx={{
                            fontSize: '0.95rem',
                            py: 1,
                            px: 2.5,
                            color: 'rgba(209, 213, 219, 1)',
                            textTransform: 'none',
                            fontWeight: 400,
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Knowledge Base
                    </Button>

                    {isAuthenticated ? (
                        <>
                            <Button 
                                color="inherit" 
                                onClick={() => navigate('/dashboard')}
                                sx={{
                                    fontSize: '0.95rem',
                                    py: 1,
                                    px: 2.5,
                                    color: 'rgba(209, 213, 219, 1)',
                                    textTransform: 'none',
                                    fontWeight: 400,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        color: 'white',
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
                                        fontSize: '0.95rem',
                                        py: 1,
                                        px: 2.5,
                                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                        border: '1px solid rgba(239, 68, 68, 0.4)',
                                        borderRadius: 1,
                                        color: 'rgba(252, 165, 165, 1)',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        '&:hover': {
                                            backgroundColor: 'rgba(239, 68, 68, 0.25)',
                                            border: '1px solid rgba(239, 68, 68, 0.6)',
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
                                sx={{
                                    backgroundColor: 'rgba(75, 85, 99, 0.3)',
                                    color: 'rgba(209, 213, 219, 1)',
                                    border: '1px solid rgba(75, 85, 99, 0.5)',
                                    fontWeight: 500,
                                    fontSize: '0.85rem',
                                    height: 36,
                                    ml: 1,
                                    '& .MuiChip-label': {
                                        px: 2
                                    }
                                }}
                            />
                            
                            <Button 
                                color="inherit" 
                                onClick={handleLogout}
                                sx={{
                                    fontSize: '0.95rem',
                                    py: 1,
                                    px: 2.5,
                                    ml: 1,
                                    color: 'rgba(252, 165, 165, 1)',
                                    textTransform: 'none',
                                    fontWeight: 400,
                                    '&:hover': {
                                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
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
                                    fontSize: '0.95rem',
                                    py: 1,
                                    px: 2.5,
                                    ml: 1,
                                    color: 'rgba(209, 213, 219, 1)',
                                    textTransform: 'none',
                                    fontWeight: 400,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        color: 'white',
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
                                    fontSize: '0.95rem',
                                    py: 1,
                                    px: 3,
                                    ml: 1,
                                    background: 'transparent',
                                    border: '1px solid #FCD34D',
                                    borderRadius: '20px',
                                    color: '#FCD34D',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    '&:hover': {
                                        backgroundColor: 'rgba(252, 211, 77, 0.1)',
                                        border: '1px solid #F59E0B',
                                        color: '#F59E0B',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Signup →
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;