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
  FormControl,
  InputLabel,
  Select,
  IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { reclamationService } from '../../services/api.service';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReclamationList = () => {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [formData, setFormData] = useState({
    type: 'TECHNIQUE',
    description: '',
    idGerant: '',
    idCommercial: null,
    etat: 'En instance',
    date: new Date().toISOString()
  });

  const formatDate = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      return '';
    }
  };

  const getFullName = (nom, prenom) => {
    const nameParts = [nom, prenom].filter(part => part && typeof part === 'string');
    return nameParts.length > 0 ? nameParts.join(' ') : '';
  };

  const columns = [
    { 
      field: 'idReclamation', 
      headerName: 'ID', 
      width: 90,
      valueGetter: (params) => params?.row?.idReclamation ?? ''
    },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 130,
      valueGetter: (params) => params?.row?.type ?? ''
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      width: 200,
      flex: 1,
      valueGetter: (params) => params?.row?.description ?? ''
    },
    { 
      field: 'etat', 
      headerName: 'État', 
      width: 130,
      valueGetter: (params) => params?.row?.etat ?? ''
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 130,
      valueGetter: (params) => params?.row?.date ?? '',
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'gerant', 
      headerName: 'Gérant', 
      width: 180,
      valueGetter: (params) => {
        if (!params?.row) return '';
        return getFullName(params.row.nom_gerant, params.row.prenom_gerant);
      }
    },
    { 
      field: 'commercial', 
      headerName: 'Commercial', 
      width: 180,
      valueGetter: (params) => {
        if (!params?.row) return '';
        return getFullName(params.row.nom_commercial, params.row.prenom_commercial);
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        if (!params?.row?.idReclamation) return null;
        return (
          <Box>
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleEdit(params.row)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDelete(params.row.idReclamation)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      }
    }
  ];

  useEffect(() => {
    fetchReclamations();
  }, []);

  const fetchReclamations = async () => {
    setLoading(true);
    try {
      const response = await reclamationService.getUserReclamations();
      console.log('Réclamations reçues:', response.data);
      if (Array.isArray(response.data)) {
        setReclamations(response.data);
      } else {
        console.error('Format de données invalide:', response.data);
        setReclamations([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réclamations:', error);
      setReclamations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedReclamation(null);
    setFormData({
      type: 'TECHNIQUE',
      description: '',
      idGerant: '',
      idCommercial: null,
      etat: 'En instance',
      date: new Date().toISOString()
    });
    setOpenDialog(true);
  };

  const handleEdit = (reclamation) => {
    if (!reclamation) return;
    setSelectedReclamation(reclamation);
    setFormData({
      type: reclamation.type || 'TECHNIQUE',
      description: reclamation.description || '',
      idGerant: reclamation.idGerant || '',
      idCommercial: reclamation.idCommercial || null,
      etat: reclamation.etat || 'En instance',
      date: reclamation.date || new Date().toISOString()
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (!id || !window.confirm('Êtes-vous sûr de vouloir supprimer cette réclamation ?')) {
      return;
    }
    try {
      await reclamationService.deleteReclamation(id);
      fetchReclamations();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.idGerant || !formData.type) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        idGerant: parseInt(formData.idGerant),
        date: new Date().toISOString()
      };

      if (selectedReclamation) {
        await reclamationService.updateReclamation(selectedReclamation.idReclamation, dataToSubmit);
        toast.success('Réclamation modifiée avec succès');
      } else {
        await reclamationService.createReclamation(dataToSubmit);
        toast.success('Réclamation créée avec succès');
      }

      setOpenDialog(false);
      fetchReclamations();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast.error('Une erreur est survenue lors de la soumission');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'TECHNIQUE',
      description: '',
      idGerant: '',
      idCommercial: null,
      etat: 'En instance',
      date: new Date().toISOString()
    });
    setSelectedReclamation(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container maxWidth="lg">
      <ToastContainer position="top-right" autoClose={3000} />
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Gestion des Réclamations</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Nouvelle Réclamation
          </Button>
        </Box>

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <DataGrid
            rows={reclamations}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            autoHeight
            loading={loading}
            getRowId={(row) => row?.idReclamation ?? Math.random()}
            sx={{ minHeight: 400 }}
          />
        </Paper>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedReclamation ? 'Modifier la Réclamation' : 'Nouvelle Réclamation'}
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
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
              value={formData.description}
              onChange={handleInputChange}
              required
            />

            <TextField
              fullWidth
              margin="normal"
              name="idGerant"
              label="ID Gérant"
              type="number"
              value={formData.idGerant}
              onChange={handleInputChange}
              required
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>État</InputLabel>
              <Select
                name="etat"
                value={formData.etat}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="En instance">En instance</MenuItem>
                <MenuItem value="En cours">En cours</MenuItem>
                <MenuItem value="Validée">Validée</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedReclamation ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ReclamationList;
