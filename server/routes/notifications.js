import express from 'express';
import  auth  from '../middleware/auth.js';

const router = express.Router();

// ✅ MOCK NOTIFICATION DATA FOR TESTING
const mockNotifications = [
  {
    _id: '1',
    title: 'Welcome to Task Management',
    message: 'Your account has been successfully created.',
    type: 'info',
    read: false,
    createdAt: new Date(),
    userId: null // Will be set dynamically
  },
  {
    _id: '2',
    title: 'New Task Assigned',
    message: 'You have been assigned a new task.',
    type: 'task',
    read: false,
    createdAt: new Date(),
    userId: null // Will be set dynamically
  }
];

// ✅ GET CURRENT USER'S NOTIFICATIONS
router.get('/me', auth, async (req, res) => {
  try {
    console.log('📡 Getting notifications for user:', req.user.name);
    
    const userId = req.user.userId;
    
    // ✅ FOR NOW, RETURN MOCK DATA
    // TODO: Replace with actual database query when Notification model is ready
    const userNotifications = mockNotifications.map(notification => ({
      ...notification,
      userId: userId
    }));

    console.log(`✅ Returning ${userNotifications.length} notifications`);

    res.json({
      success: true,
      notifications: userNotifications,
      count: userNotifications.length
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// ✅ MARK NOTIFICATION AS READ
router.put('/:notificationId/read', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    console.log('📡 Marking notification as read:', notificationId);
    
    // TODO: Update notification in database
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('❌ Error updating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification'
    });
  }
});

export default router;