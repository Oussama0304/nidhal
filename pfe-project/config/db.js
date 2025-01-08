require("dotenv").config(); // Charger les variables d'environnement

const mysql = require('mysql');

// Configuration de la connexion avec des variables d'environnement
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', // Hôte par défaut : localhost
    user: process.env.DB_USER || 'root', // Utilisateur par défaut : root
    password: process.env.DB_PASSWORD || '', // Mot de passe par défaut : vide
    database: process.env.DB_NAME || 'ProjetPfeAgil', // Nom de la base par défaut : ProjetPfeAgil
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10 // Limite des connexions
});

// Ajouter la colonne idUtilisateur si elle n'existe pas
const addUserIdColumn = () => {
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Erreur de connexion à la base de données:', err);
            return;
        }

        const checkColumnQuery = `
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
            AND TABLE_NAME = 'Commande' 
            AND COLUMN_NAME = 'idUtilisateur'
        `;

        connection.query(checkColumnQuery, (err, results) => {
            connection.release();
            if (err) {
                console.error('Erreur lors de la vérification de la colonne:', err);
                return;
            }

            if (results[0].count === 0) {
                const alterTableQuery = `
                    ALTER TABLE Commande
                    ADD COLUMN idUtilisateur BIGINT,
                    ADD CONSTRAINT fk_commande_utilisateur
                    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(identifiant)
                `;

                db.query(alterTableQuery, (err) => {
                    if (err) {
                        console.error('Erreur lors de l\'ajout de la colonne:', err);
                    } else {
                        console.log('Colonne idUtilisateur ajoutée avec succès');
                    }
                });
            }
        });
    });
};

// Vérifier la connexion
db.getConnection((err, connection) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
    connection.release();
    addUserIdColumn();
});

module.exports = db;
