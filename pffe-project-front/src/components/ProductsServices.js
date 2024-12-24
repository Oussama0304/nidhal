import React from 'react';
import { Box, Grid, Typography, Card, CardContent, Container } from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import PropaneIcon from '@mui/icons-material/Propane';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';
import BuildIcon from '@mui/icons-material/Build';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const services = [
  {
    title: 'Carburants',
    description: "AGIL met à la disposition de tous les usagers un choix de carburants alliant performance et qualité.",
    icon: LocalGasStationIcon,
    color: '#ff5722'
  },
  {
    title: 'Gaz',
    description: "Le gaz butane AGIL est l'énergie idéale pour vos besoins domestiques et professionnels au quotidien.",
    icon: PropaneIcon,
    color: '#ff7043'
  },
  {
    title: 'Lubrifiants',
    description: "AGIL met à votre disposition une gamme de lubrifiants dédiés à l'entretien et à la performance de votre moteur.",
    icon: OilBarrelIcon,
    color: '#ff8a65'
  },
  {
    title: 'Services en station',
    description: "Du nettoyage et lavage de votre véhicule aux ateliers de réparation, AGIL met tous ses services à votre disposition.",
    icon: BuildIcon,
    color: '#ff9e80'
  },
  {
    title: 'Carte Liberté',
    description: "AGIL vous propose la carte Liberté permettant d'effectuer tous vos achats dans les espaces AGIL.",
    icon: CreditCardIcon,
    color: '#ffab91'
  }
];

const ProductsServices = () => {
  return (
    <Box
      sx={{
        py: 8,
        backgroundColor: '#f5f5f5',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Cercles décoratifs */}
      <Box
        sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 87, 34, 0.1)',
          top: '-100px',
          right: '-100px',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          bottom: '-50px',
          left: '-50px',
        }}
      />

      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          align="center"
          sx={{
            mb: 6,
            fontWeight: 'bold',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '4px',
              backgroundColor: 'primary.main',
            }
          }}
        >
          Nos produits et services
        </Typography>

        <Grid container spacing={4}>
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={service.title}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                    },
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: service.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 3,
                    }}
                  >
                    <Icon sx={{ color: 'white', fontSize: '30px' }} />
                  </Box>

                  <CardContent sx={{ pt: 5 }}>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="h3"
                      align="center"
                      sx={{ fontWeight: 'bold', mb: 2 }}
                    >
                      {service.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                    >
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductsServices;
