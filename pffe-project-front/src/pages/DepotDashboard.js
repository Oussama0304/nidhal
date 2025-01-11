import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Alert,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ExitToApp as ExitToAppIcon,
  Refresh as RefreshIcon,
  LocalGasStation as StationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DepotDashboard = () => {
  const navigate = useNavigate();
  const [validatedOrders, setValidatedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fonction pour récupérer les stations
  const fetchStations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/stations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStations(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des stations:', error);
      setAlert({
        open: true,
        message: 'Erreur lors de la récupération des stations',
        severity: 'error'
      });
    }
  };

  const fetchValidatedOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/commandes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const validatedOrdersList = response.data.filter(order => order.etat === 'Validée');
      setValidatedOrders(validatedOrdersList);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      setAlert({
        open: true,
        message: 'Erreur lors de la récupération des commandes',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidatedOrders();
  }, [fetchValidatedOrders]);

  useEffect(() => {
    fetchStations();
  }, []);

  const assignOrderToStation = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Créer une nouvelle livraison
      await axios.post(
        `http://localhost:3000/api/commandes/${selectedOrder.idCommande}/livraison`,
        { idStation: selectedStation },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setAlert({
        open: true,
        message: 'Commande affectée avec succès à la station',
        severity: 'success'
      });
      
      setAssignDialogOpen(false);
      setSelectedOrder(null);
      setSelectedStation('');
      fetchValidatedOrders();
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error);
      setAlert({
        open: true,
        message: 'Erreur lors de l\'affectation à la station',
        severity: 'error'
      });
    }
  };

  const handleAssignClick = (order) => {
    setSelectedOrder(order);
    setAssignDialogOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header avec bouton de déconnexion */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2, px: 3, mb: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Tableau de Bord Dépôt</Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<ExitToAppIcon />}
            >
              Déconnexion
            </Button>
          </Box>
        </Container>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Commandes Validées
                  </Typography>
                  <IconButton onClick={fetchValidatedOrders} title="Rafraîchir">
                    <RefreshIcon />
                  </IconButton>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Référence</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>État</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {validatedOrders.length > 0 ? (
                        validatedOrders.map((order) => (
                          <TableRow key={order.idCommande}>
                            <TableCell>{order.RefCommande}</TableCell>
                            <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                            <TableCell>{order.etat}</TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleAssignClick(order)}
                                startIcon={<StationIcon />}
                                sx={{ mr: 1 }}
                              >
                                Affecter à une station
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            Aucune commande validée à afficher
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Dialog pour l'affectation à une station */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Affecter la commande à une station
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Station</InputLabel>
            <Select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              label="Station"
            >
              {stations.map((station) => (
                <MenuItem key={station.idStation} value={station.idStation}>
                  <Box>
                    <Typography variant="subtitle1">{station.nom}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {station.adresse}, {station.ville}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tél: {station.telephone} | Email: {station.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Capacité: {station.capacite}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Annuler</Button>
          <Button 
            onClick={assignOrderToStation}
            variant="contained" 
            color="primary"
            disabled={!selectedStation}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DepotDashboard;
