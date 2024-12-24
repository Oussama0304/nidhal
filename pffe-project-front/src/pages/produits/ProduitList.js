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
  Grid,
  Snackbar,
  Alert,
  MenuItem
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { produitService } from '../../services/api.service';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const initialFormState = {
  nom: '',
  disponibilite: '',
  prix: '',
  CODPRD: '',
  LIBPRD: '',
  CODEMB: '',
  LIBEMB: '',
  TYPPRD: ''
};

const ProduitList = () => {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const columns = [
    { field: 'CODPRD', headerName: 'Code Produit', width: 130 },
    { field: 'nom', headerName: 'Nom', width: 150 },
    { field: 'prix', headerName: 'Prix', width: 100, valueFormatter: (params) => {
      return params.value ? `${params.value} DT` : '0 DT';
    }},
    { field: 'disponibilite', headerName: 'Disponibilité', width: 130 },
    { field: 'TYPPRD', headerName: 'Type', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button
            startIcon={<EditIcon />}
            onClick={() => handleEdit(params.row)}
            size="small"
            sx={{ mr: 1 }}
          >
            Modifier
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(params.row.idProduit)}
            size="small"
            color="error"
          >
            Supprimer
          </Button>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    try {
      const response = await produitService.getAllProduits();
      setProduits(response.data.map(product => ({
        ...product,
        id: product.idProduit // Required for DataGrid
      })));
    } catch (error) {
      showNotification('Erreur lors du chargement des produits', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedProduit(null);
    setFormData(initialFormState);
    setOpenDialog(true);
  };

  const handleEdit = (produit) => {
    setSelectedProduit(produit);
    setFormData({
      nom: produit.nom || '',
      disponibilite: produit.disponibilite || '',
      prix: produit.prix || '',
      CODPRD: produit.CODPRD || '',
      LIBPRD: produit.LIBPRD || '',
      CODEMB: produit.CODEMB || '',
      LIBEMB: produit.LIBEMB || '',
      TYPPRD: produit.TYPPRD || ''
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await produitService.deleteProduit(id);
        showNotification('Produit supprimé avec succès', 'success');
        fetchProduits();
      } catch (error) {
        showNotification('Erreur lors de la suppression du produit', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        prix: parseFloat(formData.prix) || 0
      };

      if (selectedProduit) {
        await produitService.updateProduit(selectedProduit.idProduit, productData);
        showNotification('Produit mis à jour avec succès', 'success');
      } else {
        await produitService.createProduit(productData);
        showNotification('Produit créé avec succès', 'success');
      }
      
      handleCloseDialog();
      fetchProduits();
    } catch (error) {
      showNotification(
        `Erreur lors de ${selectedProduit ? 'la mise à jour' : 'la création'} du produit`,
        'error'
      );
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduit(null);
    setFormData(initialFormState);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestion des Produits
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Ajouter un produit
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <DataGrid
          rows={produits}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          autoHeight
          loading={loading}
          sx={{ minHeight: 400 }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedProduit ? 'Modifier le produit' : 'Ajouter un produit'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="CODPRD"
                  label="Code Produit"
                  fullWidth
                  value={formData.CODPRD}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="nom"
                  label="Nom"
                  fullWidth
                  required
                  value={formData.nom}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="prix"
                  label="Prix"
                  type="number"
                  fullWidth
                  required
                  value={formData.prix}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="disponibilite"
                  label="Disponibilité"
                  fullWidth
                  value={formData.disponibilite}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="TYPPRD"
                  label="Type de Produit"
                  fullWidth
                  value={formData.TYPPRD}
                  onChange={handleInputChange}
                  select
                  helperText="Catégorie générale du produit"
                >
                  <MenuItem value="CARBURANT">CARBURANT</MenuItem>
                  <MenuItem value="LUBRIFIANT">LUBRIFIANT</MenuItem>
                  <MenuItem value="ACCESSOIRE">ACCESSOIRE</MenuItem>
                  <MenuItem value="SERVICE">SERVICE</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="LIBPRD"
                  label="Libellé Produit"
                  fullWidth
                  value={formData.LIBPRD}
                  onChange={handleInputChange}
                  placeholder="Ex: Essence Sans Plomb 95"
                  helperText="Description détaillée du produit"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="inherit">
              Annuler
            </Button>
            <Button type="submit" color="primary" variant="contained">
              {selectedProduit ? 'Mettre à jour' : 'Ajouter'}
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

export default ProduitList;
