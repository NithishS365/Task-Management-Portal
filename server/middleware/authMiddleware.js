const User = require('../models/User');

/**
 * Authentication middleware to verify JWT token and set req.user
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // For now, extract user ID from token (simplified - in production use JWT)
    if (token.startsWith('jwt-token-placeholder-')) {
      const userId = token.replace('jwt-token-placeholder-', '');
      
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token - user not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      req.user = {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
        department: user.department
      };
      
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token validation failed'
    });
  }
};

/**
 * Role-based authorization middleware
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

/**
 * HOD only middleware
 */
const requireHOD = (req, res, next) => {
  return requireRole(['hod'])(req, res, next);
};

/**
 * Faculty only middleware
 */
const requireFaculty = (req, res, next) => {
  return requireRole(['faculty'])(req, res, next);
};

module.exports = {
  authMiddleware,
  requireRole,
  requireHOD,
  requireFaculty
};