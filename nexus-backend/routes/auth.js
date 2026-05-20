const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- ROUTE 1: USER REGISTRATION (SIGN UP) ---
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Check if the email is already registered
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'This email is already registered.' });
        }

        // 2. Scramble (hash) the password so it's safe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save the new user into the database
        user = new User({
            name,
            email,
            password: hashedPassword,
            role
        });
        await user.save();

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
});

// --- ROUTE 2: USER LOGIN ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Look for the user by their email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Email or Password.' });
        }

        // 2. Compare the typed password with the scrambled one in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Email or Password.' });
        }

        // 3. Generate a digital "boarding pass" (JWT Token)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Expires in 1 day
        );

        // 4. Send the token back to the frontend
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});

module.exports = router;