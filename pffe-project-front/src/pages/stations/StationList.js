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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { stationService } from '../../services/api.service';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const StationList = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
    capacite: '',
  });

  const columns = [
    { field: 'nom', headerName: 'Nom', width: 150 },
    { field: 'adresse', headerName: 'Adresse', width: 200 },
    { field: 'ville', headerName: 'Ville', width: 130 },
    { field: 'telephone', headerName: 'Téléphone', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'capacite', headerName: 'Capacité', width: 100 },
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
          >
            Modifier
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(params.row.idStation)}
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
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await stationService.getAllStations();
      setStations(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedStation(null);
    setFormData({
      nom: '',
      adresse: '',
      ville: '',
      telephone: '',
      email: '',
      capacite: '',
    });
    setOpenDialog(true);
  };

  const handleEdit = (station) => {
    console.log('Station to edit:', station); // Debug log
    if (!station || !station.idStation) {
      console.error('Station ID is missing');
      return;
    }
    setSelectedStation(station);
    setFormData({
      nom: station.nom || '',
      adresse: station.adresse || '',
      ville: station.ville || '',
      telephone: station.telephone || '',
      email: station.email || '',
      capacite: station.capacite || '',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette station ?')) {
      try {
        await stationService.deleteStation(id);
        fetchStations();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedStation && selectedStation.idStation) {
        await stationService.updateStation(selectedStation.idStation, formData);
      } else {
        await stationService.createStation(formData);
      }
      setOpenDialog(false);
      fetchStations();
      setFormData({
        nom: '',
        adresse: '',
        ville: '',
        telephone: '',
        email: '',
        capacite: '',
      });
      setSelectedStation(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Gestion des Stations</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Nouvelle Station
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <DataGrid
          rows={stations}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          getRowId={(row) => row.idStation}
          autoHeight
          loading={loading}
        />
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedStation ? 'Modifier la Station' : 'Nouvelle Station'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ville"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Capacité"
                  name="capacite"
                  type="number"
                  value={formData.capacite}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedStation ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StationList;
