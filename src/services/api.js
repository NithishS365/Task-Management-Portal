const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    console.log('🌐 ApiService initialized with baseURL:', this.baseURL);
  }

  async makeRequest(endpoint, options = {}) {
    const token = sessionStorage.getItem('token');
    
    console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      credentials: 'include',
      ...options
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      console.log(`📡 Response: ${response.status} ${response.statusText}`);

      const responseText = await response.text();

      if (!response.ok) {
        console.log('🔍 Raw error response:', responseText);
        let errorMessage = responseText;
        try {
          const errorData = JSON.parse(responseText);
          console.log('🔍 Parsed error data:', errorData);
          // Try to extract error message from different possible fields
          errorMessage = errorData.error || errorData.message || errorData.msg || responseText;
        } catch (e) {
          // Response is not JSON, use raw text
          console.log('🔍 Response is not JSON, using raw text');
          errorMessage = responseText;
        }
        
        console.error(`❌ API Error ${response.status}:`, errorMessage);
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      console.log(`✅ API Response:`, data);
      
      return data;
    } catch (error) {
      console.error('❌ API Request Failed:', error.message);
      throw error;
    }
  }

  async login(credentials) {
    try {
      console.log('🔐 API: Login request for:', credentials.email);
      
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      const requestData = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password.trim()
      };

      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      return response;
    } catch (error) {
      console.error('❌ API: Login failed:', error.message);
      throw error;
    }
  }

  async getCurrentUserNotifications() {
    try {
      const response = await this.makeRequest('/notifications/me', {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('❌ API: Failed to fetch notifications:', error.message);
      throw error;
    }
  }

  async getTasks() {
    return this.makeRequest('/tasks');
  }

  async createTask(taskData) {
    return this.makeRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async updateTask(taskId, taskData) {
    return this.makeRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  }

  async deleteTask(taskId) {
    return this.makeRequest(`/tasks/${taskId}`, {
      method: 'DELETE'
    });
  }

  // Get all staff/users
  async getStaff() {
    return this.makeRequest('/users');
  }

  async getUsers() {
    return this.makeRequest('/users');
  }

  // Get current user profile
  async getCurrentUserProfile() {
    return this.makeRequest('/auth/profile');
  }

  // Get user profile by ID
  async getUserProfile(userId) {
    return this.makeRequest(`/users/${userId}`);
  }

  // Change user password
  async changePassword(passwordData) {
    return this.makeRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  }

  // Analytics endpoints for HOD dashboard
  async getTaskStats() {
    return this.makeRequest('/tasks/statistics');
  }

  async getOverdueAnalytics() {
    return this.makeRequest('/tasks/analytics/overdue');
  }

  async getHistoricalOverdueAnalytics() {
    return this.makeRequest('/tasks/analytics/historical-overdue');
  }

  async getStaffPerformanceStats(staffId) {
    return this.makeRequest(`/tasks/staff/${staffId}/statistics`);
  }

  async getAllStaffPerformance() {
    return this.makeRequest('/tasks/analytics/all-staff-performance');
  }
}

//  CREATE INSTANCE
const apiService = new ApiService();

// Export individual methods as named exports
export const getCurrentUserProfile = () => apiService.getCurrentUserProfile();
export const getUserProfile = (userId) => apiService.getUserProfile(userId);
export const changePassword = (passwordData) => apiService.changePassword(passwordData);
export const getStaff = () => apiService.getStaff();
export const getUsers = () => apiService.getUsers();
export const getTasks = () => apiService.getTasks();
export const createTask = (taskData) => apiService.createTask(taskData);
export const updateTask = (taskId, taskData) => apiService.updateTask(taskId, taskData);
export const deleteTask = (taskId) => apiService.deleteTask(taskId);
export const getTaskStats = () => apiService.getTaskStats();
export const getOverdueAnalytics = () => apiService.getOverdueAnalytics();
export const getHistoricalOverdueAnalytics = () => apiService.getHistoricalOverdueAnalytics();
export const getStaffPerformanceStats = (staffId) => apiService.getStaffPerformanceStats(staffId);
export const getAllStaffPerformance = () => apiService.getAllStaffPerformance();

//  EXPORT BOTH WAYS
export { apiService };
export default apiService;
