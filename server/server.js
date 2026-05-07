const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');
const adminRoutes = require('./routes/admin');
const { initSocket } = require('./socket/bidSocket');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Auction Platform API Running', status: 'OK' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Socket.IO
initSocket(io);

// MongoDB with retry + degraded mode
let dbConnected = false;
const PORT = process.env.PORT || 5000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startServer() {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    if (!dbConnected) {
      console.warn('⚠️  Running in degraded mode: MongoDB not connected. API routes will return 503.');
    }
  });
}

// Block API routes when DB is not connected to avoid uncaught model errors
app.use('/api', (req, res, next) => {
  if (!dbConnected) {
    return res.status(503).json({
      message: 'Service temporarily unavailable: database not connected',
      details: 'If deployed on Render, ensure MongoDB Atlas allows connections from Render (add IP whitelist or use 0.0.0.0/0 for testing).',
    });
  }
  next();
});

async function connectWithRetry(retries = 5, delay = 5000) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    dbConnected = true;
    console.log('✅ MongoDB Connected');
    await startServer();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    if (retries > 0) {
      console.log(`Retrying MongoDB connection in ${delay / 1000}s... (${retries} attempts left)`);
      await sleep(delay);
      return connectWithRetry(retries - 1, delay * 2);
    }

    console.error('Failed to connect to MongoDB after retries. Starting server in degraded mode.');
    console.error('Recommendation: In Atlas Network Access add Render IPs or temporarily allow 0.0.0.0/0.');
    await startServer();
  }
}

// Start the connect attempts (will start server even if DB fails after retries)
connectWithRetry();

module.exports = { app, io };
