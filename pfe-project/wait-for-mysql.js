const mysql = require('mysql');

const dbConfig = {
  host: process.env.DB_HOST || 'mysqldb',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'my-secret-pw',
  database: process.env.DB_NAME || 'ProjetPfeAgil',
};

const checkMySQLConnection = () => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(dbConfig);
    connection.connect((err) => {
      if (err) {
        console.log('MySQL non prêt, tentative de reconnexion dans 5 secondes...');
        setTimeout(() => checkMySQLConnection().then(resolve).catch(reject), 5000);
      } else {
        console.log('MySQL est prêt !');
        connection.end();
        resolve();
      }
    });
  });
};

// Exporter la fonction
module.exports = checkMySQLConnection;

// Si exécuté directement (pas importé comme module)
if (require.main === module) {
  checkMySQLConnection().then(() => process.exit(0)).catch(() => process.exit(1));
}
