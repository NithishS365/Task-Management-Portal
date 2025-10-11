import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware - Request:', req.method, req.url);
    
    const authHeader = req.header('Authorization');
    console.log('🔐 Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.'
      });
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      console.log('❌ Empty token');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // ✅ VERIFY JWT_SECRET EXISTS
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    console.log('🔐 Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified for user:', decoded.userId);

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Token is not valid - user not found'
      });
    }

    if (!user.isActive) {
      console.log('❌ User account inactive:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // ✅ NORMALIZE USER OBJECT
    req.user = {
      userId: user._id.toString(),
      _id: user._id.toString(),
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    };

    console.log('✅ User authenticated:', user.name);
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }}

  export default auth;