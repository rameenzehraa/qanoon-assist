import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container, Paper, TextField, Button, Typography,
    Box, Alert, Avatar, Divider
} from '@mui/material';
import { Lock, Person } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4
            }}
        >
            {/* Background Image with Overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'url(https://i.pinimg.com/736x/d5/ff/e8/d5ffe8067f52a3cd5ac787a35bd7a826.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.3) blur(2px)',
                    zIndex: 0
                }}
            />

            {/* Login Modal */}
            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10 }}>
                <Paper
                    elevation={24}
                    sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        p: 5,
                        position: 'relative'
                    }}
                >
                    {/* Avatar Icon */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: 'rgba(107, 114, 128, 0.3)',
                                border: '2px solid rgba(107, 114, 128, 0.5)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                            }}
                        >
                            <Person sx={{ fontSize: 40, color: 'rgba(156, 163, 175, 1)' }} />
                        </Avatar>
                    </Box>

                    {/* Title */}
                    <Typography
                        variant="h4"
                        align="center"
                        sx={{
                            color: 'white',
                            fontWeight: 600,
                            mb: 1
                        }}
                    >
                        Login to your account
                    </Typography>

                    <Typography
                        align="center"
                        sx={{
                            color: 'rgba(156, 163, 175, 1)',
                            fontSize: '0.8rem',
                            mb: 4
                        }}
                    >
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            style={{
                                color: '#FCD34D',
                                textDecoration: 'none',
                                fontWeight: 500
                            }}
                        >
                            Create account
                        </Link>
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                backgroundColor: 'rgba(185, 28, 28, 0.5)',
                                border: '1px solid rgba(220, 38, 38, 0.7)',
                                color: 'rgba(254, 202, 202, 1)',
                                '& .MuiAlert-icon': {
                                    color: 'rgba(254, 202, 202, 1)'
                                }
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Login Form */}
                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ mb: 2 }}>
                            <Typography
                                component="label"
                                sx={{
                                    display: 'block',
                                    color: 'rgba(156, 163, 175, 1)',
                                    fontSize: '0.8rem',
                                    mb: 1
                                }}
                            >
                                Username
                            </Typography>
                            <TextField
                                fullWidth
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Enter your username"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        backgroundColor: 'transparent',
                                        '& fieldset': {
                                            borderColor: 'rgba(75, 85, 99, 1)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(107, 114, 128, 1)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#FCD34D',
                                            borderWidth: '1px'
                                        },
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        color: 'white',
                                        '&::placeholder': {
                                            color: 'rgba(107, 114, 128, 1)',
                                            opacity: 1
                                        }
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography
                                component="label"
                                sx={{
                                    display: 'block',
                                    color: 'rgba(156, 163, 175, 1)',
                                    fontSize: '0.8rem',
                                    mb: 1
                                }}
                            >
                                Password
                            </Typography>
                            <TextField
                                fullWidth
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        backgroundColor: 'transparent',
                                        '& fieldset': {
                                            borderColor: 'rgba(75, 85, 99, 1)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(107, 114, 128, 1)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#FCD34D',
                                            borderWidth: '1px'
                                        },
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        color: 'white',
                                        '&::placeholder': {
                                            color: 'rgba(107, 114, 128, 1)',
                                            opacity: 1
                                        }
                                    }
                                }}
                            />
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="outlined"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                color: 'white',
                                backgroundColor: 'transparent',
                                border: '1px solid rgba(107, 114, 128, 1)',
                                borderRadius: 1,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 500,
                                '&:hover': {
                                    backgroundColor: 'rgba(252, 211, 77, 0.1)',
                                    border: '1px solid #FCD34D',
                                },
                                '&:disabled': {
                                    opacity: 0.5,
                                    color: 'white',
                                    border: '1px solid rgba(107, 114, 128, 1)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {loading ? 'Signing In...' : 'Login to account'}
                        </Button>
                    </Box>

                    <Typography
                        align="center"
                        sx={{
                            color: 'rgba(107, 114, 128, 1)',
                            fontSize: '0.75rem',
                            mt: 4
                        }}
                    >
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}

export default LoginPage;