import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // ✅ INITIALIZE AUTH STATE ON APP LOAD
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 AuthContext: Initializing authentication state...');
        
        const token = sessionStorage.getItem('token');
        const userData = sessionStorage.getItem('user');
        
        console.log('🔍 AuthContext: Storage check:', { 
          hasToken: !!token, 
          hasUser: !!userData 
        });
        
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            
            // ✅ VALIDATE USER DATA
            if (parsedUser && parsedUser._id && parsedUser.email && parsedUser.name) {
              // ✅ NORMALIZE USER OBJECT
              const normalizedUser = {
                ...parsedUser,
                _id: (parsedUser._id || parsedUser.id)?.toString(),
                id: (parsedUser._id || parsedUser.id)?.toString()
              };
              
              setUser(normalizedUser);
              setIsAuthenticated(true);
              
              console.log('✅ AuthContext: Auth state restored for user:', {
                id: normalizedUser._id,
                name: normalizedUser.name,
                email: normalizedUser.email,
                role: normalizedUser.role
              });
            } else {
              throw new Error('Invalid user data structure');
            }
          } catch (parseError) {
            console.error('❌ AuthContext: Failed to parse stored user data:', parseError);
            // Clear corrupted data
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
          }
        } else {
          console.log('📋 AuthContext: No stored credentials found');
        }
      } catch (error) {
        console.error('❌ AuthContext: Error during initialization:', error);
        // Clear any corrupted data
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } finally {
        setIsInitialized(true);
        console.log('✅ AuthContext: Initialization complete');
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔐 AuthContext: Login attempt for:', credentials.email);
      
      setLoading(true);
      setError(null);
      
      // ✅ VALIDATE INPUT
      if (!credentials.email || !credentials.password) {
        throw new Error('Email/username and password are required');
      }

      // Enhanced validation - support both email and username
      if (credentials.email.includes('@')) {
        // If it contains @, validate as email
        if (!credentials.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
          throw new Error('Please enter a valid email address');
        }
      } else {
        // If no @, validate as username
        if (credentials.email.length < 3) {
          throw new Error('Username must be at least 3 characters long');
        }
        if (!credentials.email.match(/^[a-zA-Z0-9_]+$/)) {
          throw new Error('Username can only contain letters, numbers, and underscores');
        }
      }

      if (credentials.password.length < 3) {
        throw new Error('Password must be at least 3 characters');
      }
      
      const response = await apiService.login(credentials);
      console.log('🔐 AuthContext: API response received:', {
        success: response?.success,
        hasToken: !!response?.token,
        hasUser: !!response?.user,
        userRole: response?.user?.role
      });
      
      if (response && response.success && response.token && response.user) {
        // ✅ NORMALIZE USER OBJECT
        const normalizedUser = {
          ...response.user,
          _id: (response.user._id || response.user.id)?.toString(),
          id: (response.user._id || response.user.id)?.toString()
        };
        
        console.log('✅ AuthContext: Login successful, normalized user:', {
          id: normalizedUser._id,
          name: normalizedUser.name,
          email: normalizedUser.email,
          role: normalizedUser.role,
          department: normalizedUser.department
        });
        
        // ✅ STORE TOKEN AND USER DATA
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('user', JSON.stringify(normalizedUser));
        
        // ✅ UPDATE STATE
        setUser(normalizedUser);
        setIsAuthenticated(true);
        setError(null);
        
        return {
          success: true,
          user: normalizedUser,
          token: response.token,
          message: `Welcome back, ${normalizedUser.name}!`
        };
      } else {
        throw new Error(response?.message || response?.error || 'Login failed - invalid response format');
      }
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      // ✅ HANDLE SPECIFIC ERROR TYPES
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('401') || error.message.toLowerCase().includes('unauthorized')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message.includes('403') || error.message.toLowerCase().includes('forbidden')) {
        errorMessage = 'Account access denied. Please contact your administrator.';
      } else if (error.message.includes('500') || error.message.toLowerCase().includes('server error')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message.includes('Email') || error.message.includes('Password')) {
        errorMessage = error.message; // Use validation error messages as-is
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      
      // Clear any stored data on login failure
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: Logging out user:', user?.name);
    
    // Clear storage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    
    console.log('✅ AuthContext: Logout complete');
  };

  // ✅ HELPER FUNCTION TO CHECK IF USER HAS SPECIFIC ROLE
  const hasRole = (role) => {
    return user?.role === role;
  };

  // ✅ HELPER FUNCTION TO CHECK IF USER IS HOD
  const isHOD = () => {
    return user?.role === 'hod';
  };

  // ✅ HELPER FUNCTION TO CHECK IF USER IS FACULTY
  const isFaculty = () => {
    return user?.role === 'faculty';
  };

  // ✅ HELPER FUNCTION TO CHECK IF USER IS ADMIN
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    isInitialized,
    
    // Functions
    login,
    logout,
    
    // Helper functions
    hasRole,
    isHOD,
    isFaculty,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};