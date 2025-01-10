const mysql = require('mysql');

// Fonction pour vérifier si la base de données est prête
function waitForMysql(dbPool, retries = 5, delay = 5000) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      dbPool.getConnection((err, connection) => {
        if (err) {
          console.log('Erreur de connexion à la base de données, nouvelle tentative...');
          if (retries > 0) {
            setTimeout(() => {
              waitForMysql(dbPool, retries - 1, delay).then(resolve).catch(reject);
            }, delay);
          } else {
            reject(new Error('MySQL n\'est toujours pas prêt après plusieurs tentatives.'));
          }
        } else {
          connection.release();
          resolve('MySQL est prêt');
        }
      });
    };

    attempt();
  });
}

module.exports = waitForMysql;
