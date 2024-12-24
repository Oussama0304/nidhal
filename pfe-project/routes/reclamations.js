const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configuration de Multer pour le stockage des images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reclamations')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // limite à 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Get all reclamations
router.get('/', auth, (req, res) => {
    const query = `
        SELECT r.*, 
               u1.nom as nom_gerant, u1.prenom as prenom_gerant,
               u2.nom as nom_commercial, u2.prenom as prenom_commercial
        FROM Reclamation r
        LEFT JOIN Utilisateur u1 ON r.idGerant = u1.identifiant
        LEFT JOIN Utilisateur u2 ON r.idCommercial = u2.identifiant
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur SQL GET all:', err);
            return res.status(500).json({ error: "Erreur lors de la récupération des réclamations" });
        }
        res.json(results);
    });
});

// Get reclamations for current user
router.get('/user', auth, (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    console.log('User ID from token:', userId, 'Role:', userRole);
    
    let query = `
        SELECT r.*, 
               u1.nom as nom_gerant, u1.prenom as prenom_gerant,
               u2.nom as nom_commercial, u2.prenom as prenom_commercial
        FROM Reclamation r
        LEFT JOIN Utilisateur u1 ON r.idGerant = u1.identifiant
        LEFT JOIN Utilisateur u2 ON r.idCommercial = u2.identifiant
        WHERE 1=0
    `;
    
    const queryParams = [];
    
    // Adapter la requête en fonction du rôle
    if (userRole === 'GERANT') {
        query = query.replace('WHERE 1=0', 'WHERE r.idGerant = ?');
        queryParams.push(userId);
    } else if (userRole === 'COMMERCIAL') {
        query = query.replace('WHERE 1=0', 'WHERE r.idCommercial = ?');
        queryParams.push(userId);
    } else if (userRole === 'ADMIN') {
        query = query.replace('WHERE 1=0', 'WHERE 1=1'); // Voir toutes les réclamations
    }
    
    query += ' ORDER BY r.date DESC';
    
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Erreur SQL GET user reclamations:', err);
            return res.status(500).json({ error: "Erreur lors de la récupération des réclamations de l'utilisateur" });
        }
        console.log('Réclamations trouvées:', results.length);
        res.json(results);
    });
});

// Create new reclamation
router.post('/', auth, upload.single('image'), (req, res) => {
    const { description, type, idGerant } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!description || !type || !idGerant) {
        return res.status(400).json({ error: "Tous les champs requis doivent être remplis" });
    }

    const imageUrl = req.file ? `/uploads/reclamations/${req.file.filename}` : null;

    const query = `
        INSERT INTO Reclamation 
        (description, type, idGerant, idCommercial, date, etat, image_url) 
        VALUES (?, ?, ?, ?, NOW(), 'En instance', ?)
    `;

    db.query(query, [description, type, idGerant, userRole === 'COMMERCIAL' ? userId : null, imageUrl], (err, result) => {
        if (err) {
            console.error('Erreur SQL INSERT:', err);
            return res.status(500).json({ error: "Erreur lors de la création de la réclamation" });
        }

        const getNewReclamationQuery = `
            SELECT r.*, 
                   u1.nom as nom_gerant, u1.prenom as prenom_gerant,
                   u2.nom as nom_commercial, u2.prenom as prenom_commercial
            FROM Reclamation r
            LEFT JOIN Utilisateur u1 ON r.idGerant = u1.identifiant
            LEFT JOIN Utilisateur u2 ON r.idCommercial = u2.identifiant
            WHERE r.idReclamation = ?
        `;

        db.query(getNewReclamationQuery, [result.insertId], (err, reclamation) => {
            if (err) {
                console.error('Erreur lors de la récupération de la nouvelle réclamation:', err);
                return res.status(201).json({ message: "Réclamation créée avec succès", id: result.insertId });
            }
            res.status(201).json({ 
                message: "Réclamation créée avec succès",
                id: result.insertId,
                reclamation: reclamation[0]
            });
        });
    });
});

// Get reclamation by ID
router.get('/:id', auth, (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const query = `
        SELECT r.*, 
               u1.nom as nom_gerant, u1.prenom as prenom_gerant,
               u2.nom as nom_commercial, u2.prenom as prenom_commercial
        FROM Reclamation r
        LEFT JOIN Utilisateur u1 ON r.idGerant = u1.identifiant
        LEFT JOIN Utilisateur u2 ON r.idCommercial = u2.identifiant
        WHERE r.idReclamation = ? 
        AND (
            r.idGerant = ? 
            OR r.idCommercial = ? 
            OR ? IN (SELECT identifiant FROM Utilisateur WHERE roles = 'ADMIN')
        )
    `;
    
    db.query(query, [req.params.id, userId, userId, userId], (err, results) => {
        if (err) {
            console.error('Erreur SQL GET by ID:', err);
            return res.status(500).json({ error: "Erreur lors de la récupération de la réclamation" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Réclamation non trouvée ou accès non autorisé" });
        }
        res.json(results[0]);
    });
});

// Update reclamation status
router.put('/:id/status', auth, (req, res) => {
    const { etat } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Vérifier que l'état est valide
    const etatsValides = ['En instance', 'En cours', 'Validée'];
    if (!etatsValides.includes(etat)) {
        return res.status(400).json({ error: "État invalide" });
    }
    
    // Vérifier les permissions
    const checkQuery = `
        SELECT * FROM Reclamation 
        WHERE idReclamation = ? 
        AND (
            idGerant = ? 
            OR idCommercial = ?
            OR ? IN (SELECT identifiant FROM Utilisateur WHERE roles = 'ADMIN')
            OR ? IN (SELECT identifiant FROM Utilisateur WHERE roles = 'COMMERCIAL')
        )
    `;
    
    db.query(checkQuery, [req.params.id, userId, userId, userId, userId], (err, results) => {
        if (err) {
            console.error('Erreur SQL check permission:', err);
            return res.status(500).json({ error: "Erreur lors de la vérification des permissions" });
        }
        
        if (results.length === 0) {
            return res.status(403).json({ error: "Non autorisé à modifier cette réclamation" });
        }
        
        const updateQuery = 'UPDATE Reclamation SET etat = ? WHERE idReclamation = ?';
        db.query(updateQuery, [etat, req.params.id], (err, result) => {
            if (err) {
                console.error('Erreur SQL UPDATE status:', err);
                return res.status(500).json({ error: "Erreur lors de la mise à jour du statut" });
            }
            res.json({ message: "Statut mis à jour avec succès" });
        });
    });
});

module.exports = router;
