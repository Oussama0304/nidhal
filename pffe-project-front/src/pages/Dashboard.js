import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ExitToApp as ExitToAppIcon,
  ShoppingCart as ShoppingCartIcon,
  Remove as RemoveIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [commandes, setCommandes] = useState([]);
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockWarnings, setStockWarnings] = useState({});
  const [openReclamationDialog, setOpenReclamationDialog] = useState(false);
  const [complaintActionSuccess, setComplaintActionSuccess] = useState(false);
  const [reclamationFormData, setReclamationFormData] = useState({
    type: 'TECHNIQUE',
    description: '',
    idGerant: '',
    etat: 'En instance',
    image: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('No token found - redirecting to login');
          navigate('/login');
          return;
        }

        const config = {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        // Charger les commandes de l'utilisateur
        const commandesResponse = await axios.get(
          'http://localhost:3000/api/commandes/user',
          config
        );
        setCommandes(commandesResponse.data);

        // Charger les réclamations de l'utilisateur
        const reclamationsResponse = await axios.get(
          'http://localhost:3000/api/reclamations/user',
          config
        );
        setReclamations(reclamationsResponse.data);

        // Charger les stocks
        const stocksResponse = await axios.get(
          'http://localhost:3000/api/products',
          config
        );

        const transformedStocks = stocksResponse.data.map(produit => ({
          id: produit.idProduit,
          nomProduit: produit.nom,
          quantite: produit.quantite || 0,
          quantiteCommande: 0,
          prix: produit.prix,
          seuilAlerte: produit.seuilAlerte || 10
        }));

        setStocks(transformedStocks);

        const warnings = {};
        transformedStocks.forEach(stock => {
          if (stock.quantite <= stock.seuilAlerte) {
            warnings[stock.id] = `Stock bas (${stock.quantite} restants)`;
          }
        });
        setStockWarnings(warnings);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleQuantityChange = (productId, change) => {
    setStocks(prevStocks =>
      prevStocks.map(stock =>
        stock.id === productId
          ? {
              ...stock,
              quantiteCommande: Math.max(
                0,
                Math.min(stock.quantite, stock.quantiteCommande + change)
              )
            }
          : stock
      )
    );
  };

  const handleSubmitOrder = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const productsToOrder = stocks
        .filter(stock => stock.quantiteCommande > 0)
        .map(stock => ({
          productId: stock.id,
          quantity: stock.quantiteCommande
        }));

      if (productsToOrder.length === 0) {
        alert('Veuillez sélectionner au moins un produit');
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post(
        'http://localhost:3000/api/commandes',
        { products: productsToOrder },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setOrderSuccess(true);
      setOrderNumber(response.data.commandeId);
      
      // Reset quantities
      setStocks(prevStocks =>
        prevStocks.map(stock => ({ ...stock, quantiteCommande: 0 }))
      );

      // Refresh commandes
      const commandesResponse = await axios.get(
        'http://localhost:3000/api/commandes/user',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setCommandes(commandesResponse.data);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Erreur lors de la soumission de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReclamationChange = (e) => {
    if (e.target.name === 'image') {
      setReclamationFormData({
        ...reclamationFormData,
        image: e.target.files[0]
      });
    } else {
      setReclamationFormData({
        ...reclamationFormData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleReclamationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('type', reclamationFormData.type);
      formData.append('description', reclamationFormData.description);
      formData.append('idGerant', reclamationFormData.idGerant);
      if (reclamationFormData.image) {
        formData.append('image', reclamationFormData.image);
      }

      const response = await axios.post(
        'http://localhost:3000/api/reclamations',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 201) {
        setComplaintActionSuccess(true);
        setOpenReclamationDialog(false);
        
        // Recharger les réclamations
        const reclamationsResponse = await axios.get(
          'http://localhost:3000/api/reclamations/user',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setReclamations(reclamationsResponse.data);
        
        // Réinitialiser le formulaire
        setReclamationFormData({
          type: 'TECHNIQUE',
          description: '',
          idGerant: '',
          etat: 'En instance',
          image: null
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de la réclamation:', error);
      alert('Erreur lors de la création de la réclamation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Tableau de bord
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<ExitToAppIcon />}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Commandes récentes */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Commandes récentes
                </Typography>
                <List>
                  {commandes.length === 0 ? (
                    <ListItem key="no-commandes">
                      <ListItemText primary="Aucune commande" />
                    </ListItem>
                  ) : (
                    commandes.map((commande) => (
                      <React.Fragment key={commande.idCommande}>
                        <ListItem>
                          <ListItemText
                            primary={`Commande #${commande.idCommande}`}
                            secondary={`Statut: ${commande.etat} - Date: ${new Date(
                              commande.date
                            ).toLocaleDateString()}`}
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Réclamations */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Réclamations
                </Typography>
                <List>
                  {reclamations.length === 0 ? (
                    <ListItem key="no-reclamations">
                      <ListItemText primary="Aucune réclamation" />
                    </ListItem>
                  ) : (
                    reclamations.map((reclamation) => (
                      <React.Fragment key={reclamation.idReclamation}>
                        <ListItem>
                          <ListItemText
                            primary={`Réclamation #${reclamation.idReclamation}`}
                            secondary={`Statut: ${reclamation.etat} - Date: ${new Date(
                              reclamation.date
                            ).toLocaleDateString()}`}
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))
                  )}
                </List>
                <Button variant="contained" onClick={() => setOpenReclamationDialog(true)}>Déposer une réclamation</Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Nouvelle commande */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Nouvelle commande
                </Typography>
                {orderSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Commande #{orderNumber} créée avec succès!
                  </Alert>
                )}
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Produit</TableCell>
                        <TableCell align="right">Stock disponible</TableCell>
                        <TableCell align="right">Prix unitaire</TableCell>
                        <TableCell align="center">Quantité</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stocks.map((stock) => (
                        <TableRow key={`stock-${stock.id}`}>
                          <TableCell>
                            {stock.nomProduit}
                            {stockWarnings[stock.id] && (
                              <Typography key={`warning-${stock.id}`} color="error" variant="caption" display="block">
                                {stockWarnings[stock.id]}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">{stock.quantite}</TableCell>
                          <TableCell align="right">{stock.prix.toFixed(2)} DT</TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={() => handleQuantityChange(stock.id, -1)}
                              disabled={stock.quantiteCommande === 0}
                            >
                              <RemoveIcon />
                            </IconButton>
                            {stock.quantiteCommande}
                            <IconButton
                              onClick={() => handleQuantityChange(stock.id, 1)}
                              disabled={stock.quantiteCommande >= stock.quantite}
                            >
                              <AddIcon />
                            </IconButton>
                          </TableCell>
                          <TableCell align="right">
                            {(stock.prix * stock.quantiteCommande).toFixed(2)} DT
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} align="right">
                          <strong>Total</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>
                            {stocks
                              .reduce(
                                (total, stock) =>
                                  total + stock.prix * stock.quantiteCommande,
                                0
                              )
                              .toFixed(2)}{' '}
                            DT
                          </strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting || stocks.every(s => s.quantiteCommande === 0)}
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Passer la commande'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Notifications */}
      {complaintActionSuccess && (
        <Alert 
          severity="success" 
          sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}
          onClose={() => setComplaintActionSuccess(false)}
        >
          Réclamation créée avec succès
        </Alert>
      )}

      <Dialog 
        open={openReclamationDialog} 
        onClose={() => setOpenReclamationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nouvelle Réclamation</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleReclamationSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={reclamationFormData.type}
                onChange={handleReclamationChange}
                required
              >
                <MenuItem value="TECHNIQUE">TECHNIQUE</MenuItem>
                <MenuItem value="COMMERCIALE">COMMERCIALE</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={reclamationFormData.description}
              onChange={handleReclamationChange}
              required
            />

            <TextField
              fullWidth
              margin="normal"
              name="idGerant"
              label="ID Gérant"
              type="number"
              value={reclamationFormData.idGerant}
              onChange={handleReclamationChange}
              required
            />

            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2, mb: 2 }}
            >
              {reclamationFormData.image ? 'Changer l\'image' : 'Ajouter une image'}
              <input
                type="file"
                hidden
                name="image"
                accept="image/*"
                onChange={handleReclamationChange}
              />
            </Button>
            {reclamationFormData.image && (
              <Typography variant="body2" color="textSecondary">
                Image sélectionnée: {reclamationFormData.image.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReclamationDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleReclamationSubmit} 
            variant="contained" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Création...' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
