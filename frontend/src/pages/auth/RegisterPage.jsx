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
                    align="center" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 'bold',
                        color: 'white',
                        mb: 2,
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                >
                    Join Qanoon Assist
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
                    Create your account to access legal services
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
                            p: 1
                        }}
                    >
                        <ToggleButton 
                            value="citizen"
                            sx={{
                                color: userType === 'citizen' ? '#2c3e50' : '#bdc3c7',
                                background: userType === 'citizen' ? 'white' : 'transparent',
                                '&:hover': {
                                    background: userType === 'citizen' ? 'white' : 'rgba(255,255,255,0.2)'
                                },
                                borderRadius: 1,
                            }}
                        >
                            <Person sx={{ mr: 1 }} />
                            Citizen
                        </ToggleButton>
                        <ToggleButton 
                            value="lawyer"
                            sx={{
                                color: userType === 'lawyer' ? '#2c3e50' : '#bdc3c7',
                                background: userType === 'lawyer' ? 'white' : 'transparent',
                                '&:hover': {
                                    background: userType === 'lawyer' ? 'white' : 'rgba(255,255,255,0.2)'
                                },
                                borderRadius: 1,
                            }}
                        >
                            <Gavel sx={{ mr: 1 }} />
                            Lawyer
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Paper 
                    elevation={4} 
                    sx={{ 
                        p: 4, 
                        background: '#ffffff',
                        border: '1px solid #ecf0f1'
                    }}
                >
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
                        {/* Common Fields */}
                        <Typography 
                            variant="h6" 
                            gutterBottom 
                            sx={{ 
                                color: '#2c3e50', 
                                mb: 3,
                                fontWeight: 'bold',
                                borderBottom: '2px solid #ecf0f1',
                                pb: 1
                            }}
                        >
                            Basic Information
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    size="small"
                                    sx={textFieldStyles}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    size="small"
                                    sx={textFieldStyles}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    size="small"
                                    sx={textFieldStyles}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    size="small"
                                    sx={textFieldStyles}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="+92XXXXXXXXXX"
                                    size="small"
                                    sx={textFieldStyles}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="CNIC"
                                    name="cnic"
                                    value={formData.cnic}
                                    onChange={handleCNICChange}
                                    required
                                    placeholder="XXXXX-XXXXXXX-X"
                                    inputProps={{ maxLength: 15 }}
                                    size="small"
                                    sx={textFieldStyles}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    size="small"
                                    sx={textFieldStyles}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Confirm Password"
                                    name="password2"
                                    type="password"
                                    value={formData.password2}
                                    onChange={handleChange}
                                    required
                                    size="small"
                                    sx={textFieldStyles}
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 4, borderColor: '#ecf0f1' }} />

                        {/* Address Information */}
                        <Typography 
                            variant="h6" 
                            gutterBottom 
                            sx={{ 
                                color: '#2c3e50', 
                                mb: 3,
                                fontWeight: 'bold',
                                borderBottom: '2px solid #ecf0f1',
                                pb: 1
                            }}
                        >
                            Address Information
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    multiline
                                    rows={2}
                                    required
                                    size="small"
                                    sx={textFieldStyles}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    size="small"
                                    sx={textFieldStyles}
                                />
                            </Grid>
                        </Grid>

                        {/* Lawyer-specific Fields */}
                        {userType === 'lawyer' && (
                            <>
                                <Divider sx={{ my: 4, borderColor: '#ecf0f1' }} />

                                <Typography 
                                    variant="h6" 
                                    gutterBottom 
                                    sx={{ 
                                        color: '#2c3e50', 
                                        mb: 3,
                                        fontWeight: 'bold',
                                        borderBottom: '2px solid #ecf0f1',
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
                                                bgcolor: '#2c3e50',
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
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
                                                borderColor: '#bdc3c7',
                                                color: '#2c3e50',
                                                '&:hover': {
                                                    borderColor: '#2c3e50',
                                                    backgroundColor: 'rgba(44, 62, 80, 0.04)'
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
                                        <TextField
                                            fullWidth
                                            label="Bar Council Number"
                                            name="bar_council_number"
                                            value={formData.bar_council_number}
                                            onChange={handleChange}
                                            required
                                            size="small"
                                            sx={textFieldStyles}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Years of Experience"
                                            name="experience_years"
                                            type="number"
                                            value={formData.experience_years}
                                            onChange={handleChange}
                                            required
                                            inputProps={{ min: 0 }}
                                            size="small"
                                            sx={textFieldStyles}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Consultation Fee (PKR)"
                                            name="consultation_fee"
                                            type="number"
                                            value={formData.consultation_fee}
                                            onChange={handleChange}
                                            required
                                            inputProps={{ min: 0 }}
                                            size="small"
                                            sx={textFieldStyles}
                                        />
                                    </Grid>
                                    
                                    {/* Legal Specialties */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Legal Specialties"
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
                                                                    backgroundColor: '#ecf0f1',
                                                                    color: '#2c3e50',
                                                                    border: '1px solid #bdc3c7'
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                ),
                                            }}
                                            helperText="Select your practice areas"
                                            size="small"
                                            sx={textFieldStyles}
                                        >
                                            {specialties.map((specialty) => (
                                                <MenuItem key={specialty.id} value={specialty.id}>
                                                    <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                                                        {specialty.name}
                                                    </Typography>
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    
                                    {/* Bio */}
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Professional Bio"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            multiline
                                            rows={4}
                                            placeholder="Describe your legal expertise, experience, and approach to practice..."
                                            helperText="This comprehensive bio will be displayed on your public lawyer profile"
                                            sx={textFieldStyles}
                                        />
                                    </Grid>
                                </Grid>
                            </>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ 
                                mt: 4, 
                                mb: 2,
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
                            {loading ? 'Creating Account...' : `Register as ${userType === 'citizen' ? 'Citizen' : 'Lawyer'}`}
                        </Button>

                        <Typography 
                            align="center" 
                            sx={{ 
                                mt: 3,
                                color: '#7f8c8d',
                                fontSize: '0.9rem'
                            }}
                        >
                            Already have an account?{' '}
                            <Link 
                                to="/login" 
                                style={{ 
                                    color: '#2c3e50', 
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    borderBottom: '1px solid #2c3e50',
                                    paddingBottom: '1px'
                                }}
                            >
                                Login here
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Paper>
        </Container>
    );
}

// Reusable text field styles
const textFieldStyles = {
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
};

export default RegisterPage;