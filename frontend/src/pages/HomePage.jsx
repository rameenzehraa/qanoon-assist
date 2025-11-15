import React from 'react';
import { Container, Typography, Button, Box, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Gavel, People, Shield } from '@mui/icons-material';

function HomePage() {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg">
            {/* Hero Section */}
            <Paper 
                elevation={6} 
                sx={{ 
                    mt: 8, 
                    mb: 4, 
                    p: 6,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    color: 'white',
                    border: '1px solid #34495e'
                }}
            >
                <Typography 
                    variant="h2" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                >
                    Welcome to Qanoon Assist
                </Typography>
                <Typography 
                    variant="h5" 
                    paragraph
                    sx={{ 
                        color: '#bdc3c7',
                        mb: 4
                    }}
                >
                    Your trusted platform for connecting with verified lawyers in Pakistan
                </Typography>
                <Box sx={{ mt: 4 }}>
                    <Button 
                        variant="contained" 
                        size="large" 
                        sx={{ 
                            mr: 2,
                            background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                            border: '1px solid #2c3e50',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => navigate('/lawyers')}
                    >
                        Find a Lawyer
                    </Button>
                    <Button 
                        variant="outlined" 
                        size="large"
                        sx={{ 
                            borderColor: 'white',
                            color: 'white',
                            '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                        onClick={() => navigate('/register')}
                    >
                        Register Now
                    </Button>
                </Box>
            </Paper>

            {/* Features Section */}
            <Grid container spacing={4} sx={{ mt: 4, mb: 8 }}>
                <Grid item xs={12} md={4}>
                    <Paper 
                        elevation={4} 
                        sx={{ 
                            p: 3, 
                            textAlign: 'center', 
                            height: '100%',
                            background: '#ffffff',
                            border: '1px solid #ecf0f1'
                        }}
                    >
                        <Gavel sx={{ fontSize: 60, color: '#2c3e50', mb: 2 }} />
                        <Typography 
                            variant="h5" 
                            gutterBottom 
                            sx={{ color: '#2c3e50', fontWeight: 'bold' }}
                        >
                            Verified Lawyers
                        </Typography>
                        <Typography sx={{ color: '#7f8c8d' }}>
                            All lawyers are verified by our admin team to ensure authenticity
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper 
                        elevation={4} 
                        sx={{ 
                            p: 3, 
                            textAlign: 'center', 
                            height: '100%',
                            background: '#ffffff',
                            border: '1px solid #ecf0f1'
                        }}
                    >
                        <People sx={{ fontSize: 60, color: '#2c3e50', mb: 2 }} />
                        <Typography 
                            variant="h5" 
                            gutterBottom 
                            sx={{ color: '#2c3e50', fontWeight: 'bold' }}
                        >
                            Easy Communication
                        </Typography>
                        <Typography sx={{ color: '#7f8c8d' }}>
                            Direct messaging with lawyers and case tracking in one place
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper 
                        elevation={4} 
                        sx={{ 
                            p: 3, 
                            textAlign: 'center', 
                            height: '100%',
                            background: '#ffffff',
                            border: '1px solid #ecf0f1'
                        }}
                    >
                        <Shield sx={{ fontSize: 60, color: '#2c3e50', mb: 2 }} />
                        <Typography 
                            variant="h5" 
                            gutterBottom 
                            sx={{ color: '#2c3e50', fontWeight: 'bold' }}
                        >
                            Secure Platform
                        </Typography>
                        <Typography sx={{ color: '#7f8c8d' }}>
                            Your data is protected with industry-standard security measures
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default HomePage;