import React, { useState, useRef } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Slide,
  Fade,
} from '@mui/material';
import { Visibility, VisibilityOff, LoginOutlined, SecurityOutlined } from '@mui/icons-material';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import { securityService } from '../services/securityService';

const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Clé de test, à remplacer en production
const MAX_LOGIN_ATTEMPTS = 3;
const BLOCK_DURATION_MINUTES = 30;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null);
  const recaptchaRef = useRef(null);

  const clientId = securityService.getClientIdentifier();
  const isBlocked = securityService.isBlocked(clientId);
  const remainingBlockTime = securityService.getRemainingBlockTime(clientId);
  const showCaptcha = securityService.shouldShowCaptcha(clientId);
  const attempts = securityService.getLoginAttempts(clientId);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (isBlocked) {
      setError(`Compte temporairement bloqué. Réessayez dans ${remainingBlockTime} minutes.`);
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
    if (!formData.mot_de_passe) {
      setError('Le mot de passe est requis');
      return false;
    }
    if (formData.mot_de_passe.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (showCaptcha && !captchaValue) {
      setError('Veuillez valider le CAPTCHA');
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
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        ...formData,
        captcha: captchaValue,
      });
      
      const { token, user } = response.data;
      
      securityService.recordLoginAttempt(clientId, true);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);
      
      setTimeout(() => {
        window.location.href = user.role === 'ADMIN' ? '/admin' : '/dashboard';
      }, 1500);
      
    } catch (err) {
      console.error('Login error:', err);
      const attempts = securityService.recordLoginAttempt(clientId, false);
      
      let errorMessage = 'Erreur de connexion. ';
      if (attempts === MAX_LOGIN_ATTEMPTS - 1) {
        errorMessage += 'Attention : dernière tentative avant blocage temporaire.';
      } else if (attempts >= MAX_LOGIN_ATTEMPTS) {
        errorMessage += `Compte bloqué. Réessayez dans ${BLOCK_DURATION_MINUTES} minutes.`;
      } else {
        errorMessage += `${MAX_LOGIN_ATTEMPTS - attempts} tentatives restantes.`;
      }
      
      setError(errorMessage);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setCaptchaValue(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fade in timeout={800}>
      <Container component="main" maxWidth="xs">
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
                Connexion
              </Typography>

              {error && (
                <Slide direction="down" in>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      width: '100%', 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      '& .MuiAlert-icon': {
                        fontSize: '2rem'
                      }
                    }}
                    icon={<SecurityOutlined fontSize="inherit" />}
                  >
                    {error}
                  </Alert>
                </Slide>
              )}

              {showCaptcha && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={(value) => setCaptchaValue(value)}
                  />
                </Box>
              )}

              {attempts > 0 && !isBlocked && (
                <Typography 
                  variant="body2" 
                  color="warning.main"
                  sx={{ 
                    mb: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <SecurityOutlined fontSize="small" />
                  {`Tentatives de connexion : ${attempts}/${MAX_LOGIN_ATTEMPTS}`}
                </Typography>
              )}

              <Box 
                component="form" 
                onSubmit={handleSubmit} 
                sx={{ 
                  mt: 1,
                  width: '100%',
                }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Adresse email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  sx={{
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
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="mot_de_passe"
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  id="mot_de_passe"
                  autoComplete="current-password"
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
                  sx={{
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
                    mb: 3,
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  startIcon={!loading && <LoginOutlined />}
                  sx={{
                    mt: 2,
                    mb: 3,
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
                    'Se connecter'
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
                  <Link href="/register" variant="body2">
                    {"Vous n'avez pas de compte ? S'inscrire"}
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

export default Login;
