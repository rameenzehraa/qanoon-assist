import React from 'react';
import { Container, Typography, Button, Box, Grid, Card, CardContent, Link, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Gavel, People, Shield, Search, Security, Support, MenuBook, TrendingUp, Facebook, Twitter, LinkedIn, Email, CheckCircle, Bolt, ArrowRight } from '@mui/icons-material';

function HomePage() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: '#000',
                backgroundImage: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
                color: 'white',
                overflow: 'hidden'
            }}
        >
            {/* Hero Section - Enhanced */}
            <Box
                sx={{
                    position: 'relative',
                    minHeight: '90vh',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundImage: 'url(https://i.pinimg.com/736x/d5/ff/e8/d5ffe8067f52a3cd5ac787a35bd7a826.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(3px)'
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '200px',
                        background: 'linear-gradient(to top, #0c0c0c, transparent)',
                        pointerEvents: 'none'
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        {/* Badge */}
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                background: 'rgba(252, 211, 77, 0.1)',
                                border: '1px solid rgba(252, 211, 77, 0.3)',
                                borderRadius: 50,
                                px: 2.5,
                                py: 1,
                                mb: 4,
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <Bolt sx={{ color: '#FCD34D', fontSize: 18 }} />
                            <Typography sx={{ color: '#FCD34D', fontSize: '0.85rem', fontWeight: 600 }}>
                                Pakistan's #1 Legal Platform
                            </Typography>
                        </Box>

                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: 900,
                                fontSize: { xs: '2.8rem', md: '4.5rem' },
                                color: 'white',
                                mb: 3,
                                textShadow: '0 4px 20px rgba(0,0,0,0.4)',
                                lineHeight: 1.2,
                                background: 'linear-gradient(135deg, #fff 0%, #FCD34D 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            Qanoon Assist
                        </Typography>

                        <Typography
                            variant="h4"
                            sx={{
                                color: '#FCD34D',
                                fontWeight: 400,
                                mb: 4,
                                fontSize: { xs: '1.3rem', md: '1.8rem' }
                            }}
                        >
                            Revolutionizing Legal Access in Pakistan
                        </Typography>

                        <Typography
                            variant="h6"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontWeight: 300,
                                mb: 8,
                                maxWidth: '700px',
                                mx: 'auto',
                                lineHeight: 1.8,
                                fontSize: { xs: '1rem', md: '1.2rem' }
                            }}
                        >
                            Connect with verified legal experts, manage your cases digitally,
                            and access comprehensive legal resources - all in one secure platform.
                        </Typography>

                        {/* CTA Buttons */}
                        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
                            <Button
                                variant="contained"
                                size="large"
                                sx={{
                                    px: 4.5,
                                    py: 1.8,
                                    background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                                    color: '#000',
                                    fontWeight: 700,
                                    fontSize: '1.05rem',
                                    borderRadius: 2,
                                    boxShadow: '0 8px 24px rgba(252, 211, 77, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0 12px 32px rgba(245, 158, 11, 0.4)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => navigate('/lawyers')}
                                endIcon={<Search />}
                            >
                                Find Lawyers
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                sx={{
                                    px: 4.5,
                                    py: 1.8,
                                    borderColor: '#FCD34D',
                                    color: '#FCD34D',
                                    fontWeight: 600,
                                    fontSize: '1.05rem',
                                    borderRadius: 2,
                                    border: '2px solid #FCD34D',
                                    '&:hover': {
                                        borderColor: '#F59E0B',
                                        backgroundColor: 'rgba(252, 211, 77, 0.15)',
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0 8px 24px rgba(252, 211, 77, 0.2)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => navigate('/register')}
                                endIcon={<ArrowRight />}
                            >
                                Get Started Free
                            </Button>
                        </Box>

                        {/* Trust Badges */}
                        <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                            {[
                                { icon: '✓', text: '500+ Verified Lawyers' },
                                { icon: '⚡', text: '15 Min Response' },
                                { icon: '🔒', text: '100% Secure' }
                            ].map((badge, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ fontSize: '1.2rem' }}>{badge.icon}</Typography>
                                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', fontWeight: 500 }}>
                                        {badge.text}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Stats Section - Enhanced Grid */}
            <Container maxWidth="lg" sx={{ py: 10 }}>
                <Grid container spacing={3} sx={{ mb: 12 }}>
                    {[
                        { number: '500+', label: 'Verified Lawyers', icon: <Gavel />, gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' },
                        { number: '10K+', label: 'Cases Handled', icon: <TrendingUp />, gradient: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)' },
                        { number: '95%', label: 'Client Satisfaction', icon: <People />, gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' },
                        { number: '24/7', label: 'Platform Access', icon: <Shield />, gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }
                    ].map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card
                                sx={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 3,
                                    p: 3,
                                    textAlign: 'center',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '3px',
                                        background: stat.gradient
                                    },
                                    '&:hover': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                        background: 'rgba(255, 255, 255, 0.05)'
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        background: stat.gradient,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        fontSize: '2.8rem',
                                        mb: 2
                                    }}
                                >
                                    {stat.icon}
                                </Box>
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 800,
                                        color: 'white',
                                        mb: 1,
                                        fontSize: { xs: '2.2rem', md: '2.8rem' }
                                    }}
                                >
                                    {stat.number}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        fontWeight: 500
                                    }}
                                >
                                    {stat.label}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Features Section - Enhanced */}
                <Box sx={{ mb: 10 }}>
                    <Box sx={{ textAlign: 'center', mb: 10 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                mb: 2,
                                color: 'white',
                                fontSize: { xs: '2rem', md: '3.2rem' },
                                background: 'linear-gradient(135deg, #FCD34D 0%, #fff 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            Why Choose Qanoon Assist?
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                mb: 0,
                                maxWidth: '700px',
                                mx: 'auto',
                                fontSize: { xs: '0.95rem', md: '1.1rem' },
                                lineHeight: 1.7
                            }}
                        >
                            Experience seamless legal solutions with Pakistan's most trusted digital legal platform
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {[
                            {
                                icon: <Gavel sx={{ fontSize: 50 }} />,
                                title: 'Verified Legal Experts',
                                description: 'All lawyers undergo rigorous verification to ensure credibility and expertise.',
                                gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
                            },
                            {
                                icon: <Security sx={{ fontSize: 50 }} />,
                                title: 'Secure Case Management',
                                description: 'End-to-end encrypted platform for confidential case discussions.',
                                gradient: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)'
                            },
                            {
                                icon: <MenuBook sx={{ fontSize: 50 }} />,
                                title: 'Legal Knowledge Base',
                                description: 'Access comprehensive database of Pakistani laws and precedents.',
                                gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)'
                            },
                            {
                                icon: <Support sx={{ fontSize: 50 }} />,
                                title: '24/7 Customer Support',
                                description: 'Round-the-clock assistance for any platform-related queries.',
                                gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)'
                            },
                            {
                                icon: <TrendingUp sx={{ fontSize: 50 }} />,
                                title: 'Real-time Case Tracking',
                                description: 'Monitor your case progress with automated updates.',
                                gradient: 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)'
                            },
                            {
                                icon: <People sx={{ fontSize: 50 }} />,
                                title: 'Legal Community',
                                description: 'Connect with legal professionals in our dedicated community.',
                                gradient: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)'
                            }
                        ].map((feature, index) => (
                            <Grid item xs={12} sm={6} lg={4} key={index}>
                                <Card
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: 3,
                                        p: 3.5,
                                        height: '100%',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '3px',
                                            background: feature.gradient
                                        },
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                                            background: 'rgba(255, 255, 255, 0.06)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 0 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: 80,
                                                height: 80,
                                                margin: '0 auto 20px auto',
                                                borderRadius: '50%',
                                                background: 'rgba(255, 255, 255, 0.08)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                                position: 'relative',
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: -2,
                                                    left: -2,
                                                    right: -2,
                                                    bottom: -2,
                                                    borderRadius: '50%',
                                                    background: feature.gradient,
                                                    zIndex: -1,
                                                    opacity: 0.2,
                                                }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    background: feature.gradient,
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    backgroundClip: 'text',
                                                }}
                                            >
                                                {feature.icon}
                                            </Box>
                                        </Box>

                                        <Typography
                                            variant="h5"
                                            sx={{
                                                color: 'white',
                                                fontWeight: 700,
                                                mb: 2,
                                                fontSize: '1.3rem',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {feature.title}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.8)',
                                                lineHeight: 1.7,
                                                fontSize: '0.95rem',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Additional Features Row */}
                    <Grid container spacing={3} sx={{ mt: 4 }}>
                        {[
                            { number: '100%', title: 'Data Privacy', desc: 'Your confidentiality is our priority', color: '#FCD34D', bg: 'rgba(252, 211, 77, 0.1)', border: 'rgba(252, 211, 77, 0.3)' },
                            { number: '50+', title: 'Legal Specializations', desc: 'Coverage of all legal areas', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)' },
                            { number: '15min', title: 'Avg Response Time', desc: 'Quick connections with experts', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)' }
                        ].map((item, i) => (
                            <Grid item xs={12} md={4} key={i}>
                                <Card
                                    sx={{
                                        textAlign: 'center',
                                        p: 4,
                                        background: item.bg,
                                        border: `1px solid ${item.border}`,
                                        borderRadius: 3,
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: `0 10px 30px ${item.color}30`
                                        }
                                    }}
                                >
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            color: item.color,
                                            fontWeight: 800,
                                            mb: 1
                                        }}
                                    >
                                        {item.number}
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: 'white',
                                            fontWeight: 600,
                                            mb: 1
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {item.desc}
                                    </Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>

            {/* CTA Section - Enhanced */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, rgba(252, 211, 77, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
                    border: '1px solid rgba(252, 211, 77, 0.2)',
                    py: 10,
                    my: 8,
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(10px)',
                    mx: 2
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                mb: 3,
                                color: 'white',
                                fontSize: { xs: '2rem', md: '2.8rem' }
                            }}
                        >
                            Ready to Get Legal Assistance?
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                mb: 5,
                                maxWidth: '600px',
                                mx: 'auto',
                                fontSize: '1.05rem'
                            }}
                        >
                            Join thousands of Pakistanis who trust Qanoon Assist for their legal needs
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                px: 6,
                                py: 1.8,
                                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                                color: '#000',
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                borderRadius: 2,
                                boxShadow: '0 8px 24px rgba(252, 211, 77, 0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 12px 32px rgba(245, 158, 11, 0.5)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                            onClick={() => navigate('/register')}
                            endIcon={<ArrowRight />}
                        >
                            Start Your Journey
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    background: 'rgba(0, 0, 0, 0.98)',
                    borderTop: '1px solid rgba(252, 211, 77, 0.2)',
                    py: 8,
                    mt: 8
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="flex-start">
                        {/* Company Info */}
                        <Grid item xs={12} md={4}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    mb: 3
                                }}
                            >
                                Qanoon Assist
                            </Typography>
                            <Typography
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    mb: 3,
                                    lineHeight: 1.8,
                                    fontSize: '0.95rem'
                                }}
                            >
                                Pakistan's premier digital legal platform connecting individuals and businesses
                                with verified legal professionals. Empowering justice through technology.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                {[
                                    { icon: <Facebook />, label: 'Facebook' },
                                    { icon: <Twitter />, label: 'Twitter' },
                                    { icon: <LinkedIn />, label: 'LinkedIn' },
                                    { icon: <Email />, label: 'Email' }
                                ].map((social, index) => (
                                    <IconButton
                                        key={index}
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            backgroundColor: 'rgba(252, 211, 77, 0.1)',
                                            '&:hover': {
                                                color: '#FCD34D',
                                                backgroundColor: 'rgba(252, 211, 77, 0.2)',
                                                transform: 'translateY(-3px)'
                                            },
                                            transition: 'all 0.3s ease',
                                            width: 42,
                                            height: 42
                                        }}
                                        aria-label={social.label}
                                    >
                                        {social.icon}
                                    </IconButton>
                                ))}
                            </Box>
                        </Grid>

                        {/* Quick Links */}
                        <Grid item xs={12} sm={6} md={2}>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#FCD34D',
                                    mb: 3,
                                    fontWeight: 700,
                                    fontSize: '1rem'
                                }}
                            >
                                Services
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {['Find Lawyers', 'Legal Consultation', 'Case Management', 'Document Review'].map((link) => (
                                    <Link
                                        key={link}
                                        href="#"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            '&:hover': {
                                                color: '#FCD34D',
                                                transform: 'translateX(4px)'
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {link}
                                    </Link>
                                ))}
                            </Box>
                        </Grid>

                        {/* Resources */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#FCD34D',
                                    mb: 3,
                                    fontWeight: 700,
                                    fontSize: '1rem'
                                }}
                            >
                                Resources
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {['Legal Knowledge Base', 'Case Studies', 'Industry Insights', 'Legal Templates', 'Practice Areas'].map((resource) => (
                                    <Link
                                        key={resource}
                                        href="#"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            '&:hover': {
                                                color: '#FCD34D',
                                                transform: 'translateX(4px)'
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {resource}
                                    </Link>
                                ))}
                            </Box>
                        </Grid>

                        {/* Contact */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#FCD34D',
                                    mb: 3,
                                    fontWeight: 700,
                                    fontSize: '1rem'
                                }}
                            >
                                Contact Us
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <Typography sx={{ color: '#FCD34D', minWidth: 24 }}>📞</Typography>
                                    <Box>
                                        <Typography sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 500 }}>
                                            +92 300 123 4567
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                                            Mon-Fri, 9:00 AM - 6:00 PM
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <Typography sx={{ color: '#FCD34D', minWidth: 24 }}>✉️</Typography>
                                    <Box>
                                        <Typography sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 500 }}>
                                            support@qanoonassist.com
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                                            General Inquiries
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <Typography sx={{ color: '#FCD34D', minWidth: 24 }}>📍</Typography>
                                    <Box>
                                        <Typography sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 500 }}>
                                            Karachi, Pakistan
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                                            Serving Nationwide
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Bottom Bar */}
                    <Box
                        sx={{
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            mt: 6,
                            pt: 4,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 2
                        }}
                    >
                        <Typography
                            sx={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.9rem'
                            }}
                        >
                            © 2025 Qanoon Assist. All rights reserved.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            <Link
                                href="#"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    '&:hover': {
                                        color: '#FCD34D'
                                    },
                                    transition: 'color 0.2s ease'
                                }}
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="#"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    '&:hover': {
                                        color: '#FCD34D'
                                    },
                                    transition: 'color 0.2s ease'
                                }}
                            >
                                Terms of Service
                            </Link>
                            <Link
                                href="#"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    '&:hover': {
                                        color: '#FCD34D'
                                    },
                                    transition: 'color 0.2s ease'
                                }}
                            >
                                Cookie Policy
                            </Link>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}

export default HomePage;