require("dotenv").config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const auth = require('./middleware/auth');
const http = require('http');
const path = require('path');

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
  password: process.env.DB_PASSWORD || '',
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

// Start server on configured port
const PORT = process.env.NODE_DOCKER_PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
