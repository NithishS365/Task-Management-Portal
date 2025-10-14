import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';

const NotificationContext = createContext();

// ✅ PRIMARY EXPORT
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// ✅ BACKWARD COMPATIBILITY ALIAS
export const useNotification = useNotifications;

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ SIMPLE CROSS-USER NOTIFICATION STORAGE (TEMPORARY SOLUTION)
  const getCrossUserNotifications = () => {
    const stored = localStorage.getItem('crossUserNotifications');
    return stored ? JSON.parse(stored) : [];
  };

  const addCrossUserNotification = (notification) => {
    const existing = getCrossUserNotifications();
    const updated = [notification, ...existing];
    localStorage.setItem('crossUserNotifications', JSON.stringify(updated));
    console.log(`💾 Stored cross-user notification for user ${notification.userId}`);
  };

  const getNotificationsForUser = (userId) => {
    const allCrossUserNotifications = getCrossUserNotifications();
    return allCrossUserNotifications.filter(notif => notif.userId === userId);
  };

  const removeNotificationsForUser = (userId) => {
    const allCrossUserNotifications = getCrossUserNotifications();
    const remaining = allCrossUserNotifications.filter(notif => notif.userId !== userId);
    localStorage.setItem('crossUserNotifications', JSON.stringify(remaining));
  };

  const loadNotifications = async () => {
    // ✅ WAIT FOR AUTH INITIALIZATION
    if (!isInitialized) {
      console.log('⏳ NotificationContext: Waiting for auth initialization...');
      return;
    }

    // ✅ CHECK AUTHENTICATION
    if (!isAuthenticated || !user?._id) {
      console.log('⚠️ NotificationContext: User not authenticated, skipping notification load', {
        isInitialized,
        isAuthenticated,
        userId: user?._id,
        userName: user?.name
      });
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 NotificationContext: Loading notifications for user:', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
      
      const response = await apiService.getCurrentUserNotifications();
      
      if (response && response.success && Array.isArray(response.notifications)) {
        // ✅ COMBINE API NOTIFICATIONS WITH CROSS-USER NOTIFICATIONS
        const crossUserNotifications = getNotificationsForUser(user._id);
        const allNotifications = [...crossUserNotifications, ...response.notifications];
        
        setNotifications(allNotifications);
        const unread = allNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
        console.log(`✅ NotificationContext: Loaded ${allNotifications.length} notifications (${crossUserNotifications.length} from cross-user storage), ${unread} unread`);
        
        // ✅ CLEAR CROSS-USER NOTIFICATIONS AFTER LOADING THEM
        if (crossUserNotifications.length > 0) {
          removeNotificationsForUser(user._id);
          console.log(`🧹 Cleared ${crossUserNotifications.length} cross-user notifications from storage`);
        }
      } else {
        console.log('📋 NotificationContext: No API notifications found, checking cross-user storage...');
        
        // ✅ CHECK FOR CROSS-USER NOTIFICATIONS EVEN IF API FAILS
        const crossUserNotifications = getNotificationsForUser(user._id);
        
        if (crossUserNotifications.length > 0) {
          setNotifications(crossUserNotifications);
          setUnreadCount(crossUserNotifications.filter(n => !n.read).length);
          console.log(`✅ NotificationContext: Loaded ${crossUserNotifications.length} cross-user notifications`);
          
          // ✅ CLEAR AFTER LOADING
          removeNotificationsForUser(user._id);
        } else {
          // ✅ CREATE WELCOME NOTIFICATIONS FOR NEW USERS
          const welcomeNotifications = createWelcomeNotifications(user);
          setNotifications(welcomeNotifications);
          setUnreadCount(welcomeNotifications.filter(n => !n.read).length);
        }
      }
    } catch (error) {
      console.error('❌ NotificationContext: Failed to load notifications:', error);
      setError(error.message);
      
      // ✅ CHECK FOR CROSS-USER NOTIFICATIONS EVEN IF API FAILS
      const crossUserNotifications = getNotificationsForUser(user._id);
      
      if (crossUserNotifications.length > 0) {
        console.log(`📬 NotificationContext: Found ${crossUserNotifications.length} cross-user notifications as fallback`);
        setNotifications(crossUserNotifications);
        setUnreadCount(crossUserNotifications.filter(n => !n.read).length);
        
        // ✅ CLEAR AFTER LOADING
        removeNotificationsForUser(user._id);
      } else {
        // ✅ FALLBACK TO DEMO NOTIFICATIONS
        const demoNotifications = createDemoNotifications(user);
        setNotifications(demoNotifications);
        setUnreadCount(demoNotifications.filter(n => !n.read).length);
        console.log('📋 NotificationContext: Using demo notifications as fallback');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ CREATE WELCOME NOTIFICATIONS BASED ON USER ROLE
  const createWelcomeNotifications = (user) => {
    const baseNotifications = [
      {
        _id: `welcome-${user._id}-${Date.now()}`,
        title: 'Welcome to Task Management Portal!',
        message: `Hello ${user.name}, welcome to your dashboard. Let's get started!`,
        type: 'welcome',
        read: false,
        createdAt: new Date()
      }
    ];

    // ✅ ROLE-SPECIFIC NOTIFICATIONS
    if (user.role === 'hod') {
      baseNotifications.push({
        _id: `hod-welcome-${user._id}-${Date.now()}`,
        title: 'HOD Dashboard Access',
        message: 'As Head of Department, you can assign tasks, monitor progress, and manage faculty workload.',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
      });
    } else if (user.role === 'faculty') {
      baseNotifications.push({
        _id: `faculty-welcome-${user._id}-${Date.now()}`,
        title: 'Faculty Dashboard',
        message: 'Check your assigned tasks, update progress, and collaborate with colleagues.',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes ago
      });
    } else if (user.role === 'admin') {
      baseNotifications.push({
        _id: `admin-welcome-${user._id}-${Date.now()}`,
        title: 'Admin Access Granted',
        message: 'You have full system access. Manage users, tasks, and system settings.',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 2) // 2 minutes ago
      });
    }

    return baseNotifications;
  };

  // ✅ CREATE DEMO NOTIFICATIONS FOR DEVELOPMENT
  const createDemoNotifications = (user) => {
    return [
      
      {
        _id: 'demo-2',
        title: 'Task Reminder',
        message: 'Don\'t forget to check your pending tasks and update their status.',
        type: 'reminder',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        _id: 'demo-3',
        title: 'Getting Started',
        message: 'Explore the dashboard to see all available features and tools.',
        type: 'info',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      }
    ];
  };

  // ✅ ENHANCED EFFECT WITH INITIALIZATION CHECK
  useEffect(() => {
    let timeoutId;
    
    if (!isInitialized) {
      console.log('⏳ NotificationContext: Waiting for auth initialization...');
      return;
    }
    
    if (isAuthenticated && user?._id) {
      console.log('👤 NotificationContext: User authenticated, scheduling notification load...');
      // ✅ ADD DELAY TO ENSURE AUTH IS FULLY SETTLED
      timeoutId = setTimeout(() => {
        loadNotifications();
      }, 500);
    } else {
      console.log('👤 NotificationContext: User not authenticated, clearing notifications');
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isInitialized, isAuthenticated, user?._id, user?.name]);

  const addNotification = (notification) => {
    const newNotification = {
      _id: notification._id || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: notification.title || 'Notification',
      message: notification.message || '',
      type: notification.type || 'info',
      read: notification.read || false,
      createdAt: notification.createdAt || new Date(),
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    if (!newNotification.read) {
      setUnreadCount(prev => prev + 1);
    }
    
    console.log('📬 NotificationContext: Added new notification:', {
      id: newNotification._id,
      title: newNotification.title,
      type: newNotification.type
    });
    
    return newNotification;
  };

  const markAsRead = async (notificationId) => {
    try {
      console.log('📡 NotificationContext: Marking notification as read:', notificationId);
      
      // ✅ OPTIMISTICALLY UPDATE UI
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // TODO: Make API call when backend supports it
      // await apiService.markNotificationAsRead(notificationId);
      
      console.log('✅ NotificationContext: Notification marked as read');
    } catch (error) {
      console.error('❌ NotificationContext: Failed to mark notification as read:', error);
      // ✅ REVERT OPTIMISTIC UPDATE ON ERROR
      loadNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('📡 NotificationContext: Marking all notifications as read');
      
      // ✅ OPTIMISTICALLY UPDATE UI
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      
      // TODO: Make API call when backend supports it
      // await apiService.markAllNotificationsAsRead();
      
      console.log('✅ NotificationContext: All notifications marked as read');
    } catch (error) {
      console.error('❌ NotificationContext: Failed to mark all notifications as read:', error);
      // ✅ REVERT OPTIMISTIC UPDATE ON ERROR
      loadNotifications();
    }
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n._id === notificationId);
      const filtered = prev.filter(n => n._id !== notificationId);
      
      // ✅ UPDATE UNREAD COUNT IF REMOVING UNREAD NOTIFICATION
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      
      return filtered;
    });
    
    console.log('🗑️ NotificationContext: Removed notification:', notificationId);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    console.log('🧹 NotificationContext: Cleared all notifications');
  };

  // ✅ CREATE NOTIFICATION (FOR OTHER CONTEXTS TO USE)
  const createNotification = async (notificationData) => {
    try {
      console.log('📤 NotificationContext: Creating notification:', {
        title: notificationData.title,
        type: notificationData.type,
        targetUserId: notificationData.userId,
        currentUserId: user?._id
      });
      
      // ✅ CHECK IF NOTIFICATION IS FOR CURRENT USER
      if (!user || notificationData.userId !== user._id) {
        console.log(`📤 Notification is for different user (${notificationData.userId}), storing in cross-user storage`);
        console.log(`🔔 Notification "${notificationData.title}" will be delivered when user ${notificationData.userId} logs in`);
        
        // ✅ STORE IN CROSS-USER STORAGE FOR DELIVERY LATER
        const notificationToStore = {
          _id: `cross-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...notificationData,
          createdAt: new Date().toISOString(),
          read: false
        };
        
        addCrossUserNotification(notificationToStore);
        
        return { 
          success: true, 
          notification: notificationToStore,
          deliveryMethod: 'cross-user-storage'
        };
      }
      
      // ✅ ONLY ADD TO LOCAL STATE IF IT'S FOR THE CURRENT USER
      console.log('📬 Notification is for current user, adding to local notifications');
      const newNotification = addNotification({
        ...notificationData,
        createdAt: new Date()
      });
      
      return { 
        success: true, 
        notification: newNotification,
        deliveryMethod: 'local-state'
      };
    } catch (error) {
      console.error('❌ NotificationContext: Failed to create notification:', error);
      throw error;
    }
  };

  // ✅ GET NOTIFICATIONS BY TYPE
  const getNotificationsByType = (type) => {
    return notifications.filter(notification => notification.type === type);
  };

  // ✅ GET RECENT NOTIFICATIONS
  const getRecentNotifications = (count = 5) => {
    return notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, count);
  };

  const value = {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    
    // Functions
    loadNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    createNotification,
    
    // Helper functions
    getNotificationsByType,
    getRecentNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};