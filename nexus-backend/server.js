const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); 
const { Server } = require('socket.io'); 

const authRoutes = require('./routes/auth');
const meetingRoutes = require('./routes/meetings'); 
const documentRoutes = require('./routes/documents'); 
dotenv.config();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

app.use(cors()); 
app.use(express.json()); 

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes); 
app.use('/api/documents', documentRoutes); 
app.get('/', (req, res) => {
    res.send('The Nexus Backend Control Center + WebSockets is up and running!');
});

io.on('connection', (socket) => {
    console.log(`🔌 User connected to socket space: ${socket.id}`);

    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        console.log(`👤 User ${userId} joined room: ${roomId}`);
        
        socket.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
            console.log(`❌ User ${userId} disconnected from socket`);
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });

    socket.on('video-offer', (data) => {
        socket.to(data.roomId).emit('video-offer', data.sdp);
    });

    socket.on('video-answer', (data) => {
        socket.to(data.roomId).emit('video-answer', data.sdp);
    });

    socket.on('new-ice-candidate', (data) => {
        socket.to(data.roomId).emit('new-ice-candidate', data.candidate);
    });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🚀 Boom! Connected to MongoDB Atlas smoothly.'))
    .catch((err) => console.error('❌ Database connection error details:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`📡 Server actively listening on port ${PORT}`);
});