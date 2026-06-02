const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); // Native Node.js HTTP module
const { Server } = require('socket.io'); // Socket.io engine for WebRTC

// Import our API routers
const authRoutes = require('./routes/auth');
const meetingRoutes = require('./routes/meetings'); 
const documentRoutes = require('./routes/documents'); // Imported Document Routes

// Initialize environment variables from your hidden .env file
dotenv.config();

const app = express();

// Create an HTTP Server wrapper around Express (Required for Socket.io)
const server = http.createServer(app);

// Initialize Socket.io with secure CORS configurations
const io = new Server(server, {
    cors: {
        origin: "*", // Allows your React/TypeScript frontend to connect securely
        methods: ["GET", "POST"]
    }
});

// Safety rules (Middleware)
app.use(cors()); // Allows frontend to make requests here securely
app.use(express.json()); // Allows the server to read incoming JSON text

// Make the uploads folder publicly accessible via static paths
app.use('/uploads', express.static('uploads'));

// Connect our custom API routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes); 
app.use('/api/documents', documentRoutes); // Mounted Document processing routes

// Quick test route to open in your browser
app.get('/', (req, res) => {
    res.send('The Nexus Backend Control Center + WebSockets is up and running!');
});

// --- WebRTC Socket.io Signaling Orchestration ---
io.on('connection', (socket) => {
    console.log(`🔌 User connected to socket space: ${socket.id}`);

    // User enters a specific collaboration call chamber
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        console.log(`👤 User ${userId} joined room: ${roomId}`);
        
        // Let other people in that room know a new peer connected
        socket.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
            console.log(`❌ User ${userId} disconnected from socket`);
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });

    // Relay WebRTC Connection Offers
    socket.on('video-offer', (data) => {
        socket.to(data.roomId).emit('video-offer', data.sdp);
    });

    // Relay WebRTC Connection Answers
    socket.on('video-answer', (data) => {
        socket.to(data.roomId).emit('video-answer', data.sdp);
    });

    // Relay Network Routing Path Candidates (ICE)
    socket.on('new-ice-candidate', (data) => {
        socket.to(data.roomId).emit('new-ice-candidate', data.candidate);
    });
});

// Connect to the Cloud Database (MongoDB Atlas)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🚀 Boom! Connected to MongoDB Atlas smoothly.'))
    .catch((err) => console.error('❌ Database connection error details:', err));

// Start the actual combined HTTP & WebSocket engine listening for requests
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`📡 Server actively listening on port ${PORT}`);
});