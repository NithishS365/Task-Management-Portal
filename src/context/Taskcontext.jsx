import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext'; // ✅ FIXED: useNotification → useNotifications

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const { createNotification } = useNotifications(); // ✅ FIXED: useNotification → useNotifications

  // ✅ USE REFS TO PREVENT INFINITE LOOPS
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  // ✅ ENHANCED AUTHENTICATION CHECK
  const isUserReady = useCallback(() => {
    const ready = isAuthenticated && user?._id;
    if (!ready) {
      console.log('👤 TaskContext: User not ready', {
        isAuthenticated,
        hasUserId: !!user?._id,
        userName: user?.name
      });
    }
    return ready;
  }, [isAuthenticated, user?._id, user?.name]);

  // ✅ ABORT PENDING REQUESTS
  const abortPendingRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // ✅ REST OF YOUR FUNCTIONS REMAIN THE SAME BUT WITH BETTER USER CHECK
  const createTask = useCallback(async (taskData) => {
    if (!mountedRef.current || !isUserReady()) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 TaskContext: Creating task:', taskData);
      
      const response = await apiService.createTask(taskData);
      
      if (response && response.success && response.task && mountedRef.current) {
        setTasks(prev => [response.task, ...prev]);
        lastFetchRef.current = null;
        
        // ✅ SEND NOTIFICATION TO ASSIGNED USER
        if (response.task.assignedTo && response.task.assignedTo !== user._id) {
          try {
            await createNotification({
              title: 'New Task Assigned',
              message: `You have been assigned: "${response.task.title}"`,
              type: 'task_assigned',
              userId: response.task.assignedTo,
              data: {
                taskId: response.task._id,
                taskTitle: response.task.title,
                dueDate: response.task.dueDate,
                priority: response.task.priority
              }
            });
            console.log('📤 Assignment notification sent');
          } catch (notifError) {
            console.error('❌ Failed to send assignment notification:', notifError);
          }
        }
        
        console.log('✅ TaskContext: Task created successfully');
        return response.task;
      } else {
        throw new Error(response?.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('❌ TaskContext: Create task error:', error);
      if (mountedRef.current) {
        setError(error.message);
      }
      throw error;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?._id, createNotification, isUserReady]);

  // ✅ UPDATE TASK FUNCTION
  const updateTask = useCallback(async (taskId, taskData) => {
    if (!mountedRef.current || !isUserReady()) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 TaskContext: Updating task:', taskId, taskData);
      
      const response = await apiService.updateTask(taskId, taskData);
      
      if (response && response.success && response.task && mountedRef.current) {
        // Update the task in local state
        setTasks(prev => prev.map(task => 
          task._id === taskId ? response.task : task
        ));
        
        console.log('✅ TaskContext: Task updated successfully');
        return response.task;
      } else {
        throw new Error(response?.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('❌ TaskContext: Update task error:', error);
      if (mountedRef.current) {
        setError(error.message);
      }
      throw error;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [isUserReady]);

  // ✅ DELETE TASK FUNCTION
  const deleteTask = useCallback(async (taskId) => {
    if (!mountedRef.current || !isUserReady()) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🗑️ TaskContext: Deleting task:', taskId);
      
      const response = await apiService.deleteTask(taskId);
      
      if (response && response.success && mountedRef.current) {
        // Remove the task from local state
        setTasks(prev => prev.filter(task => task._id !== taskId));
        
        console.log('✅ TaskContext: Task deleted successfully');
        return true;
      } else {
        throw new Error(response?.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('❌ TaskContext: Delete task error:', error);
      if (mountedRef.current) {
        setError(error.message);
      }
      throw error;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [isUserReady]);

  // ✅ ENHANCED FETCH TASKS WITH BETTER USER CHECK
  const fetchTasks = useCallback(async (force = false) => {
    if (!isUserReady() || !mountedRef.current || (fetchingRef.current && !force)) {
      return [];
    }
    
    // Check cache
    if (!force && lastFetchRef.current?.all) {
      const timeSinceLastFetch = Date.now() - lastFetchRef.current.all;
      if (timeSinceLastFetch < 5000) { // 5 second cache
        console.log('📦 TaskContext: Using cached all tasks');
        return tasks;
      }
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log('📋 TaskContext: Fetching all tasks for user:', {
        id: user._id,
        name: user.name,
        role: user.role
      });
      
      // Abort any pending requests
      abortPendingRequests();
      
      const response = await apiService.getTasks();
      
      if (response && response.success && mountedRef.current) {
        const fetchedTasks = response.tasks || [];
        setTasks(fetchedTasks);
        
        // Update cache
        if (!lastFetchRef.current) lastFetchRef.current = {};
        lastFetchRef.current.all = Date.now();
        
        console.log('✅ TaskContext: All tasks loaded:', fetchedTasks.length);
        return fetchedTasks;
      } else {
        // ✅ CREATE MOCK TASKS FOR DEMO
        const mockTasks = [
          {
            _id: 'demo-task-1',
            title: 'Welcome Task',
            description: 'This is a demo task to get you started',
            status: 'pending',
            priority: 'Medium',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: user._id,
            createdBy: user._id,
            createdAt: new Date().toISOString()
          },
          {
            _id: 'demo-task-2',
            title: 'Complete Profile Setup',
            description: 'Update your profile information and preferences',
            status: 'pending',
            priority: 'Low',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: user._id,
            createdBy: user._id,
            createdAt: new Date().toISOString()
          }
        ];
        
        setTasks(mockTasks);
        console.log('📋 TaskContext: Using mock tasks for demo');
        return mockTasks;
      }
    } catch (error) {
      console.error('❌ TaskContext: Failed to fetch tasks:', error);
      if (mountedRef.current && error.name !== 'AbortError') {
        setError(error.message);
        setTasks([]);
      }
      return [];
    } finally {
      fetchingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [isUserReady, user, tasks]);

  // ✅ ENHANCED EFFECT WITH BETTER TIMING
  useEffect(() => {
    let mounted = true;
    let timeoutId;
    
    mountedRef.current = true;
    
    if (isUserReady() && mounted) {
      console.log('👤 TaskContext: User ready, scheduling task fetch...', {
        id: user._id,
        name: user.name,
        role: user.role
      });
      
      // ✅ ADD DELAY TO ENSURE AUTH IS FULLY SETTLED
      timeoutId = setTimeout(() => {
        if (mounted && mountedRef.current && isUserReady()) {
          fetchTasks();
        }
      }, 750); // Increased delay
    } else {
      console.log('❌ TaskContext: User not ready, clearing tasks');
      if (mounted) {
        setTasks([]);
        setError(null);
        lastFetchRef.current = null;
      }
    }

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAuthenticated, user?._id, user?.name, user?.role]); // ✅ ADDED more user properties

  // ✅ REST OF YOUR FUNCTIONS REMAIN THE SAME...
  // (fetchTasksByUser, updateTask, deleteTask, etc.)

  // ✅ CONTEXT VALUE
  const value = {
    // State
    tasks,
    loading,
    error,
    
    // Functions
    createTask,
    fetchTasks,
    updateTask,
    deleteTask,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};