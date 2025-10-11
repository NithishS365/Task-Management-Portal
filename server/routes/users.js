import express from 'express';
import User from '../models/User.js';
import auth  from '../middleware/auth.js';

const router = express.Router();

// ✅ GET ALL USERS (Protected route)
router.get('/', auth, async (req, res) => {
  try {
    console.log('📡 Getting all users, requested by:', req.user.name);
    
    // ✅ CHECK USER PERMISSIONS
    if (req.user.role !== 'admin' && req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view all users'
      });
    }

    const users = await User.find()
      .select('-password')
      .sort({ name: 1 });
    
    console.log(`✅ Found ${users.length} users`);

    res.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// ✅ GET USER BY ID (Protected route)
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user.userId;
    
    console.log('📡 Getting user by ID:', id);
    
    // ✅ AUTHORIZATION CHECK
    const canView = (
      id === requestingUserId ||
      req.user.role === 'admin' ||
      req.user.role === 'hod'
    );

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user'
      });
    }

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User found:', user.name);

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// ✅ GET USERS BY ROLE (For task assignment)
router.get('/role/:role', auth, async (req, res) => {
  try {
    const { role } = req.params;
    
    console.log('📡 Getting users by role:', role);
    
    // ✅ AUTHORIZATION CHECK
    if (req.user.role !== 'admin' && req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view users by role'
      });
    }

    const users = await User.find({ role })
      .select('-password')
      .sort({ name: 1 });
    
    console.log(`✅ Found ${users.length} users with role: ${role}`);

    res.json({
      success: true,
      users,
      role,
      count: users.length
    });
  } catch (error) {
    console.error('❌ Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users by role'
    });
  }
});

// ✅ GET USERS BY DEPARTMENT (For task assignment)
router.get('/department/:department', auth, async (req, res) => {
  try {
    const { department } = req.params;
    
    console.log('📡 Getting users by department:', department);
    
    // ✅ AUTHORIZATION CHECK
    if (req.user.role !== 'admin' && req.user.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view department users'
      });
    }

    const users = await User.find({ department })
      .select('-password')
      .sort({ name: 1 });
    
    console.log(`✅ Found ${users.length} users in ${department} department`);

    res.json({
      success: true,
      users,
      department,
      count: users.length
    });
  } catch (error) {
    console.error('❌ Get users by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department users'
    });
  }
});

// ✅ UPDATE USER PROFILE
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user.userId;
    const updateData = req.body;
    
    console.log('📡 Updating user:', id);
    
    // ✅ AUTHORIZATION CHECK
    const canUpdate = (
      id === requestingUserId ||
      req.user.role === 'admin' ||
      req.user.role === 'hod'
    );

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    // ✅ SANITIZE UPDATE DATA
    const { password, ...safeUpdateData } = updateData;
    
    // ✅ ONLY ADMIN CAN UPDATE ROLE
    if (updateData.role && req.user.role !== 'admin') {
      delete safeUpdateData.role;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { ...safeUpdateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User updated:', user.name);

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
});

export default router;