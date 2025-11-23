import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container, Paper, TextField, Button, Typography,
    Box, Alert, ToggleButtonGroup, ToggleButton,
    MenuItem, Chip, Avatar, Grid, Divider
} from '@mui/material';
import { CloudUpload, Person, Gavel } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { specialtyAPI } from '../../services/api';

function RegisterPage() {
    const [userType, setUserType] = useState('citizen');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        // Citizen fields
        address: '',
        city: '',
        cnic: '',
        // Lawyer fields
        bar_council_number: '',
        experience_years: '',
        consultation_fee: '',
        bio: '',
        specialty_ids: [],
        profile_picture: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [specialties, setSpecialties] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (userType === 'lawyer') {
            fetchSpecialties();
        }
    }, [userType]);

    const fetchSpecialties = async () => {
        try {
            const response = await specialtyAPI.getAll();
            setSpecialties(response.data);
        } catch (error) {
            console.error('Failed to fetch specialties:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }
            
            setFormData({
                ...formData,
                profile_picture: file
            });
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const formatCNIC = (value) => {
        const digits = value.replace(/\D/g, '');
        if (digits.length <= 5) {
            return digits;
        } else if (digits.length <= 12) {
            return `${digits.slice(0, 5)}-${digits.slice(5)}`;
        } else {
            return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
        }
    };

    const handleCNICChange = (e) => {
        const formatted = formatCNIC(e.target.value);
        setFormData({
            ...formData,
            cnic: formatted
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password2) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        const submitData = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (key === 'profile_picture') {
                if (formData[key]) {
                    submitData.append(key, formData[key]);
                }
            } else if (key === 'specialty_ids') {
                formData[key].forEach(id => {
                    submitData.append('specialty_ids', id);
                });
            } else if (formData[key]) {
                submitData.append(key, formData[key]);
            }
        });

        const result = await register(submitData, userType);

        if (result.success) {
            alert(result.data.message);
            navigate('/login');
        } else {
            setError(JSON.stringify(result.error));
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

            {/* Register Modal */}
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
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
                        Create your account
                    </Typography>

                    <Typography
                        align="center"
                        sx={{
                            color: 'rgba(156, 163, 175, 1)',
                            fontSize: '0.8rem',
                            mb: 4
                        }}
                    >
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            style={{
                                color: '#FCD34D',
                                textDecoration: 'none',
                                fontWeight: 500
                            }}
                        >
                            Login here
                        </Link>
                    </Typography>

                    {/* User Type Selection */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <ToggleButtonGroup
                            value={userType}
                            exclusive
                            onChange={(e, value) => value && setUserType(value)}
                            sx={{
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: 1,
                                p: 1,
                                border: '1px solid rgba(75, 85, 99, 1)'
                            }}
                        >
                            <ToggleButton 
                                value="citizen"
                                sx={{
                                    color: userType === 'citizen' ? '#000' : 'rgba(156, 163, 175, 1)',
                                    background: userType === 'citizen' ? '#FCD34D' : 'transparent',
                                    '&:hover': {
                                        background: userType === 'citizen' ? '#FCD34D' : 'rgba(255,255,255,0.1)',
                                        color: userType === 'citizen' ? '#000' : 'white'
                                    },
                                    borderRadius: 1,
                                    border: 'none',
                                    textTransform: 'none',
                                    fontWeight: 500
                                }}
                            >
                                <Person sx={{ mr: 1 }} />
                                Citizen
                            </ToggleButton>
                            <ToggleButton 
                                value="lawyer"
                                sx={{
                                    color: userType === 'lawyer' ? '#000' : 'rgba(156, 163, 175, 1)',
                                    background: userType === 'lawyer' ? '#FCD34D' : 'transparent',
                                    '&:hover': {
                                        background: userType === 'lawyer' ? '#FCD34D' : 'rgba(255,255,255,0.1)',
                                        color: userType === 'lawyer' ? '#000' : 'white'
                                    },
                                    borderRadius: 1,
                                    border: 'none',
                                    textTransform: 'none',
                                    fontWeight: 500
                                }}
                            >
                                <Gavel sx={{ mr: 1 }} />
                                Lawyer
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

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

                    <Box component="form" onSubmit={handleSubmit}>
                        {/* Common Fields */}
                        <Typography 
                            variant="h6" 
                            gutterBottom 
                            sx={{ 
                                color: 'white', 
                                mb: 3,
                                fontWeight: 'bold',
                                borderBottom: '1px solid rgba(75, 85, 99, 1)',
                                pb: 1
                            }}
                        >
                            Basic Information
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
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
                                        First Name
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your first name"
                                        sx={darkTextFieldStyles}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
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
                                        Last Name
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your last name"
                                        sx={darkTextFieldStyles}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
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
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        placeholder="Choose a username"
                                        sx={darkTextFieldStyles}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
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
                                        Email
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your email"
                                        sx={darkTextFieldStyles}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
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
                                        Phone Number
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        placeholder="+92XXXXXXXXXX"
                                        sx={darkTextFieldStyles}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
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
                                        CNIC
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="cnic"
                                        value={formData.cnic}
                                        onChange={handleCNICChange}
                                        required
                                        placeholder="XXXXX-XXXXXXX-X"
                                        inputProps={{ maxLength: 15 }}
                                        sx={darkTextFieldStyles}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
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
                                        Password
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Create a password"
                                        sx={darkTextFieldStyles}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
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
                                        Confirm Password
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="password2"
                                        type="password"
                                        value={formData.password2}
                                        onChange={handleChange}
                                        required
                                        placeholder="Confirm your password"
                                        sx={darkTextFieldStyles}
                                    />
                                </Box>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 4, borderColor: 'rgba(75, 85, 99, 1)' }} />

                        {/* Address Information */}
                        <Typography 
                            variant="h6" 
                            gutterBottom 
                            sx={{ 
                                color: 'white', 
                                mb: 3,
                                fontWeight: 'bold',
                                borderBottom: '1px solid rgba(75, 85, 99, 1)',
                                pb: 1
                            }}
                        >
                            Address Information
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
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
                                        Address
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        multiline
                                        rows={2}
                                        required
                                        placeholder="Enter your complete address"
                                        sx={darkTextFieldStyles}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
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
                                        City
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your city"
                                        sx={darkTextFieldStyles}
                                    />
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Lawyer-specific Fields */}
                        {userType === 'lawyer' && (
                            <>
                                <Divider sx={{ my: 4, borderColor: 'rgba(75, 85, 99, 1)' }} />

                                <Typography 
                                    variant="h6" 
                                    gutterBottom 
                                    sx={{ 
                                        color: 'white', 
                                        mb: 3,
                                        fontWeight: 'bold',
                                        borderBottom: '1px solid rgba(75, 85, 99, 1)',
                                        pb: 1
                                    }}
                                >
                                    Professional Information
                                </Typography>

                                {/* Profile Picture */}
                                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Avatar
                                            src={imagePreview}
                                            sx={{ 
                                                width: 120, 
                                                height: 120, 
                                                mb: 2,
                                                mx: 'auto',
                                                bgcolor: 'rgba(107, 114, 128, 0.3)',
                                                border: '2px solid rgba(107, 114, 128, 0.5)',
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                                            }}
                                        >
                                            {formData.first_name?.[0]}{formData.last_name?.[0]}
                                        </Avatar>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<CloudUpload />}
                                            size="small"
                                            sx={{
                                                borderColor: 'rgba(107, 114, 128, 1)',
                                                color: 'rgba(156, 163, 175, 1)',
                                                '&:hover': {
                                                    borderColor: '#FCD34D',
                                                    color: '#FCD34D',
                                                    backgroundColor: 'rgba(252, 211, 77, 0.1)'
                                                }
                                            }}
                                        >
                                            Upload Profile Picture
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </Button>
                                    </Box>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
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
                                                Bar Council Number
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                name="bar_council_number"
                                                value={formData.bar_council_number}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter bar council number"
                                                sx={darkTextFieldStyles}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
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
                                                Years of Experience
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                name="experience_years"
                                                type="number"
                                                value={formData.experience_years}
                                                onChange={handleChange}
                                                required
                                                inputProps={{ min: 0 }}
                                                placeholder="Enter years of experience"
                                                sx={darkTextFieldStyles}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
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
                                                Consultation Fee (PKR)
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                name="consultation_fee"
                                                type="number"
                                                value={formData.consultation_fee}
                                                onChange={handleChange}
                                                required
                                                inputProps={{ min: 0 }}
                                                placeholder="Enter consultation fee"
                                                sx={darkTextFieldStyles}
                                            />
                                        </Box>
                                    </Grid>
                                    
                                    {/* Legal Specialties */}
                                    <Grid item xs={12} sm={6}>
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
                                                Legal Specialties
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                select
                                                name="specialty_ids"
                                                value={formData.specialty_ids}
                                                onChange={(e) => setFormData({...formData, specialty_ids: e.target.value})}
                                                SelectProps={{
                                                    multiple: true,
                                                    renderValue: (selected) => (
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {selected.map((value) => (
                                                                <Chip 
                                                                    key={value} 
                                                                    label={specialties.find(s => s.id === value)?.name}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: 'rgba(75, 85, 99, 0.5)',
                                                                        color: 'white',
                                                                        border: '1px solid rgba(107, 114, 128, 1)'
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>
                                                    ),
                                                }}
                                                sx={darkTextFieldStyles}
                                            >
                                                {specialties.map((specialty) => (
                                                    <MenuItem key={specialty.id} value={specialty.id}>
                                                        <Typography variant="body2" sx={{ color: 'black' }}>
                                                            {specialty.name}
                                                        </Typography>
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Box>
                                    </Grid>
                                    
                                    {/* Bio */}
                                    <Grid item xs={12}>
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
                                                Professional Bio
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleChange}
                                                multiline
                                                rows={4}
                                                placeholder="Describe your legal expertise, experience, and approach to practice..."
                                                sx={darkTextFieldStyles}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="outlined"
                            sx={{
                                mt: 4,
                                mb: 2,
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
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : `Register as ${userType === 'citizen' ? 'Citizen' : 'Lawyer'}`}
                        </Button>

                        <Typography
                            align="center"
                            sx={{
                                color: 'rgba(107, 114, 128, 1)',
                                fontSize: '0.75rem',
                                mt: 2
                            }}
                        >
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

// Dark theme text field styles
const darkTextFieldStyles = {
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
    },
    '& .MuiInputLabel-root': {
        color: 'rgba(156, 163, 175, 1)',
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: '#FCD34D',
    },
};

export default RegisterPage;