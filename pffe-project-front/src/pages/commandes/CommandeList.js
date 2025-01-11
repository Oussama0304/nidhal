import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RemoveCircleOutline as RemoveIcon
} from '@mui/icons-material';
import { commandeService, produitService } from '../../services/api.service';
import socket from '../../services/socket';

const CommandeList = () => {
  const [commandes, setCommandes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchData();
    initializeSocket();

    return () => {
      socket.off('nouvelle-commande');
      socket.off('commande-status-update');
    };
  }, []);

  const initializeSocket = () => {
    socket.on('nouvelle-commande', (nouvelleCommande) => {
      setCommandes(prevCommandes => [...prevCommandes, nouvelleCommande]);
      showNotification('Nouvelle commande reçue: ' + nouvelleCommande.RefCommande, 'info');
    });

    socket.on('commande-status-update', (update) => {
      setCommandes(prevCommandes => 
        prevCommandes.map(commande => 
          commande.idCommande === update.idCommande 
            ? { ...commande, etat: update.newStatus }
            : commande
        )
      );
      showNotification(`Statut de la commande mis à jour: ${update.newStatus}`, 'info');
    });
  };

  const fetchData = async () => {
    try {
      const [commandesRes, produitsRes] = await Promise.all([
        commandeService.getAllCommandes(),
        produitService.getAllProduits()
      ]);
      setCommandes(commandesRes.data);
      setProduits(produitsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showNotification('Erreur lors du chargement des données', 'error');
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleStatusChange = async (commandeId, newStatus) => {
    try {
      await commandeService.updateCommandeStatus(commandeId, newStatus);
      showNotification('Statut de la commande mis à jour avec succès');
      fetchData(); // Recharger les données après la mise à jour
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      showNotification('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'En instance':
        return 'warning';
      case 'En cours':
        return 'info';
      case 'Validée':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredCommandes = commandes.filter(commande => 
    filtreStatut === 'tous' || commande.etat === filtreStatut
  );

  const handleAdd = () => {
    setSelectedCommande(null);
    setSelectedProducts([]);
    setOpenDialog(true);
  };

  const handleEdit = (commande) => {
    setSelectedCommande(commande);
    // Charger les produits de la commande si nécessaire
    setSelectedProducts(commande.produits || []);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      try {
        await commandeService.deleteCommande(id);
        showNotification('Commande supprimée avec succès', 'success');
        fetchData();
      } catch (error) {
        showNotification('Erreur lors de la suppression de la commande', 'error');
      }
    }
  };

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, {
      idProduit: '',
      quantite: 1,
      prix: 0
    }]);
  };

  const removeProduct = (index) => {
    const newProducts = [...selectedProducts];
    newProducts.splice(index, 1);
    setSelectedProducts(newProducts);
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...selectedProducts];
    if (field === 'idProduit') {
      const selectedProduit = produits.find(p => p.idProduit === parseInt(value));
      if (selectedProduit) {
        newProducts[index] = {
          ...newProducts[index],
          idProduit: selectedProduit.idProduit,
          prix: selectedProduit.prix
        };
      }
    } else {
      newProducts[index][field] = value;
    }
    setSelectedProducts(newProducts);
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      return total + (product.prix * product.quantite);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      showNotification('Veuillez ajouter au moins un produit', 'error');
      return;
    }

    try {
      const commandeData = {
        produits: selectedProducts,
        montant: calculateTotal(),
        etat: 'En instance'
      };

      if (selectedCommande) {
        await commandeService.updateCommande(selectedCommande.idCommande, commandeData);
        showNotification('Commande mise à jour avec succès', 'success');
      } else {
        const response = await commandeService.createCommande(commandeData);
        socket.emit('nouvelle-commande', response.data);
        showNotification('Commande créée avec succès', 'success');
      }

      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors de l\'enregistrement de la commande', 'error');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCommande(null);
    setSelectedProducts([]);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Liste des Commandes
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filtrer par statut</InputLabel>
            <Select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              label="Filtrer par statut"
            >
              <MenuItem value="tous">Tous les statuts</MenuItem>
              <MenuItem value="En instance">En instance</MenuItem>
              <MenuItem value="En cours">En cours</MenuItem>
              <MenuItem value="Validée">Validée</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Nouvelle Commande
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Référence</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Produits</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCommandes.map((commande) => (
                <TableRow key={commande.idCommande}>
                  <TableCell>{commande.RefCommande}</TableCell>
                  <TableCell>
                    {new Date(commande.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {commande.nomProduit}
                  </TableCell>
                  <TableCell>{commande.montant} €</TableCell>
                  <TableCell>
                    <Chip
                      label={commande.etat}
                      color={getStatutColor(commande.etat)}
                      sx={{ minWidth: 100 }}
                    />
                  </TableCell>
                  <TableCell>
                    {commande.etat !== 'Validée' && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleStatusChange(
                          commande.idCommande,
                          commande.etat === 'En instance' ? 'En cours' : 'Validée'
                        )}
                      >
                        {commande.etat === 'En instance' ? 'Démarrer' : 'Valider'}
                      </Button>
                    )}
                    <IconButton onClick={() => handleEdit(commande)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(commande.idCommande)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedCommande ? 'Modifier la commande' : 'Nouvelle commande'}
          </DialogTitle>
          <DialogContent>
            <Box mb={3} mt={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addProduct}
              >
                Ajouter un produit
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produit</TableCell>
                    <TableCell>Quantité</TableCell>
                    <TableCell>Prix unitaire</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          select
                          fullWidth
                          value={product.idProduit}
                          onChange={(e) => handleProductChange(index, 'idProduit', e.target.value)}
                        >
                          {produits.map((p) => (
                            <MenuItem key={p.idProduit} value={p.idProduit}>
                              {p.LIBPRD}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={product.quantite}
                          onChange={(e) => handleProductChange(index, 'quantite', parseInt(e.target.value) || 0)}
                          inputProps={{ min: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        {product.prix} €
                      </TableCell>
                      <TableCell>
                        {(product.prix * product.quantite).toFixed(2)} €
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => removeProduct(index)} color="error">
                          <RemoveIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {selectedProducts.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="h6">Total</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6">{calculateTotal().toFixed(2)} €</Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="inherit">
              Annuler
            </Button>
            <Button 
              type="submit" 
              color="primary" 
              variant="contained"
              disabled={selectedProducts.length === 0}
            >
              {selectedCommande ? 'Mettre à jour' : 'Créer la commande'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CommandeList;
