// server/routes/auth.js - Enhanced version with better error handling
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  console.log('📝 Registration attempt:', req.body.email);
  
  try {
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Check if user exists
    console.log('🔍 Checking if user exists...');
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    
    if (userExists.rows.length > 0) {
      console.log('❌ User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    console.log('👤 Creating user...');
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );
    
    console.log('✅ User created successfully:', newUser.rows[0].id);
    
    // Generate JWT
    console.log('🎫 Generating JWT...');
    const token = jwt.sign(
      { userId: newUser.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Registration completed successfully');
    res.status(201).json({
      token,
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Check for specific database errors
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ message: 'Email or username already exists' });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(500).json({ message: 'Database connection failed' });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
    
    res.status(500).json({ message: 'Server error', error: error.message });

  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('🔐 Login attempt:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    console.log('🔍 Finding user...');
    const user = await pool.query(
      'SELECT id, username, email, password FROM users WHERE email = $1',
      [email]
    );
    
    if (user.rows.length === 0) {
      console.log('❌ User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    console.log('🔐 Checking password...');
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    
    if (!validPassword) {
      console.log('❌ Invalid password');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    console.log('🎫 Generating JWT...');
    const token = jwt.sign(
      { userId: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful');
    res.json({
      token,
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;