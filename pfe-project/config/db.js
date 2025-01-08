const mysql = require('mysql');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'mysqldb',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'my-secret-pw',
  database: process.env.DB_NAME || 'ProjetPfeAgil',
  connectionLimit: 10
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
  connection.release();
});

module.exports = db;
