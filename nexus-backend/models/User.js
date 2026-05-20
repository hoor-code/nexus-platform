const mongoose = require('mongoose');

// This is the blueprint for a user account
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Investor', 'Entrepreneur'], required: true },
    
    // Extended profile details (blank by default, filled out later)
    bio: { type: String, default: '' },
    history: { type: String, default: '' }, 
    preferences: { type: String, default: '' }
}, { timestamps: true }); // Automatically tracks when the user registered

module.exports = mongoose.model('User', UserSchema);