const mysql = require('mysql');

const db = mysql.createPool({
    host: process.env.DB_HOST || 'mysql',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root_password',
    database: process.env.DB_NAME || 'ProjetPfeAgil',
    connectionLimit: 10,
    connectTimeout: 60000
});

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
