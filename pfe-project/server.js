require("dotenv").config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const auth = require('./middleware/auth'); // Si nécessaire, sinon retirez cette ligne
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:80",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:80",
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
  connectionLimit: 10
});

// Vérification de la connexion
db.getConnection((err, connection) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
  connection.release();
});

// API Routes
app.use('/api', require('./routes/api'));

// Définir une route pour '/'
app.get('/', (req, res) => {
  res.send('Bienvenue sur le serveur Node.js pour le projet PFE.');
});

// Tester la connexion à la base de données
app.get('/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de connexion à la base de données', details: err });
    }
    res.json({ message: 'Connexion réussie', solution: results[0].solution });
  });
});

// Start server on configured port
const PORT = process.env.NODE_DOCKER_PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
