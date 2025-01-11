import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { produitService } from '../services/api.service';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const loadProducts = async () => {
    try {
      const response = await produitService.getAllProduits();
      setProducts(response.data);
    } catch (error) {
      showNotification('Erreur lors du chargement des produits', 'error');
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const handleUpdateProduct = async () => {
    try {
      await produitService.updateProduit(selectedProduct.idProduit, selectedProduct);
      showNotification('Produit mis à jour avec succès', 'success');
      loadProducts();
      handleCloseDialog();
    } catch (error) {
      showNotification('Erreur lors de la mise à jour du produit', 'error');
    }
  };

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct({
      ...selectedProduct,
      [name]: name === 'prix' ? parseFloat(value) : value,
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Gestion des Produits</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Disponibilité</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.idProduit}>
                <TableCell>{product.nom}</TableCell>
                <TableCell>{product.prix}</TableCell>
                <TableCell>{product.disponibilite}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEditClick(product)}
                  >
                    Modifier
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Modifier le produit</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <>
              <TextField
                margin="dense"
                name="nom"
                label="Nom"
                type="text"
                fullWidth
                value={selectedProduct.nom}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="prix"
                label="Prix"
                type="number"
                fullWidth
                value={selectedProduct.prix}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="disponibilite"
                label="Disponibilité"
                type="text"
                fullWidth
                value={selectedProduct.disponibilite}
                onChange={handleInputChange}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Annuler
          </Button>
          <Button onClick={handleUpdateProduct} color="primary">
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProductManagement;
