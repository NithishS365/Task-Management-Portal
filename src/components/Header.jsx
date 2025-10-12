import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getCurrentUserProfile } from '../services/api';
import { toast } from 'react-toastify';


const Header = () => {
  const { user, logout } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    connected, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    sendTestNotification
  } = useNotification();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // ✅ GET DYNAMIC GREETING
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // ✅ TOGGLE DARK MODE
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // ✅ INITIALIZE DARK MODE
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  // ✅ FETCH USER PROFILE DATA FROM MONGODB
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.username) {
        try {
          console.log('🔍 Fetching user profile for:', user.username);
          const profileData = await getCurrentUserProfile();
          console.log('✅ Profile data received:', profileData);
          setUserProfileData(profileData);
        } catch (error) {
          console.error('❌ Error fetching user profile:', error);
          // Don't show error toast as it might be annoying for users
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // ✅ CLOSE DROPDOWNS ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ HANDLE LOGOUT
  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // ✅ HANDLE NOTIFICATION CLICK
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    
    // Navigate to relevant page if notification has data
    if (notification.data?.taskId) {
      navigate(`/tasks/${notification.data.taskId}`);
      setShowNotifications(false);
    }
  };

  // ✅ FORMAT NOTIFICATION TIME
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // ✅ GET NOTIFICATION ICON
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned': return '📝';
      case 'task_update': return '📋';
      case 'task_completed': return '✅';
      case 'reminder': return '⏰';
      case 'welcome': return '🎉';
      case 'test': return '🧪';
      default: return '📢';
    }
  };

  // ✅ GET PROFILE ROUTE BASED ON USER ROLE
  const getProfileRoute = () => {
    if (user?.role === 'hod') {
      return '/HodDash/profileHod';
    }
    return '/dashboard/profile';
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ✅ DYNAMIC GREETING */}
          <div className="flex items-center">
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {getGreeting()}, {user?.name}! 👋
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back to your dashboard
              </p>
            </div>
          </div>

        

          {/* ✅ RIGHT SIDE - DARK MODE, NOTIFICATIONS & USER MENU */}
          <div className="flex items-center space-x-4">
            
            {/* ✅ DARK MODE TOGGLE */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                // Sun icon for light mode
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                // Moon icon for dark mode
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* ✅ NOTIFICATIONS DROPDOWN */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                  <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/>
                </svg>
                
                {/* ✅ UNREAD COUNT BADGE */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* ✅ NOTIFICATIONS DROPDOWN MENU */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
                  
                  {/* ✅ HEADER */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={refreshNotifications}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                        title="Refresh"
                      >
                        🔄
                      </button>
                      <button
                        onClick={sendTestNotification}
                        className="text-green-600 hover:text-green-700 text-sm"
                        title="Test Notification"
                      >
                        🧪
                      </button>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Mark All Read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ✅ NOTIFICATIONS LIST */}
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-2">📭</div>
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="text-lg">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${
                                  !notification.read 
                                    ? 'text-gray-900 dark:text-white' 
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {notification.title}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification._id);
                                  }}
                                  className="text-gray-400 hover:text-red-500 ml-2"
                                >
                                  ×
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                  {formatTime(notification.createdAt)}
                                </span>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* ✅ FOOTER */}
                  {notifications.length > 10 && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
                      <Link
                        to="/notifications"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        onClick={() => setShowNotifications(false)}
                      >
                        View All Notifications
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ✅ USER MENU */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {/* ✅ USER PROFILE IMAGE */}
                {userProfileData?.img_url ? (
                  <img
                    src={userProfileData.img_url}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 dark:border-blue-600"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* ✅ FALLBACK INITIALS AVATAR */}
                <div 
                  className={`w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center ${userProfileData?.img_url ? 'hidden' : 'flex'}`}
                  style={{ display: userProfileData?.img_url ? 'none' : 'flex' }}
                >
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <span className="hidden md:block text-sm font-medium">
                  {user?.name}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {/* ✅ USER DROPDOWN MENU */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-1">
                    <Link
                      to={getProfileRoute()}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      👤 Profile
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;