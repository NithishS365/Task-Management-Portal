import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import { toast } from 'react-toastify';
import Header from '../components/Header';

export const StaffOverdue = () => {
  const { user } = useAuth();
  const { tasks, loading, error, fetchTasks } = useTask();
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(10);
  const [requestedTasks, setRequestedTasks] = useState(new Set()); // Track tasks with pending extension requests
  
  // Extension form state
  const [extensionData, setExtensionData] = useState({
    reason: '',
    customReason: '',
    newDueDate: '',
    supportingFiles: []
  });

  const reasonOptions = [
    { value: 'technical_issues', label: 'Technical Difficulties' },
    { value: 'resource_unavailable', label: 'Resources Unavailable' },
    { value: 'scope_change', label: 'Scope Change Required' },
    { value: 'dependency_delay', label: 'Dependency Delays' },
    { value: 'personal_emergency', label: 'Personal Emergency' },
    { value: 'workload_conflict', label: 'Workload Conflicts' },
    { value: 'other', label: 'Other (Please specify)' }
  ];

  // Fetch and filter overdue tasks
  useEffect(() => {
    const fetchOverdueTasks = async () => {
      // Check if user is faculty before making API calls
      if (!user || user.role === 'hod') {
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        await fetchTasks();
        // Also fetch existing extension requests
        await fetchExistingExtensionRequests();
      } catch (err) {
        console.error('Error fetching tasks:', err);
        toast.error('Failed to fetch tasks');
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      fetchOverdueTasks();
    }
  }, [user, fetchTasks]);

  // Filter overdue tasks for current user
  useEffect(() => {
    if (tasks && user) {
      const userOverdueTasks = tasks.filter(task => {
        const taskAssignedToId = task.assignedTo?._id || task.assignedTo;
        const userIdStr = user._id?.toString();
        const taskIdStr = taskAssignedToId?.toString();
        
        const isAssignedToUser = taskIdStr === userIdStr || 
                                task.assignedTo?.username === user.username ||
                                task.assignedTo?.email === user.email;
        
        const isOverdue = new Date(task.dueDate) < new Date();
        const isNotCompleted = task.status !== 'completed';
        
        return isAssignedToUser && isOverdue && isNotCompleted;
      });
      
      setOverdueTasks(userOverdueTasks);
    }
  }, [tasks, user]);

  // Fetch existing extension requests to check which tasks already have pending requests
  const fetchExistingExtensionRequests = async () => {
    try {
      // Check if user is faculty before making API call
      if (!user || user.role === 'hod') {
        return;
      }

      const token = sessionStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/requests/extensions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Get task IDs that have pending extension requests
        const pendingTaskIds = (data.requests || [])
          .filter(request => request.status === 'pending')
          .map(request => request.taskId);
        
        setRequestedTasks(new Set(pendingTaskIds));
      }
    } catch (err) {
      console.error('Error fetching extension requests:', err);
    }
  };

  // Role-based access control
  if (user?.role === 'hod') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">This page is only accessible to staff members.</p>
        </div>
      </div>
    );
  }

  const handleExtensionRequest = (task) => {
    // Check if task already has a pending extension request
    if (requestedTasks.has(task._id)) {
      toast.info('Extension request already submitted for this task');
      return;
    }
    
    setSelectedTask(task);
    setShowExtensionModal(true);
    // Set minimum date as tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setExtensionData({
      ...extensionData,
      newDueDate: tomorrow.toISOString().split('T')[0]
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setExtensionData({
      ...extensionData,
      supportingFiles: files
    });
  };

  const submitExtensionRequest = async (e) => {
    e.preventDefault();
    
    if (!extensionData.reason || !extensionData.newDueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (extensionData.reason === 'other' && !extensionData.customReason.trim()) {
      toast.error('Please specify the reason for extension');
      return;
    }

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('taskId', selectedTask._id);
      formData.append('reason', extensionData.reason);
      formData.append('customReason', extensionData.customReason);
      formData.append('requestedDueDate', extensionData.newDueDate);
      formData.append('currentDueDate', selectedTask.dueDate);
      
      // Add supporting files
      extensionData.supportingFiles.forEach((file, index) => {
        formData.append(`supportingFiles`, file);
      });

      // Submit extension request to backend API
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/requests/extensions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success('Extension request submitted successfully! Your HOD will review and reallocate the task with a new deadline.');
        setShowExtensionModal(false);
        resetExtensionForm();
        // Add task to requested tasks set
        setRequestedTasks(prev => new Set([...prev, selectedTask._id]));
        // Refresh tasks
        await fetchTasks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to submit extension request');
      }
    } catch (err) {
      console.error('Extension request error:', err);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetExtensionForm = () => {
    setExtensionData({
      reason: '',
      customReason: '',
      newDueDate: '',
      supportingFiles: []
    });
    setSelectedTask(null);
  };

  const closeModal = () => {
    setShowExtensionModal(false);
    resetExtensionForm();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysOverdue = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'ForApproval': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'high': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'medium': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'low': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    };
    return badges[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = overdueTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(overdueTasks.length / tasksPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Tasks</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Overdue Tasks - Extension Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Request deadline extensions for overdue tasks. Once approved by HOD, tasks will be reallocated with new due dates.
          </p>
        </div>

        {/* Statistics Banner */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {overdueTasks.length} Overdue Task{overdueTasks.length !== 1 ? 's' : ''} Requiring Extension
              </h2>
              <p className="text-red-100">
                Submit extension requests to HOD for task reallocation with new deadlines
              </p>
            </div>
            <div className="text-6xl opacity-50">
              📋
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {overdueTasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Overdue Tasks!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Great job! You have no overdue tasks requiring extension requests.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 mb-8">
              {currentTasks.map((task) => (
                <div 
                  key={task._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                          {task.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {task.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(task.status)}`}>
                            {task.status === 'ForApproval' ? 'For Approval' : task.status}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(task.priority)}`}>
                            {task.priority || 'medium'} priority
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                            {getDaysOverdue(task.dueDate)} day{getDaysOverdue(task.dueDate) !== 1 ? 's' : ''} overdue
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                          Due: {formatDate(task.dueDate)}
                        </div>
                      </div>

                      <div className="ml-4">
                        {requestedTasks.has(task._id) ? (
                          <button
                            disabled
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center cursor-not-allowed opacity-90"
                            aria-label={`Extension requested for ${task.title}`}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Requested for Extension
                          </button>
                        ) : (
                          <button
                            onClick={() => handleExtensionRequest(task)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                            aria-label={`Request extension for ${task.title}`}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            Request Extension Ticket
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Overdue Reason */}
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-800 dark:text-red-300">
                        <strong>Extension Required:</strong> This task exceeded its deadline by {getDaysOverdue(task.dueDate)} day{getDaysOverdue(task.dueDate) !== 1 ? 's' : ''}. Submit an extension request to have this task reallocated with a new deadline.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600'
                  }`}
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Extension Request Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Submit Extension Request
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {selectedTask && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Task: {selectedTask.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Original Due Date: {formatDate(selectedTask.dueDate)}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Overdue by: {getDaysOverdue(selectedTask.dueDate)} day{getDaysOverdue(selectedTask.dueDate) !== 1 ? 's' : ''}
                  </p>
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Note:</strong> Once your extension request is approved by the HOD, this task will be reallocated to you with the new due date and will appear in your Task Portal for completion.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={submitExtensionRequest} className="space-y-6">
                {/* Reason Dropdown */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Extension *
                  </label>
                  <select
                    id="reason"
                    value={extensionData.reason}
                    onChange={(e) => setExtensionData({...extensionData, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select a reason</option>
                    {reasonOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Reason Text */}
                {extensionData.reason === 'other' && (
                  <div>
                    <label htmlFor="customReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Please specify the reason *
                    </label>
                    <textarea
                      id="customReason"
                      value={extensionData.customReason}
                      onChange={(e) => setExtensionData({...extensionData, customReason: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows="3"
                      placeholder="Please provide details..."
                      required
                    />
                  </div>
                )}

                {/* New Due Date */}
                <div>
                  <label htmlFor="newDueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Requested New Due Date *
                  </label>
                  <input
                    type="date"
                    id="newDueDate"
                    value={extensionData.newDueDate}
                    onChange={(e) => setExtensionData({...extensionData, newDueDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label htmlFor="supportingFiles" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Supporting Documents (Optional)
                  </label>
                  <input
                    type="file"
                    id="supportingFiles"
                    multiple
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 5MB each)
                  </p>
                </div>

                {/* File List */}
                {extensionData.supportingFiles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selected Files:
                    </h4>
                    <ul className="space-y-1">
                      {extensionData.supportingFiles.map((file, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                          </svg>
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Extension Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
