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
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3001",  // Frontend origin (React app)
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:8081", // Peut être ajusté selon l'origin de votre frontend
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
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ProjetPfeAgil'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
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

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (with auth middleware)
app.use('/api/commandes', auth, commandeRoutes);
app.use('/api/reclamations', auth, reclamationRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/stations', auth, stationRoutes);
app.use('/api/products', auth, productRoutes);
app.use('/api/admin/dashboard', auth, dashboardRoutes);
app.use('/api', auth, exportRoutes);

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: err.message || 'Une erreur est survenue' });
});

// Export for testing or usage in other files
app.set('io', io);

// Start server on configured port
const PORT = process.env.NODE_DOCKER_PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
