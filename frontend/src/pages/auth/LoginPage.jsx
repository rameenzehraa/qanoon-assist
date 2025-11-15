import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container, Paper, TextField, Button, Typography,
    Box, Alert, Avatar
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
        <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
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
                    align="center" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 'bold',
                        color: 'white',
                        mb: 2,
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                >
                    Welcome Back
                </Typography>
                
                <Typography 
                    variant="h6" 
                    align="center" 
                    sx={{ 
                        color: '#bdc3c7',
                        mb: 4,
                        fontWeight: 300
                    }}
                >
                    Login to Your Qanoon Assist Account
                </Typography>

                <Paper 
                    elevation={4} 
                    sx={{ 
                        p: 4, 
                        background: '#ffffff',
                        border: '1px solid #ecf0f1'
                    }}
                >
                    {/* Login Avatar */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: '#2c3e50',
                                mb: 2,
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                            }}
                        >
                            <Lock fontSize="large" />
                        </Avatar>
                    </Box>

                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 3,
                                borderRadius: 1,
                                background: '#f8d7da',
                                color: '#721c24',
                                border: '1px solid #f5c6cb'
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: (
                                    <Person 
                                        sx={{ 
                                            mr: 1, 
                                            color: '#7f8c8d' 
                                        }} 
                                    />
                                ),
                            }}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    '& fieldset': {
                                        borderColor: '#bdc3c7',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#95a5a6',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#2c3e50',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#7f8c8d',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#2c3e50',
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: (
                                    <Lock 
                                        sx={{ 
                                            mr: 1, 
                                            color: '#7f8c8d' 
                                        }} 
                                    />
                                ),
                            }}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    '& fieldset': {
                                        borderColor: '#bdc3c7',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#95a5a6',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#2c3e50',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#7f8c8d',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#2c3e50',
                                },
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ 
                                mt: 2, 
                                mb: 3,
                                py: 1.5,
                                background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                borderRadius: 1,
                                border: '1px solid #2c3e50',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                },
                                '&:disabled': {
                                    background: '#bdc3c7',
                                    color: '#7f8c8d'
                                },
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Login to Account'}
                        </Button>

                        <Typography 
                            align="center" 
                            sx={{ 
                                mt: 3,
                                color: '#7f8c8d',
                                fontSize: '0.9rem'
                            }}
                        >
                            Don't have an account?{' '}
                            <Link 
                                to="/register" 
                                style={{ 
                                    color: '#2c3e50', 
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    borderBottom: '1px solid #2c3e50',
                                    paddingBottom: '1px'
                                }}
                            >
                                Create Account
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Paper>
        </Container>
    );
}

export default LoginPage;