import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  ExitToApp as ExitToAppIcon,
  Search as SearchIcon,
  Add as AddIcon,
  PictureAsPdf as PictureAsPdfIcon,
  TableView as TableViewIcon,
  Business as BusinessIcon,
  Build as BuildIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import ProductManagement from '../components/ProductManagement';
import exportService from '../services/exportService';

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [reclamations, setReclamations] = useState([]);
  const [filteredReclamations, setFilteredReclamations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('all');
  const [activeTab, setActiveTab] = useState(0);

  // Liste des critères de recherche disponibles
  const searchCriteriaOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'id', label: 'ID' },
    { value: 'type', label: 'Type' },
    { value: 'description', label: 'Description' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'gerant', label: 'Gérant' },
    { value: 'etat', label: 'État' },
    { value: 'date', label: 'Date' },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/admin/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchReclamations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/reclamations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReclamations(response.data);
        setFilteredReclamations(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des réclamations:', err);
      }
    };

    fetchStats();
    fetchReclamations();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReclamations(reclamations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = reclamations.filter(reclamation => {
      switch (searchCriteria) {
        case 'id':
          return reclamation.idReclamation?.toString().includes(query);
        case 'type':
          return reclamation.type?.toLowerCase().includes(query);
        case 'description':
          return reclamation.description?.toLowerCase().includes(query);
        case 'commercial':
          const commercialName = `${reclamation.nom_commercial} ${reclamation.prenom_commercial}`.toLowerCase();
          return commercialName.includes(query);
        case 'gerant':
          const gerantName = `${reclamation.nom_gerant} ${reclamation.prenom_gerant}`.toLowerCase();
          return gerantName.includes(query);
        case 'etat':
          return reclamation.etat?.toLowerCase().includes(query);
        case 'date':
          return new Date(reclamation.date).toLocaleDateString().toLowerCase().includes(query);
        case 'all':
        default:
          return (
            reclamation.idReclamation?.toString().includes(query) ||
            reclamation.type?.toLowerCase().includes(query) ||
            reclamation.description?.toLowerCase().includes(query) ||
            `${reclamation.nom_commercial} ${reclamation.prenom_commercial}`.toLowerCase().includes(query) ||
            `${reclamation.nom_gerant} ${reclamation.prenom_gerant}`.toLowerCase().includes(query) ||
            reclamation.etat?.toLowerCase().includes(query) ||
            new Date(reclamation.date).toLocaleDateString().toLowerCase().includes(query)
          );
      }
    });

    setFilteredReclamations(filtered);
  }, [searchQuery, searchCriteria, reclamations]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchCriteriaChange = (event) => {
    setSearchCriteria(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleStatusChange = (reclamation) => {
    setSelectedReclamation(reclamation);
    setOpenDialog(true);
  };

  const getReclamationIcon = (type) => {
    let icon;
    switch (type) {
      case 'COMMERCIALE':
        icon = <BusinessIcon />;
        break;
      case 'TECHNIQUE':
        icon = <BuildIcon />;
        break;
      default:
        icon = <HelpIcon />;
    }
    return icon;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Dashboard
        return (
          <Grid container spacing={3}>
            {/* Statistiques des Stations */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Stations
                  </Typography>
                  <Typography variant="h4">
                    {stats?.stations?.total_stations || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats?.stations?.stations_avec_gerant || 0} avec gérants
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats?.stations?.stations_avec_gerant / stats?.stations?.total_stations * 100) || 0}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Statistiques des Commandes */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Commandes
                  </Typography>
                  <Typography variant="h4">
                    {stats?.commandes?.total || 0}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="warning.main">
                      En instance: {stats?.commandes?.en_instance || 0}
                    </Typography>
                    <Typography variant="body2" color="info.main">
                      En cours: {stats?.commandes?.en_cours || 0}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      Validées: {stats?.commandes?.validees || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Statistiques des Réclamations */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Réclamations
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {stats?.reclamations?.map((type, index) => (
                      <Box key={index}>
                        <Typography variant="subtitle2">
                          {type.type}: {type.total}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', ml: 2 }}>
                          <Typography variant="caption" color="warning.main">
                            En instance: {type.en_instance}
                          </Typography>
                          <Typography variant="caption" color="info.main">
                            En cours: {type.en_cours}
                          </Typography>
                          <Typography variant="caption" color="success.main">
                            Validées: {type.validees}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Statistiques des Utilisateurs */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Utilisateurs par Rôle
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {stats?.users?.map((role, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">
                          {role.roles}:
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {role.count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Graphiques */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  État des Commandes
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar
                    data={{
                      labels: ['En instance', 'En cours', 'Validées'],
                      datasets: [
                        {
                          label: 'Commandes',
                          data: [
                            stats?.commandes?.en_instance || 0,
                            stats?.commandes?.en_cours || 0,
                            stats?.commandes?.validees || 0,
                          ],
                          backgroundColor: [
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Répartition des Réclamations par Type
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Pie
                    data={{
                      labels: stats?.reclamations?.map(r => r.type) || [],
                      datasets: [
                        {
                          data: stats?.reclamations?.map(r => r.total) || [],
                          backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Section des réclamations */}
            <Grid item xs={12} sx={{ mt: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6">
                    Gestion des Réclamations
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Select
                      value={searchCriteria}
                      onChange={handleSearchCriteriaChange}
                      size="small"
                      sx={{ minWidth: 150 }}
                    >
                      {searchCriteriaOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <TextField
                      placeholder={`Rechercher par ${searchCriteriaOptions.find(opt => opt.value === searchCriteria).label.toLowerCase()}...`}
                      variant="outlined"
                      size="small"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      sx={{ width: '300px' }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Commercial</TableCell>
                        <TableCell>Gérant</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>État</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredReclamations.map((reclamation) => (
                        <TableRow key={reclamation.idReclamation}>
                          <TableCell>{reclamation.idReclamation}</TableCell>
                          <TableCell>{getReclamationIcon(reclamation.type)}</TableCell>
                          <TableCell>{reclamation.description}</TableCell>
                          <TableCell>
                            {reclamation.nom_commercial} {reclamation.prenom_commercial}
                          </TableCell>
                          <TableCell>
                            {reclamation.nom_gerant} {reclamation.prenom_gerant}
                          </TableCell>
                          <TableCell>
                            {new Date(reclamation.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                backgroundColor: 
                                  reclamation.etat === 'En instance' ? '#ffeb3b' :
                                  reclamation.etat === 'En cours' ? '#2196f3' :
                                  reclamation.etat === 'Traitée' ? '#4caf50' :
                                  reclamation.etat === 'Clôturée' ? '#9e9e9e' : 'inherit',
                                color: '#fff',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                display: 'inline-block',
                                fontSize: '0.875rem',
                              }}
                            >
                              {reclamation.etat}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleStatusChange(reclamation)}
                            >
                              Modifier État
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredReclamations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            <Typography variant="body2" sx={{ py: 2 }}>
                              Aucune réclamation ne correspond à votre recherche
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        );
      case 1: // Gestion des Utilisateurs
        return (
          <TableContainer component={Paper}>
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Gestion des Utilisateurs</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/users/new')}
              >
                Nouvel Utilisateur
              </Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Station</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* ... contenu du tableau ... */}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 2: // Gestion des Produits
        return (
          <ProductManagement />
        );
      default:
        return null;
    }
  };

  const handleExportPDF = async () => {
    try {
      const exportData = {
        stats: stats,
        reclamations: filteredReclamations
      };
      
      const pdfBlob = await exportService.exportToPdf(exportData);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dashboard-admin-rapport.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'exportation PDF:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const exportData = {
        stats: stats,
        reclamations: filteredReclamations
      };
      
      const excelBlob = await exportService.exportToExcel(exportData);
      const url = window.URL.createObjectURL(excelBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dashboard-admin-export.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'exportation Excel:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard Admin
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<ExitToAppIcon />}>
            Déconnexion
          </Button>
        </Toolbar>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{ bgcolor: 'background.paper' }}
        >
          <Tab label="Statistiques" />
          <Tab label="Réclamations" />
          <Tab label="Gestion des Produits" />
        </Tabs>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExportPDF}
            startIcon={<PictureAsPdfIcon />}
          >
            Exporter en PDF
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExportExcel}
            startIcon={<TableViewIcon />}
          >
            Exporter en Excel
          </Button>
        </Box>
        {renderTabContent()}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Modifier l'état de la réclamation</DialogTitle>
        <DialogContent>
          <Select
            fullWidth
            value={selectedReclamation?.etat || ''}
            onChange={(e) => {
              setSelectedReclamation({
                ...selectedReclamation,
                etat: e.target.value,
              });
            }}
          >
            <MenuItem value="En instance">En instance</MenuItem>
            <MenuItem value="En cours">En cours</MenuItem>
            <MenuItem value="Traitée">Traitée</MenuItem>
            <MenuItem value="Clôturée">Clôturée</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
        </DialogActions>
      </Dialog>
      <Typography>
        {`L\u2019application n\u2019est pas disponible pour le moment`}
      </Typography>
    </Box>
  );
}

export default AdminDashboard;
