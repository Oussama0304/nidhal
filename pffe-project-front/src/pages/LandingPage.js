import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Fab,
  Drawer,
  TextField,
  List,
  ListItem,
  ListItemText,
  Fade,
  Grow,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  KeyboardArrowDown as ScrollDownIcon
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import ProductsServices from '../components/ProductsServices';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';

const LandingPage = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Bonjour! Comment puis-je vous aider?", sender: 'bot' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showScrollDown, setShowScrollDown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollDown(window.scrollY < 100);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChatToggle = () => {
    setChatOpen(!chatOpen);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: 'user' }]);
      // Simulate bot response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: "Je vais transmettre votre message à notre équipe.",
          sender: 'bot'
        }]);
      }, 1000);
      setNewMessage('');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh' }}>
        <Navbar />
        
        {/* Hero Section */}
        <Box
          id="hero-section"
          sx={{
            height: '100vh',
            background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("/assets/platform-image.jpg")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            color: 'white',
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 'bold',
                mb: 3,
                animation: 'fadeInDown 1s ease-out',
                '@keyframes fadeInDown': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(-30px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              Bienvenue chez AGIL
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                maxWidth: '600px',
                animation: 'fadeInUp 1s ease-out 0.5s',
                animationFillMode: 'both',
                '@keyframes fadeInUp': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(30px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              Votre partenaire de confiance pour la gestion des stations-service
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={scrollToAbout}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                animation: 'fadeIn 1s ease-out 1s',
                animationFillMode: 'both',
                '@keyframes fadeIn': {
                  from: {
                    opacity: 0,
                  },
                  to: {
                    opacity: 1,
                  },
                },
              }}
            >
              Découvrir nos services
            </Button>
          </Container>
        </Box>

        {/* Products & Services Section */}
        <Box id="services-section">
          <ProductsServices />
        </Box>

        {/* About Section */}
        <Box id="about-section">
          <Container maxWidth="lg" sx={{ py: 8 }}>
            <Fade in={true} timeout={1000}>
              <Typography 
                variant="h3" 
                component="h2" 
                textAlign="center" 
                gutterBottom
                sx={{ 
                  color: '#000000',
                  mb: 6,
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                À Propos
              </Typography>
            </Fade>
            <Grid container spacing={4}>
              {[
                {
                  title: 'Gestion Efficace',
                  description: 'Optimisez la gestion de vos stations avec nos outils modernes et intuitifs.',
                  delay: 500
                },
                {
                  title: 'Suivi en Temps Réel',
                  description: 'Surveillez vos opérations en temps réel et prenez des décisions éclairées.',
                  delay: 1000
                },
                {
                  title: 'Support 24/7',
                  description: 'Bénéficiez d\'un support client disponible 24/7 pour répondre à vos besoins.',
                  delay: 1500
                }
              ].map((item, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Grow in={true} timeout={1000 + item.delay}>
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        p: 3, 
                        height: '100%', 
                        borderTop: '4px solid #FFD700',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Typography variant="h5" gutterBottom sx={{ color: '#000000' }}>
                        {item.title}
                      </Typography>
                      <Typography>
                        {item.description}
                      </Typography>
                    </Paper>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Scroll Down Indicator */}
        <Fade in={showScrollDown} timeout={1000}>
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              cursor: 'pointer',
              zIndex: 1,
            }}
            onClick={scrollToAbout}
          >
            <ScrollDownIcon 
              sx={{ 
                color: theme.palette.primary.main,
                fontSize: '40px',
                animation: 'bounce 2s infinite',
                '@keyframes bounce': {
                  '0%, 20%, 50%, 80%, 100%': {
                    transform: 'translateY(0)',
                  },
                  '40%': {
                    transform: 'translateY(-20px)',
                  },
                  '60%': {
                    transform: 'translateY(-10px)',
                  },
                },
              }}
            />
          </Box>
        </Fade>

        {/* Chatbot */}
        <Fab
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            backgroundColor: '#FFD700',
            color: '#000000',
            '&:hover': {
              backgroundColor: '#FFC700',
            }
          }}
          aria-label="chat"
          onClick={handleChatToggle}
        >
          <ChatIcon />
        </Fab>

        <Drawer
          anchor="right"
          open={chatOpen}
          onClose={handleChatToggle}
        >
          <Box sx={{ width: 300, p: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 2,
              borderBottom: '2px solid #FFD700',
              pb: 1
            }}>
              <Typography variant="h6">Chat Support</Typography>
              <IconButton onClick={handleChatToggle}>
                <CloseIcon />
              </IconButton>
            </Box>
            <List sx={{ height: '60vh', overflow: 'auto' }}>
              {messages.map((message, index) => (
                <ListItem key={index} sx={{ justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <Paper
                    sx={{
                      p: 1,
                      backgroundColor: message.sender === 'user' ? '#FFD700' : '#f5f5f5',
                      color: message.sender === 'user' ? '#000000' : 'inherit',
                      maxWidth: '80%'
                    }}
                  >
                    <ListItemText primary={message.text} />
                  </Paper>
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', mt: 2 }}>
              <TextField
                fullWidth
                size="small"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#FFD700',
                    },
                  },
                }}
              />
              <IconButton 
                color="primary" 
                onClick={handleSendMessage}
                sx={{ color: '#FFD700' }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Drawer>

        {/* Footer */}
        <Box
          id="contact-section"
          component="footer"
          sx={{
            bgcolor: '#000000',
            color: 'white',
            py: 6,
            mt: 8
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <img 
                    src="/assets/agil-logo.png" 
                    alt="AGIL Logo" 
                    style={{ 
                      height: '40px',
                      marginRight: '8px'
                    }} 
                  />
                </Box>
                <Typography variant="body2">
                  Leader dans la gestion des stations-service en Tunisie.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom sx={{ color: '#FFD700' }}>
                  Contact
                </Typography>
                <Typography variant="body2">
                  Email: contact@agil.com.tn<br />
                  Tél: +216 71 123 456<br />
                  Adresse: Tunis, Tunisie
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom sx={{ color: '#FFD700' }}>
                  Liens Utiles
                </Typography>
                <Typography variant="body2" component="div">
                  <Box component="a" href="#" sx={{ color: 'white', display: 'block', mb: 1, textDecoration: 'none', '&:hover': { color: '#FFD700' } }}>
                    Aide
                  </Box>
                  <Box component="a" href="#" sx={{ color: 'white', display: 'block', mb: 1, textDecoration: 'none', '&:hover': { color: '#FFD700' } }}>
                    Conditions d'utilisation
                  </Box>
                  <Box component="a" href="#" sx={{ color: 'white', display: 'block', textDecoration: 'none', '&:hover': { color: '#FFD700' } }}>
                    Politique de confidentialité
                  </Box>
                </Typography>
              </Grid>
            </Grid>
            <Typography variant="body2" sx={{ mt: 4, textAlign: 'center', color: '#FFD700' }}>
              2024 AGIL. Tous droits réservés.
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default LandingPage;
