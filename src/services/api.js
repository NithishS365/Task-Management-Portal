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
        let errorMessage = responseText;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || responseText;
        } catch (e) {
          // Response is not JSON
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

  async getUsers() {
    return this.makeRequest('/users');
  }
}

// ✅ CREATE INSTANCE
const apiService = new ApiService();

// ✅ EXPORT BOTH WAYS
export { apiService };
export default apiService;
