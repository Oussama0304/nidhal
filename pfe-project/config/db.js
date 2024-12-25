const mysql = require('mysql');

// Determine if we're running in Docker
const isDocker = process.env.NODE_ENV === 'production';

// Configuration de la base de données
const dbConfig = {
    host: isDocker ? 'mysql' : 'localhost',
    user: process.env.DB_USER || 'root',
    password: isDocker ? 'root_password' : '',
    database: process.env.DB_NAME || 'ProjetPfeAgil',
    connectionLimit: 10,
    connectTimeout: 60000
};

console.log('Database Configuration:', {
    ...dbConfig,
    password: dbConfig.password ? '****' : 'none'
});

const db = mysql.createPool(dbConfig);

// Fonction pour ajouter la colonne idUtilisateur si elle n'existe pas
const addUserIdColumn = () => {
    const checkColumnQuery = `
        SELECT COUNT(*) as count 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = ? 
        AND COLUMN_NAME = ?
    `;

    db.query(checkColumnQuery, ['ProjetPfeAgil', 'Commande', 'idUtilisateur'], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification de la colonne :', err);
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
                    console.error('Erreur lors de l\'ajout de la colonne :', err);
                } else {
                    console.log('Colonne idUtilisateur ajoutée avec succès');
                }
            });
        } else {
            console.log('La colonne idUtilisateur existe déjà.');
        }
    });
};

// Vérifier la connexion et exécuter la fonction
db.getConnection((err, connection) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }

    console.log('Connecté à la base de données MySQL');
    connection.release();

    // Appeler la fonction pour ajouter la colonne
    addUserIdColumn();
});

module.exports = db;
