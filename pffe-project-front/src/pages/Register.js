import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  Grid,
  MenuItem,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Slide,
  Fade,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAddOutlined } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    mot_de_passe: '',
    matricule: '',
    roles: 'COMMERCIAL',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const roles = [
    'COMMERCIAL',
    'GERANT',
    'DEPOT',
    'ELECTROMECANIQUE',
    'TECHNIQUE',
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.nom || !formData.prenom) {
      setError('Le nom et le prénom sont requis');
      return false;
    }
    if (!formData.email) {
      setError('L\'adresse email est requise');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('L\'adresse email n\'est pas valide');
      return false;
    }
    if (!formData.telephone) {
      setError('Le numéro de téléphone est requis');
      return false;
    }
    if (!/^\d{8}$/.test(formData.telephone)) {
      setError('Le numéro de téléphone doit contenir 8 chiffres');
      return false;
    }
    if (!formData.matricule) {
      setError('Le matricule est requis');
      return false;
    }
    if (!formData.mot_de_passe) {
      setError('Le mot de passe est requis');
      return false;
    }
    if (formData.mot_de_passe.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(API_ENDPOINTS.REGISTER, formData);
      console.log('Registration successful:', response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#FFD700',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1a237e',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#1a237e',
    },
    mb: 2,
  };

  return (
    <Fade in timeout={800}>
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a237e 0%, #534bae 100%)',
            padding: '2rem',
            borderRadius: '10px',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at center, rgba(255,215,0,0.1) 0%, rgba(26,35,126,0.1) 100%)',
              animation: 'pulse 3s infinite',
            },
            '@keyframes pulse': {
              '0%': { opacity: 0.6 },
              '50%': { opacity: 0.8 },
              '100%': { opacity: 0.6 },
            },
          }}
        >
          <Slide direction="down" in timeout={400}>
            <Paper
              elevation={6}
              sx={{
                padding: { xs: 2, sm: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                borderRadius: '15px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #FFD700, #FFA000)',
                },
              }}
            >
              <Box
                component="img"
                src="/assets/agil-logo.png"
                alt="AGIL Logo"
                sx={{
                  height: '80px',
                  marginBottom: '1rem',
                  animation: 'fadeIn 1s ease-out',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(-20px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              />
              <Typography 
                component="h1" 
                variant="h4"
                sx={{
                  color: '#1a237e',
                  fontWeight: 600,
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #FFD700, #FFA000)',
                    borderRadius: '2px',
                  },
                }}
              >
                Inscription
              </Typography>

              {error && (
                <Slide direction="down" in>
                  <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                    {error}
                  </Alert>
                </Slide>
              )}

              {success && (
                <Slide direction="down" in>
                  <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                    Inscription réussie ! Redirection vers la page de connexion...
                  </Alert>
                </Slide>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="nom"
                      label="Nom"
                      value={formData.nom}
                      onChange={handleChange}
                      sx={textFieldStyle}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="prenom"
                      label="Prénom"
                      value={formData.prenom}
                      onChange={handleChange}
                      sx={textFieldStyle}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="email"
                      label="Adresse email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      sx={textFieldStyle}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="telephone"
                      label="Téléphone"
                      value={formData.telephone}
                      onChange={handleChange}
                      sx={textFieldStyle}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="matricule"
                      label="Matricule"
                      value={formData.matricule}
                      onChange={handleChange}
                      sx={textFieldStyle}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="mot_de_passe"
                      label="Mot de passe"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.mot_de_passe}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={textFieldStyle}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      required
                      fullWidth
                      name="roles"
                      label="Rôle"
                      value={formData.roles}
                      onChange={handleChange}
                      sx={textFieldStyle}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  startIcon={!loading && <PersonAddOutlined />}
                  sx={{
                    mt: 3,
                    mb: 2,
                    background: 'linear-gradient(45deg, #FFD700 30%, #FFA000 90%)',
                    color: '#1a237e',
                    fontWeight: 600,
                    padding: '0.8rem',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FFA000 30%, #FFD700 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
                    },
                    '&:disabled': {
                      background: '#ccc',
                      color: '#666',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: '#1a237e' }} />
                  ) : (
                    'S\'inscrire'
                  )}
                </Button>

                <Box sx={{ 
                  textAlign: 'center',
                  '& a': {
                    color: '#1a237e',
                    textDecoration: 'none',
                    fontWeight: 500,
                    display: 'inline-block',
                    position: 'relative',
                    '&:hover': {
                      color: '#FFD700',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '2px',
                      bottom: '-4px',
                      left: 0,
                      background: 'linear-gradient(90deg, #FFD700, #FFA000)',
                      transform: 'scaleX(0)',
                      transformOrigin: 'right',
                      transition: 'transform 0.3s ease',
                    },
                    '&:hover::after': {
                      transform: 'scaleX(1)',
                      transformOrigin: 'left',
                    },
                  }
                }}>
                  <Link href="/login" variant="body2">
                    {'Vous avez déjà un compte ? Se connecter'}
                  </Link>
                </Box>
              </Box>
            </Paper>
          </Slide>
        </Box>
      </Container>
    </Fade>
  );
};

export default Register;
