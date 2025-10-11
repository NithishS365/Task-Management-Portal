import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Notification from '../models/Notification.js'; // ✅ ADD THIS

let io;
const connectedUsers = new Map();

// ✅ HELPER FUNCTION TO CREATE AND SAVE NOTIFICATION
export const createNotification = async (userId, notificationData) => {
  try {
    const notification = new Notification({
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'system',
      userId: userId,
      data: notificationData.data || null,
      read: false
    });
    
    await notification.save();
    console.log('💾 Notification saved to database:', notification._id);
    
    return notification;
  } catch (error) {
    console.error('❌ Error saving notification to database:', error);
    return null;
  }
};

// ✅ HELPER FUNCTION TO SEND NOTIFICATION TO USER WITH DATABASE SAVE
export const sendNotificationToUser = async (userId, notificationData) => {
  try {
    console.log(`📤 Sending notification to user ${userId}:`, notificationData.title);
    
    // ✅ 1. SAVE TO DATABASE FIRST
    const savedNotification = await createNotification(userId, notificationData);
    
    if (!savedNotification) {
      console.error('❌ Failed to save notification to database');
      return false;
    }

    // ✅ 2. EMIT VIA SOCKET.IO IMMEDIATELY
    if (io) {
      console.log(`📡 Emitting real-time notification to user_${userId}`);
      
      // Emit to user's room
      io.to(`user_${userId}`).emit('newNotification', savedNotification);
      
      // Also emit to all sessions of this user
      const userConnections = Array.from(connectedUsers.entries())
        .filter(([id, data]) => id === userId.toString());
      
      userConnections.forEach(([id, data]) => {
        io.to(data.socketId).emit('newNotification', savedNotification);
      });
      
      console.log(`✅ Notification emitted to ${userConnections.length} connection(s) for user ${userId}`);
      return true;
    } else {
      console.error('❌ Socket.io not initialized - notification saved to database only');
      return true; // Still success, saved to DB
    }
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return false;
  }
};

// ✅ HELPER FUNCTION TO SEND TASK ASSIGNMENT NOTIFICATION
export const sendTaskAssignmentNotification = async (task, assignedUserId, createdByUser) => {
  const notificationData = {
    title: 'New Task Assigned',
    message: `You have been assigned: "${task.title}" by ${createdByUser.name}`,
    type: 'task_assigned',
    data: {
      taskId: task._id,
      taskTitle: task.title,
      taskDescription: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      category: task.category,
      createdBy: {
        id: createdByUser._id,
        name: createdByUser.name,
        email: createdByUser.email
      }
    }
  };

  const success = await sendNotificationToUser(assignedUserId, notificationData);
  
  // ✅ ALSO EMIT TASK ASSIGNMENT EVENT
  if (io && success) {
    io.to(`user_${assignedUserId}`).emit('taskAssigned', {
      task,
      assignedBy: createdByUser,
      notification: notificationData
    });
    console.log(`📝 Task assignment event emitted to user ${assignedUserId}`);
  }
  
  return success;
};

// ✅ HELPER FUNCTION TO SEND TASK UPDATE NOTIFICATION
export const sendTaskUpdateNotification = async (task, targetUserId, action = 'updated', updatedByUser) => {
  const actionMessages = {
    'accepted': 'accepted',
    'rejected': 'rejected',
    'completed': 'completed',
    'in-progress': 'started',
    'pending': 'updated'
  };
  
  const actionText = actionMessages[action] || action;
  
  const notificationData = {
    title: 'Task Updated',
    message: `Task "${task.title}" has been ${actionText}${updatedByUser ? ` by ${updatedByUser.name}` : ''}`,
    type: 'task_update',
    data: {
      taskId: task._id,
      taskTitle: task.title,
      action: actionText,
      status: task.status,
      updatedBy: updatedByUser ? {
        id: updatedByUser._id,
        name: updatedByUser.name,
        email: updatedByUser.email
      } : null,
      updatedAt: new Date().toISOString()
    }
  };

  const success = await sendNotificationToUser(targetUserId, notificationData);
  
  // ✅ ALSO EMIT TASK UPDATE EVENT
  if (io && success) {
    io.to(`user_${targetUserId}`).emit('taskUpdated', {
      task,
      action: actionText,
      updatedBy: updatedByUser,
      notification: notificationData
    });
    console.log(`📋 Task update event emitted to user ${targetUserId}`);
  }
  
  return success;
};

