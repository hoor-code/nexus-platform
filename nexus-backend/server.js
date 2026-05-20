const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import the authentication routes we just created
const authRoutes = require('./routes/auth');

// Initialize environment variables from your hidden .env file
dotenv.config();

const app = express();

// Safety rules (Middleware)
app.use(cors()); // Allows frontend to make requests here securely
app.use(express.json()); // Allows the server to read incoming JSON text

// Connect our custom routes
app.use('/api/auth', authRoutes);

// Quick test route to open in your browser
app.get('/', (req, res) => {
    res.send('The Nexus Backend Control Center is up and running!');
});

// Connect to the Cloud Database (MongoDB Atlas)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🚀 Boom! Connected to MongoDB Atlas smoothly.'))
    .catch((err) => console.error('❌ Database connection error details:', err));

// Start the actual engine listening for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📡 Server actively listening on port ${PORT}`);
});