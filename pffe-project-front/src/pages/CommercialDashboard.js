import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ExitToApp as ExitToAppIcon,
  Assignment as AssignmentIcon,
  Report as ReportIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  LocalShipping,
  LocationOn,
  AccessTime,
  Check,
  Warning,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';

const CommercialDashboard = () => {
  const navigate = useNavigate();
  const [commandes, setCommandes] = useState([]);
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [socket, setSocket] = useState(null);
  const [reclamationDetailsOpen, setReclamationDetailsOpen] = useState(false);
  const [selectedReclamation, setSelectedReclamation] = useState(null);

  const statusColors = {
    'EN_ATTENTE': 'warning',
    'VALIDEE': 'success',
    'EN_PREPARATION': 'info',
    'EN_LIVRAISON': 'warning',
    'LIVREE': 'success',
    'REJETEE': 'error',
  };

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    newSocket.on('nouvelle-commande', (commande) => {
      console.log('Nouvelle commande reçue:', commande);
      setNotification({
        message: `Nouvelle commande #${commande.idCommande} reçue !`,
        severity: 'info'
      });
      fetchCommandes();
    });

    fetchReclamations();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const fetchReclamations = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('http://localhost:3000/api/reclamations', config);
      const reclamationsCommerciales = response.data.filter(rec => rec.type === 'COMMERCIALE');
      setReclamations(reclamationsCommerciales);
    } catch (error) {
      console.error('Erreur lors de la récupération des réclamations:', error);
      setNotification({
        message: 'Erreur lors de la récupération des réclamations',
        severity: 'error'
      });
    }
  };

  const handleReclamationClick = (reclamation) => {
    setSelectedReclamation(reclamation);
    setReclamationDetailsOpen(true);
  };

  const fetchCommandes = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('http://localhost:3000/api/commandes', config);
      setCommandes(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      setNotification({
        message: 'Erreur lors du chargement des commandes',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const commandesResponse = await axios.get(
          'http://localhost:3000/api/commandes',
          config
        );
        setCommandes(commandesResponse.data);

        const reclamationsResponse = await axios.get(
          'http://localhost:3000/api/reclamations',
          config
        );
        setReclamations(reclamationsResponse.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setNotification({
          message: 'Erreur lors du chargement des données',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterClick = (event) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    handleFilterClose();
  };

  const handleSortChange = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleCommandeClick = (commande) => {
    setSelectedCommande(commande);
    setDetailsOpen(true);
  };

  const handleUpdateStatus = async (commandeId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/commandes/${commandeId}/status`,
        { etat: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCommandes(prev => prev.map(cmd => 
        cmd.idCommande === commandeId ? { ...cmd, etat: newStatus } : cmd
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleUpdateReclamationStatus = async (reclamationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/reclamations/${reclamationId}/status`,
        { etat: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReclamations(prev => prev.map(rec => 
        rec.idReclamation === reclamationId ? { ...rec, etat: newStatus } : rec
      ));

      setNotification({
        message: `État de la réclamation mis à jour : ${newStatus}`,
        severity: 'success'
      });

      setReclamationDetailsOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setNotification({
        message: "Erreur lors de la mise à jour de l'état de la réclamation",
        severity: 'error'
      });
    }
  };

  const filteredCommandes = commandes
    .filter(commande => {
      const matchesSearch = commande.RefCommande.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || commande.etat === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const getCommandeStats = () => {
    return commandes.reduce((acc, commande) => {
      acc[commande.etat] = (acc[commande.etat] || 0) + 1;
      return acc;
    }, {});
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h4" component="h1">
                Dashboard Commercial
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Commandes Récentes
              </Typography>
              <List>
                {filteredCommandes.map((commande) => (
                  <React.Fragment key={commande.idCommande}>
                    <ListItem
                      component="div"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleCommandeClick(commande)}
                      secondaryAction={
                        <Chip
                          label={commande.etat}
                          color={statusColors[commande.etat]}
                          icon={commande.etat === 'EN_ATTENTE' ? <Warning /> : <Check />}
                        />
                      }
                    >
                      <ListItemText
                        primary={`Commande #${commande.RefCommande}`}
                        secondary={`Date: ${new Date(commande.date).toLocaleDateString()}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Réclamations Commerciales
              </Typography>
              <List>
                {reclamations.map((reclamation) => (
                  <React.Fragment key={reclamation.idReclamation}>
                    <ListItem
                      onClick={() => handleReclamationClick(reclamation)}
                      sx={{ 
                        cursor: 'pointer',
                        bgcolor: 
                          reclamation.etat === 'En instance' ? 'warning.light' :
                          reclamation.etat === 'En cours' ? 'info.light' :
                          reclamation.etat === 'Validée' ? 'success.light' :
                          'background.paper',
                        mb: 1,
                        borderRadius: 1
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography component="div">
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1" component="span">
                                Réclamation #{reclamation.idReclamation}
                              </Typography>
                              <Chip
                                label={reclamation.etat}
                                color={
                                  reclamation.etat === 'En instance' ? 'warning' :
                                  reclamation.etat === 'En cours' ? 'info' :
                                  reclamation.etat === 'Validée' ? 'success' :
                                  'default'
                                }
                                size="small"
                              />
                            </Box>
                          </Typography>
                        }
                        secondary={
                          <Typography component="div" variant="body2" color="text.secondary">
                            <Box>
                              <Typography component="span" variant="body2" color="text.secondary" display="block">
                                Date: {new Date(reclamation.date).toLocaleDateString()}
                              </Typography>
                              <Typography component="span" variant="body2" color="text.secondary" display="block">
                                Description: {reclamation.description.substring(0, 100)}...
                              </Typography>
                            </Box>
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Dialog
          open={reclamationDetailsOpen}
          onClose={() => setReclamationDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Détails de la Réclamation #{selectedReclamation?.idReclamation}
          </DialogTitle>
          <DialogContent>
            {selectedReclamation && (
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" component="div" gutterBottom>
                      Informations générales
                    </Typography>
                    <Typography variant="body1" component="div" gutterBottom>
                      Date: {new Date(selectedReclamation.date).toLocaleString()}
                    </Typography>
                    <Typography variant="body1" component="div" gutterBottom>
                      État actuel: {selectedReclamation.etat}
                    </Typography>
                    <Typography variant="body1" component="div" gutterBottom>
                      Type: {selectedReclamation.type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" component="div" gutterBottom>
                      Changer l'état
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdateReclamationStatus(selectedReclamation.idReclamation, 'En cours')}
                        disabled={selectedReclamation.etat === 'En cours'}
                      >
                        Marquer en cours
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleUpdateReclamationStatus(selectedReclamation.idReclamation, 'Validée')}
                        disabled={selectedReclamation.etat === 'Validée'}
                      >
                        Valider la réclamation
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" component="div" gutterBottom>
                      Description
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body1" component="div">
                        {selectedReclamation.description}
                      </Typography>
                    </Paper>
                  </Grid>
                  {selectedReclamation.image_url && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" component="div" gutterBottom>
                        Image jointe
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <img
                          src={`http://localhost:3000${selectedReclamation.image_url}`}
                          alt="Réclamation"
                          style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                        />
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReclamationDetailsOpen(false)}>
              Fermer
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Détails de la Commande #{selectedCommande?.RefCommande}
          </DialogTitle>
          <DialogContent>
            {selectedCommande && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  État: {selectedCommande.etat}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Date: {new Date(selectedCommande.date).toLocaleString()}
                </Typography>
                {selectedCommande.etat === 'EN_ATTENTE' && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleUpdateStatus(selectedCommande.idCommande, 'VALIDEE')}
                    >
                      Valider
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleUpdateStatus(selectedCommande.idCommande, 'REJETEE')}
                    >
                      Rejeter
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>
              Fermer
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notification !== null}
          autoHideDuration={6000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          {notification && (
            <Alert
              onClose={() => setNotification(null)}
              severity={notification.severity}
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          )}
        </Snackbar>
      </Container>
    </Box>
  );
};

export default CommercialDashboard;
