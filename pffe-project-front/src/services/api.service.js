import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

// Services pour les commandes
export const commandeService = {
    getAllCommandes: () => axios.get(`${API_ENDPOINTS.BASE_URL}/commandes`, getAuthHeader()),
    getCommandeById: (id) => axios.get(`${API_ENDPOINTS.BASE_URL}/commandes/${id}`, getAuthHeader()),
    createCommande: (data) => axios.post(`${API_ENDPOINTS.BASE_URL}/commandes`, data, getAuthHeader()),
    updateCommande: (id, data) => axios.put(`${API_ENDPOINTS.BASE_URL}/commandes/${id}`, data, getAuthHeader()),
    deleteCommande: (id) => axios.delete(`${API_ENDPOINTS.BASE_URL}/commandes/${id}`, getAuthHeader()),
    getUserCommandes: () => axios.get(`${API_ENDPOINTS.BASE_URL}/commandes/user`, getAuthHeader()),
    updateCommandeStatus: (id, etat) => axios.put(`${API_ENDPOINTS.BASE_URL}/commandes/${id}/status`, { etat }, getAuthHeader()),
    getCommandesByStatus: (status) => axios.get(`${API_ENDPOINTS.BASE_URL}/commandes/status/${status}`, getAuthHeader()),
    getCommandesByDateRange: (startDate, endDate) => axios.get(`${API_ENDPOINTS.BASE_URL}/commandes/date-range`, {
        params: { startDate, endDate },
        ...getAuthHeader()
    }),
};

// Services pour les réclamations
export const reclamationService = {
    getAllReclamations: () => axios.get(`${API_ENDPOINTS.BASE_URL}/reclamations`, getAuthHeader()),
    getReclamationById: (id) => axios.get(`${API_ENDPOINTS.BASE_URL}/reclamations/${id}`, getAuthHeader()),
    createReclamation: (data) => axios.post(`${API_ENDPOINTS.BASE_URL}/reclamations`, data, getAuthHeader()),
    updateReclamation: (id, data) => axios.put(`${API_ENDPOINTS.BASE_URL}/reclamations/${id}`, data, getAuthHeader()),
    deleteReclamation: (id) => axios.delete(`${API_ENDPOINTS.BASE_URL}/reclamations/${id}`, getAuthHeader()),
    getUserReclamations: () => axios.get(`${API_ENDPOINTS.BASE_URL}/reclamations/user`, getAuthHeader()),
    updateReclamationStatus: (id, etat) => axios.put(`${API_ENDPOINTS.BASE_URL}/reclamations/${id}/status`, { etat }, getAuthHeader()),
};

// Services pour les stations
export const stationService = {
    getAllStations: () => axios.get(`${API_ENDPOINTS.BASE_URL}/stations`, getAuthHeader()),
    getStationById: (id) => axios.get(`${API_ENDPOINTS.BASE_URL}/stations/${id}`, getAuthHeader()),
    createStation: (data) => axios.post(`${API_ENDPOINTS.BASE_URL}/stations`, data, getAuthHeader()),
    updateStation: (id, data) => axios.put(`${API_ENDPOINTS.BASE_URL}/stations/${id}`, data, getAuthHeader()),
    deleteStation: (id) => axios.delete(`${API_ENDPOINTS.BASE_URL}/stations/${id}`, getAuthHeader()),
};

// Services pour les produits
export const produitService = {
    getAllProduits: () => axios.get(`${API_ENDPOINTS.BASE_URL}/products`, getAuthHeader()),
    getProduitById: (id) => axios.get(`${API_ENDPOINTS.BASE_URL}/products/${id}`, getAuthHeader()),
    createProduit: (data) => axios.post(`${API_ENDPOINTS.BASE_URL}/products`, data, getAuthHeader()),
    updateProduit: (id, data) => axios.put(`${API_ENDPOINTS.BASE_URL}/products/${id}`, data, getAuthHeader()),
    deleteProduit: (id) => axios.delete(`${API_ENDPOINTS.BASE_URL}/products/${id}`, getAuthHeader()),
};

// Services pour les utilisateurs
export const userService = {
    getCurrentUser: () => axios.get(`${API_ENDPOINTS.BASE_URL}/users/me`, getAuthHeader()),
    getAllUsers: () => axios.get(`${API_ENDPOINTS.BASE_URL}/users`, getAuthHeader()),
    getUserById: (id) => axios.get(`${API_ENDPOINTS.BASE_URL}/users/${id}`, getAuthHeader()),
    updateUser: (id, data) => axios.put(`${API_ENDPOINTS.BASE_URL}/users/${id}`, data, getAuthHeader()),
    deleteUser: (id) => axios.delete(`${API_ENDPOINTS.BASE_URL}/users/${id}`, getAuthHeader()),
};
