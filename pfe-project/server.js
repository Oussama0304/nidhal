require("dotenv").config();
const express = require('express');
const mysql = require('mysql'); // changed from 'localhost'
const cors = require('cors');
const bodyParser = require('body-parser');
const auth = require('./middleware/auth');
const http = require('http');
const path = require('path');
const waitForMysql = require('./wait-for-mysql.js');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3001",
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../pffe-project-front/build')));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Un client est connecté');
  socket.on('disconnect', () => {
    console.log('Un client est déconnecté');
  });
});

// Database connection setup
const db = mysql.createPool({
  host: process.env.DB_HOST || 'mysqldb',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'my-secret-pw',
  database: process.env.DB_NAME || 'ProjetPfeAgil',
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  connectTimeout: 60000
});

// Test database connection
const testDbConnection = async () => {
  return new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) {
        console.error('Database connection error:', err);
        reject(err);
        return;
      }
      console.log('Successfully connected to database');
      connection.release();
      resolve();
    });
  });
};

// Retry database connection
const retryDbConnection = async (maxRetries = 5) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await testDbConnection();
      return true;
    } catch (err) {
      console.log(`Failed to connect to database. Attempt ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  return false;
};

// Route de test pour la base de données
app.get('/test-db', async (req, res) => {
  try {
    await waitForMysql();
    db.query('SELECT 1 + 1 AS solution', (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de connexion à la base de données', details: err });
      }
      res.json({ message: 'Connexion réussie', solution: results[0].solution });
    });
  } catch (err) {
    res.status(500).json({ error: 'La base de données n\'est pas prête', details: err.message });
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const commandeRoutes = require('./routes/commandes');
const reclamationRoutes = require('./routes/reclamations');
const userRoutes = require('./routes/users');
const stationRoutes = require('./routes/stations');
const productRoutes = require('./routes/products');
const dashboardRoutes = require('./routes/admin/dashboard');
const exportRoutes = require('./routes/exportRoutes');

// Route de base pour tester
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/commandes', auth, commandeRoutes);
app.use('/api/reclamations', auth, reclamationRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/stations', auth, stationRoutes);
app.use('/api/products', auth, productRoutes);
app.use('/api/admin/dashboard', auth, dashboardRoutes);
app.use('/api', auth, exportRoutes);

// Catch-all route handler for client-side routing
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '../pffe-project-front/build/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: err.message || 'Une erreur est survenue' });
});

// Export pour utilisation dans d'autres fichiers
app.set('io', io);

// Start server only after database is ready
const startServer = async () => {
  try {
    const dbConnected = await retryDbConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database after maximum retries');
    }

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Environment variables:');
      console.log('DB_HOST:', process.env.DB_HOST);
      console.log('CLIENT_ORIGIN:', process.env.CLIENT_ORIGIN);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