// ✅ HELPER FUNCTION TO SEND WELCOME NOTIFICATION
export const sendWelcomeNotification = async (userId, userName) => {
  const notificationData = {
    title: 'Welcome to TaskRise! 🎉',
    message: `Hello ${userName}! Welcome to your task management portal. You can create, assign, and track tasks here.`,
    type: 'welcome',
    data: {
      userName: userName,
      welcomeDate: new Date().toISOString()
    }
  };

  return await sendNotificationToUser(userId, notificationData);
};

// ✅ INITIALIZE SOCKET.IO SERVER
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5173"
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // ✅ AUTHENTICATION MIDDLEWARE
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const userId = socket.handshake.auth.userId;
      const userName = socket.handshake.auth.userName;
      
      console.log('🔐 Socket authentication attempt for user:', userName, userId);
      
      if (!token) {
        console.error('❌ No token provided for socket connection');
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        console.error('❌ User not found for socket connection:', decoded.userId);
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user data to socket
      socket.userId = user._id.toString();
      socket.userData = {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      };
      
      console.log('✅ Socket authenticated for user:', user.name);
      next();
    } catch (error) {
      console.error('❌ Socket authentication error:', error.message);
      next(new Error('Authentication error: ' + error.message));
    }
  });

  // ✅ CONNECTION HANDLER
  io.on('connection', (socket) => {
    console.log(`✅ User connected via Socket.io: ${socket.userData.name} (${socket.userId})`);
    
    // Store connected user
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      userData: socket.userData,
      connectedAt: new Date(),
      lastActivity: new Date()
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    console.log(`🏠 User ${socket.userData.name} joined room: user_${socket.userId}`);

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Successfully connected to TaskRise notifications',
      userId: socket.userId,
      timestamp: new Date().toISOString()
    });

    // ✅ HANDLE TEST NOTIFICATIONS WITH DATABASE SAVE
    socket.on('testNotification', async (data) => {
      console.log('🧪 Test notification requested by:', socket.userData.name);
      
      const notificationData = {
        title: 'Test Notification',
        message: data.message || 'This is a test notification from the server! 🎉',
        type: 'test',
        data: {
          testId: `test_${Date.now()}`,
          requestedBy: socket.userData.name,
          timestamp: new Date().toISOString()
        }
      };

      const success = await sendNotificationToUser(socket.userId, notificationData);
      
      if (success) {
        console.log('✅ Test notification sent and saved for:', socket.userData.name);
        socket.emit('testNotificationResult', { success: true, message: 'Test notification sent successfully!' });
      } else {
        console.error('❌ Failed to send test notification');
        socket.emit('testNotificationResult', { success: false, message: 'Failed to send test notification' });
      }
    });

    // ✅ HANDLE MARK NOTIFICATION AS READ
    socket.on('markNotificationRead', async (data) => {
      try {
        console.log(`📖 Marking notification as read: ${data.notificationId} by ${socket.userData.name}`);
        
        const notification = await Notification.findByIdAndUpdate(
          data.notificationId,
          { 
            read: true, 
            readAt: new Date() 
          },
          { new: true }
        );

        if (notification) {
          console.log(`✅ Notification marked as read in database: ${data.notificationId}`);
          socket.emit('notificationUpdated', { notificationId: data.notificationId, read: true });
        } else {
          console.error(`❌ Notification not found: ${data.notificationId}`);
        }
      } catch (error) {
        console.error('❌ Error marking notification as read:', error);
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });

    // ✅ HANDLE MARK ALL NOTIFICATIONS AS READ
    socket.on('markAllNotificationsRead', async (data) => {
      try {
        console.log(`📖 Marking all notifications as read for ${socket.userData.name}`);
        
        const result = await Notification.updateMany(
          { userId: socket.userId, read: false },
          { 
            read: true, 
            readAt: new Date() 
          }
        );

        console.log(`✅ Marked ${result.modifiedCount} notifications as read for user: ${socket.userId}`);
        socket.emit('allNotificationsMarkedRead', { count: result.modifiedCount });
      } catch (error) {
        console.error('❌ Error marking all notifications as read:', error);
        socket.emit('error', { message: 'Failed to mark all notifications as read' });
      }
    });

    // ✅ HANDLE DELETE NOTIFICATION
    socket.on('deleteNotification', async (data) => {
      try {
        console.log(`🗑️ Deleting notification: ${data.notificationId} by ${socket.userData.name}`);
        
        const result = await Notification.findByIdAndDelete(data.notificationId);
        
        if (result) {
          console.log(`✅ Notification deleted from database: ${data.notificationId}`);
          socket.emit('notificationDeleted', { notificationId: data.notificationId });
        } else {
          console.error(`❌ Notification not found for deletion: ${data.notificationId}`);
        }
      } catch (error) {
        console.error('❌ Error deleting notification:', error);
        socket.emit('error', { message: 'Failed to delete notification' });
      }
    });

    // ✅ HANDLE CLEAR ALL NOTIFICATIONS
    socket.on('clearAllNotifications', async (data) => {
      try {
        console.log(`🗑️ Clearing all notifications for ${socket.userData.name}`);
        
        const result = await Notification.deleteMany({ userId: socket.userId });
        
        console.log(`✅ Deleted ${result.deletedCount} notifications for user: ${socket.userId}`);
        socket.emit('allNotificationsCleared', { count: result.deletedCount });
      } catch (error) {
        console.error('❌ Error clearing all notifications:', error);
        socket.emit('error', { message: 'Failed to clear all notifications' });
      }
    });

    // ✅ HANDLE GET UNREAD COUNT
    socket.on('getUnreadCount', async () => {
      try {
        const unreadCount = await Notification.countDocuments({ 
          userId: socket.userId, 
          read: false 
        });
        
        socket.emit('unreadCount', { count: unreadCount });
        console.log(`📊 Unread count for ${socket.userData.name}: ${unreadCount}`);
      } catch (error) {
        console.error('❌ Error getting unread count:', error);
        socket.emit('error', { message: 'Failed to get unread count' });
      }
    });

    // ✅ HANDLE ACTIVITY PING
    socket.on('ping', () => {
      connectedUsers.set(socket.userId, {
        ...connectedUsers.get(socket.userId),
        lastActivity: new Date()
      });
      socket.emit('pong');
    });

    // ✅ HANDLE USER STATUS REQUEST
    socket.on('getUserStatus', () => {
      const userInfo = connectedUsers.get(socket.userId);
      socket.emit('userStatus', {
        connected: true,
        connectedAt: userInfo?.connectedAt,
        lastActivity: userInfo?.lastActivity,
        userData: socket.userData
      });
    });

    // ✅ HANDLE DISCONNECTION
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.userData.name} (${socket.userId}) - Reason: ${reason}`);
      connectedUsers.delete(socket.userId);
      
      // Log disconnection stats
      const remainingConnections = connectedUsers.size;
      console.log(`📊 Remaining active connections: ${remainingConnections}`);
    });

    // ✅ HANDLE CONNECTION ERRORS
    socket.on('error', (error) => {
      console.error(`🚨 Socket error for user ${socket.userData.name}:`, error);
    });
  });

  // ✅ PERIODIC CLEANUP OF INACTIVE CONNECTIONS
  setInterval(() => {
    const now = new Date();
    const timeoutMs = 30 * 60 * 1000; // 30 minutes
    
    for (const [userId, userData] of connectedUsers.entries()) {
      if (now - userData.lastActivity > timeoutMs) {
        console.log(`🧹 Cleaning up inactive connection for user: ${userId}`);
        connectedUsers.delete(userId);
      }
    }
  }, 5 * 60 * 1000); // Check every 5 minutes

  console.log('🔌 Socket.io server initialized successfully with database support');
  return io;
};

// ✅ HELPER FUNCTION TO GET CONNECTED USERS
export const getConnectedUsers = () => {
  return Array.from(connectedUsers.entries()).map(([userId, data]) => ({
    userId,
    socketId: data.socketId,
    userData: data.userData,
    connectedAt: data.connectedAt,
    lastActivity: data.lastActivity,
    isActive: (new Date() - data.lastActivity) < (5 * 60 * 1000) // Active within 5 minutes
  }));
};

// ✅ HELPER FUNCTION TO BROADCAST TO ALL USERS
export const broadcastToAllUsers = async (notificationData) => {
  try {
    const users = await User.find({ isActive: { $ne: false } });
    const promises = users.map(user => 
      sendNotificationToUser(user._id.toString(), notificationData)
    );
    
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    console.log(`📢 Broadcast notification sent to ${successful}/${users.length} users`);
    return successful;
  } catch (error) {
    console.error('❌ Error broadcasting to all users:', error);
    return 0;
  }
};

// ✅ HELPER FUNCTION TO GET SOCKET.IO STATS
export const getSocketStats = () => {
  return {
    totalConnections: connectedUsers.size,
    connectedUsers: getConnectedUsers(),
    serverUptime: process.uptime(),
    socketInitialized: !!io
  };
};

// ✅ EXPORT IO INSTANCE
export { io };