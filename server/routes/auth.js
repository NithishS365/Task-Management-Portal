import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// ✅ LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt received:', {
      email: req.body.email,
      hasPassword: !!req.body.password,
      timestamp: new Date().toISOString()
    });

    const { email, password } = req.body;

    // ✅ VALIDATE INPUT
    if (!email || !password) {
      console.log('❌ Missing email/username or password');
      return res.status(400).json({
        success: false,
        message: 'Email/username and password are required'
      });
    }

    // ✅ FIND USER BY EMAIL OR USERNAME
    console.log('🔍 Looking for user with email/username:', email);
    const user = await User.findByEmailOrUsername(email);
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password'
      });
    }

    console.log('✅ User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });

    // ✅ CHECK IF USER IS ACTIVE
    if (!user.isActive) {
      console.log('❌ User account is inactive:', email);
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // ✅ CHECK PASSWORD
    console.log('🔐 Verifying password for user:', user.email);
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password'
      });
    }

    console.log('✅ Password verified successfully');

    // ✅ CHECK JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // ✅ GENERATE JWT TOKEN
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ JWT token generated successfully');

    // ✅ UPDATE LAST LOGIN
    user.lastLogin = new Date();
    await user.save();

    // ✅ PREPARE USER DATA (EXCLUDE PASSWORD)
    const userData = {
      _id: user._id,
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      profilePicture: user.profilePicture
    };

    console.log('✅ Login successful for:', {
      id: userData._id,
      name: userData.name,
      role: userData.role
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    
    // ✅ HANDLE SPECIFIC ERRORS
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data'
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ REGISTER ROUTE (FOR TESTING)
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Register attempt:', req.body.email);

    const { name, username, email, password, role, department } = req.body;

    // ✅ VALIDATE INPUT
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, username, email, and password are required'
      });
    }

    // ✅ CHECK IF USER EXISTS BY EMAIL OR USERNAME
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });
    
    if (existingUser) {
      const field = existingUser.email.toLowerCase() === email.toLowerCase() ? 'email' : 'username';
      return res.status(400).json({
        success: false,
        message: `User already exists with this ${field}`
      });
    }

    // ✅ CREATE NEW USER
    const user = new User({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role: role || 'faculty',
      department: department || 'General',
      isActive: true
    });

    await user.save();

    console.log('✅ User registered successfully:', user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
});

export default router;