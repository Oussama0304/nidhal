import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  Report as ReportIcon,
  LocationOn as LocationOnIcon,
  Inventory as InventoryIcon,
  Logout as LogoutIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';

// Import des pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CommercialDashboard from './pages/CommercialDashboard';
import DepotDashboard from './pages/DepotDashboard';
import CommandeList from './pages/commandes/CommandeList';
import ReclamationList from './pages/reclamations/ReclamationList';
import StationList from './pages/stations/StationList';
import ProduitList from './pages/produits/ProduitList';
import LandingPage from './pages/LandingPage';
import PrivateLayout from './PrivateLayout'; // Import du composant PrivateLayout

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FFD700', // Gold from landing page
      dark: '#FFC700', // Darker gold for hover states
      contrastText: '#000000',
    },
    secondary: {
      main: '#000000', // Black from landing page
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#f8f9fa',
      paper: 'rgba(255, 255, 255, 0.9)',
    },
    text: {
      primary: '#000000',
      secondary: 'rgba(0, 0, 0, 0.7)',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `
            linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%),
            linear-gradient(45deg, #f8f9fa 25%, transparent 25%, transparent 75%, #f8f9fa 75%, #f8f9fa),
            linear-gradient(45deg, #f8f9fa 25%, transparent 25%, transparent 75%, #f8f9fa 75%, #f8f9fa)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          backgroundPosition: '0 0, 0 0, 20px 20px',
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95))',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95))',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '4px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          backgroundImage: 'linear-gradient(45deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.9))',
          color: '#FFFFFF',
          '& .MuiListItemIcon-root': {
            color: '#FFD700',
          },
          '& .MuiListItemText-primary': {
            color: '#FFFFFF',
          },
          '& .MuiDivider-root': {
            borderColor: 'rgba(255, 215, 0, 0.1)',
          },
        },
      },
    },
  },
});

const getMenuItems = (role) => {
  const baseItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
  ];

  switch (role) {
    case 'ADMIN':
      return [
        ...baseItems,
        { text: 'Stations', icon: <LocationOnIcon />, path: '/stations' },
        { text: 'Produits', icon: <InventoryIcon />, path: '/produits' },
      ];
    case 'GERANT':
      return [
        ...baseItems,
        { text: 'Commandes', icon: <ShoppingCartIcon />, path: '/commandes' },
        { text: 'Produits', icon: <InventoryIcon />, path: '/produits' },
      ];
    case 'COMMERCIAL':
      return [
        ...baseItems,
        { text: 'Réclamations', icon: <ReportIcon />, path: '/reclamations' },
        { text: 'Stations', icon: <LocationOnIcon />, path: '/stations' },
      ];
    case 'DEPOT':
      return [
        ...baseItems,
        { text: 'Inventaire', icon: <InventoryIcon />, path: '/inventory' },
        { text: 'Livraisons', icon: <LocalShippingIcon />, path: '/deliveries' },
      ];
    default:
      return baseItems;
  }
};

function App() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/';  
  };

  const menuItems = getMenuItems(userRole);

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          AGIL
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text} 
            component={Link} 
            to={item.path}
            sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem 
          component="div" 
          onClick={handleLogout}
          sx={{ 
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Déconnexion" />
        </ListItem>
      </List>
    </div>
  );

  const getDashboardComponent = (role) => {
    switch (role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'COMMERCIAL':
        return <CommercialDashboard />;
      case 'DEPOT':
        return <DepotDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename="/">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes protégées */}
          {isAuthenticated ? (
            <>
              <Route path="/dashboard" element={
                <PrivateLayout>
                  {getDashboardComponent(userRole)}
                </PrivateLayout>
              } />
              
              {/* Routes Admin */}
              {userRole === 'ADMIN' && (
                <>
                  <Route path="/stations" element={<PrivateLayout><StationList /></PrivateLayout>} />
                  <Route path="/produits" element={<PrivateLayout><ProduitList /></PrivateLayout>} />
                </>
              )}
              
              {/* Routes Gérant */}
              {userRole === 'GERANT' && (
                <>
                  <Route path="/commandes" element={<PrivateLayout><CommandeList /></PrivateLayout>} />
                  <Route path="/produits" element={<PrivateLayout><ProduitList readOnly /></PrivateLayout>} />
                </>
              )}
              
              {/* Routes Commercial */}
              {userRole === 'COMMERCIAL' && (
                <>
                  <Route path="/reclamations" element={<PrivateLayout><ReclamationList /></PrivateLayout>} />
                  <Route path="/stations" element={<PrivateLayout><StationList readOnly /></PrivateLayout>} />
                </>
              )}
              
              {/* Routes Dépôt */}
              {userRole === 'DEPOT' && (
                <>
                  <Route path="/inventory" element={<PrivateLayout><ProduitList /></PrivateLayout>} />
                  <Route path="/deliveries" element={<PrivateLayout><CommandeList /></PrivateLayout>} />
                </>
              )}
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
