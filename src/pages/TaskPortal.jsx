import React, { useState, useEffect } from 'react';
import { useTask } from '../context/Taskcontext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import  Header  from '../components/Header';
import { ToastContainer, toast } from 'react-toastify';

export function TaskPortal() {
  const { tasks, fetchTasks, updateTask, deleteTask, loading } = useTask();
  const { user } = useAuth();
  const { createNotification } = useNotification();
  const [filter, setFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // ADD: Submit Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [completionData, setCompletionData] = useState({
    description: '',
    files: []
  });

  // Fetch all tasks and filter to current user's tasks
  useEffect(() => {
    if (user?._id) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  // Filter tasks to show only those assigned to current user and exclude rejected tasks
  const userTasks = tasks.filter(task => 
    (task.assignedTo === user?._id || task.assignedTo?._id === user?._id) &&
    task.status !== 'rejected' // Exclude rejected tasks
  );

  // ✅ FIXED: Enhanced filtering and sorting with proper for approval filter
  const filteredAndSortedTasks = userTasks
    .filter(task => {
      // ✅ Fix the status matching logic to match your stats calculation
      let statusMatch;
      if (filter === 'all') {
        statusMatch = true;
      }// Lines 38-43: Now correctly matches stats calculation
      else if (filter === 'ForApproval') {
        // Match your stats logic - include for approval tasks
        statusMatch = task.status === 'ForApproval';
      } else if (filter === 'completed') {
        statusMatch = task.status === 'completed';
      } else if (filter === 'extended') {
        // Show tasks that were overdue and have been extended
        statusMatch = task.wasOverdue && (task.status === 'pending' || task.status === 'in-progress');
      } else if (filter === 'reallocated') {
        // Show tasks that were overdue and have been reallocated/extended by HOD
        // Enhanced filtering: check for explicit reallocated flag OR legacy conditions
        statusMatch = task.reallocated || (task.wasOverdue && task.extensionApproved);
        console.log(`🔍 DEBUG: Reallocated filter for task ${task._id}:`, {
          reallocated: task.reallocated,
          wasOverdue: task.wasOverdue, 
          extensionApproved: task.extensionApproved,
          reallocationDate: task.reallocationDate,
          statusMatch: statusMatch
        });
      } else {
        statusMatch = task.status === filter;
      }
      
      // Filter by search term
      const searchMatch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return statusMatch && searchMatch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority?.toLowerCase()] || 0;
          bValue = priorityOrder[b.priority?.toLowerCase()] || 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Task statistics - Use userTasks for accurate faculty stats
const taskStats = {
  total: userTasks.length,
  inProgress: userTasks.filter(t => t.status === 'in-progress').length,
  ForApproval: userTasks.filter(t => t.status === 'ForApproval').length,
  completed: userTasks.filter(t => t.status === 'completed').length,
  overdue: userTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'ForApproval' && t.status !== 'completed').length,
  overdueApproved: userTasks.filter(t => t.wasOverdue && (t.status === 'pending' || t.status === 'in-progress')).length,
  reallocated: userTasks.filter(t => t.reallocated || (t.wasOverdue && t.extensionApproved)).length,
  highPriority: userTasks.filter(t => t.priority === 'high').length,
  newTasks: userTasks.filter(t => !t.status || t.status === 'pending').length,
};

// Debug logging for reallocation
console.log('🔍 DEBUG: userTasks for reallocation analysis:', userTasks.map(t => ({
  id: t._id,
  title: t.title,
  wasOverdue: t.wasOverdue,
  extensionApproved: t.extensionApproved,
  status: t.status,
  reassigned: t.reassigned
})));

console.log('🔍 DEBUG: Reallocated tasks count:', taskStats.reallocated);
console.log('🔍 DEBUG: Tasks with wasOverdue=true:', userTasks.filter(t => t.wasOverdue).length);
console.log('🔍 DEBUG: Tasks with extensionApproved=true:', userTasks.filter(t => t.extensionApproved).length);
  // Handle task acceptance (move to in-progress)
  const handleAcceptTask = async (taskId) => {
    console.log('🔄 Accept button clicked for task ID:', taskId);
    
    try {
      console.log('📤 Calling updateTask with status: in-progress');
      const result = await updateTask(taskId, { status: 'in-progress' });
      console.log('✅ UpdateTask result:', result);
      
      toast.success('Task accepted and moved to In Progress!');
    } catch (error) {
      console.error('❌ Error accepting task:', error);
      toast.error('Failed to accept task: ' + error.message);
    }
  };

  // Handle task rejection (delete task)
  const handleRejectTask = async (taskId) => {
    if (window.confirm('Are you sure you want to reject this task? This action cannot be undone.')) {
      try {
        await deleteTask(taskId);
        toast.success('Task rejected and removed!');
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error rejecting task:', error);
        toast.error('Failed to reject task');
      }
    }
  };

  // Handle task submission
  const handleSubmitTask = (task) => {
    setSelectedTask(task);
    setIsSubmitModalOpen(true);
    setCompletionData({ description: '', files: [] });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setCompletionData(prev => ({
      ...prev,
      files: files
    }));
  };

  // Submit task completion
  const handleSubmitCompletion = async () => {
    if (!completionData.description.trim()) {
      toast.error('Please provide a completion description');
      return;
    }

    try {
      const submissionData = {
        status: 'ForApproval',
        completionDescription: completionData.description,
        submittedAt: new Date().toISOString(),
        files: completionData.files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }))
      };

      await updateTask(selectedTask._id, submissionData);
      
      // ✅ SEND NOTIFICATION TO HOD WHEN TASK IS SUBMITTED FOR APPROVAL
      console.log('🔍 DEBUG: selectedTask structure:', {
        id: selectedTask._id,
        title: selectedTask.title,
        assignedBy: selectedTask.assignedBy,
        assignedTo: selectedTask.assignedTo,
        assignedByType: typeof selectedTask.assignedBy,
        assignedById: selectedTask.assignedBy?._id,
        hasCreateNotification: !!createNotification
      });
      
      const hodUserId = selectedTask.assignedBy?._id || selectedTask.assignedBy;
      
      if (createNotification && hodUserId) {
        try {
          console.log(`📤 Attempting to send notification to HOD (${hodUserId}) for task submission`);
          
          const notificationResult = await createNotification({
            title: 'Task Submitted for Approval',
            message: `"${selectedTask.title}" has been submitted for approval by ${user.name}`,
            type: 'task_submitted',
            userId: hodUserId, // Send to HOD who assigned the task
            data: {
              taskId: selectedTask._id,
              taskTitle: selectedTask.title,
              taskDescription: selectedTask.description,
              submittedBy: user.name,
              submittedById: user._id,
              submittedAt: new Date().toISOString(),
              completionDescription: completionData.description
            }
          });
          
          console.log(`✅ Notification creation result:`, notificationResult);
          console.log(`🔔 Notification sent to HOD (${hodUserId}): Task "${selectedTask.title}" submitted for approval by ${user.name}`);
        } catch (notifError) {
          console.error('❌ Failed to send notification to HOD:', notifError);
        }
      } else {
        console.log('❌ Cannot send notification:', {
          hasCreateNotification: !!createNotification,
          hasAssignedBy: !!selectedTask.assignedBy,
          assignedBy: selectedTask.assignedBy,
          hodUserId: hodUserId
        });
      }
      
      toast.success('Task submitted successfully!');
      setIsSubmitModalOpen(false);
      setCompletionData({ description: '', files: [] });
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error('Failed to submit task');
    }
  };

  // Handle task status update with toast notification
  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      toast.success(`Task status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  // Handle task deletion with confirmation
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await deleteTask(taskId);
        toast.success('Task deleted successfully!');
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      }
    }
  };

  // Bulk actions
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  const toggleTaskSelection = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleBulkStatusUpdate = async (status) => {
    try {
      const promises = Array.from(selectedTasks).map(taskId => 
        updateTask(taskId, { status })
      );
      await Promise.all(promises);
      toast.success(`${selectedTasks.size} tasks updated to ${status}!`);
      setSelectedTasks(new Set());
      setShowBulkActions(false);
    } catch (error) {
      toast.error('Failed to update tasks');
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.size} selected tasks?`)) {
      try {
        const promises = Array.from(selectedTasks).map(taskId => deleteTask(taskId));
        await Promise.all(promises);
        toast.success(`${selectedTasks.size} tasks deleted successfully!`);
        setSelectedTasks(new Set());
        setShowBulkActions(false);
      } catch (error) {
        toast.error('Failed to delete tasks');
      }
    }
  };

  // Open task details modal
  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Helper functions
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800';
      case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'forapproval': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day(s)`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const isOverdue = (dueDate, status) => {
    return new Date(dueDate) < new Date() && status !== 'ForApproval';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="text-gray-600 dark:text-gray-300">Loading your tasks...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <ToastContainer position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section with Stats */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Tasks
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage and track your assigned tasks
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' 
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="Grid view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' 
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="List view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
            {[
              { label: 'Total', value: taskStats.total, color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800' },
              { label: 'New Tasks', value: taskStats.newTasks, color: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/50 dark:text-purple-400 dark:border-purple-800' },
              { label: 'In Progress', value: taskStats.inProgress, color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800' },
              { label: 'For Approval', value: taskStats.ForApproval, color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-800' },
              { label: 'Completed', value: taskStats.completed, color: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800' },
              { label: 'Overdue', value: taskStats.overdue, color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800' },
              // { label: 'Extended Tasks', value: taskStats.overdueApproved, color: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/50 dark:text-orange-400 dark:border-orange-800' },
              { label: 'High Priority', value: taskStats.highPriority, color: 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/50 dark:text-pink-400 dark:border-pink-800' },
            ].map((stat, index) => (
              <div key={index} className={`p-4 rounded-lg border ${stat.color}`}>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-75">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
              <option value="createdAt">Sort by Created Date</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSortBy('dueDate');
                setSortOrder('asc');
                setFilter('all');
              }}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Tasks', count: taskStats.total },
                { key: 'in-progress', label: 'In Progress', count: taskStats.inProgress },
                { key: 'ForApproval', label: 'For Approval', count: taskStats.ForApproval },
                { key: 'completed', label: 'Completed', count: taskStats.completed },
                // { key: 'extended', label: 'Extended Tasks', count: taskStats.overdueApproved },
                { key: 'reallocated', label: 'Reallocated', count: taskStats.reallocated },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`${
                    filter === tab.key
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  {tab.label}
                  <span className={`${
                    filter === tab.key 
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' 
                      : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-300'
                  } inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-700 dark:text-indigo-300">
                {selectedTasks.size} task(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkStatusUpdate('in-progress')}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900"
                >
                  Mark as In Progress
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('ForApproval')}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900"
                >
                  Mark as For Approval
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => {
                    setSelectedTasks(new Set());
                    setShowBulkActions(false);
                  }}
                  className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Display */}
        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search or filters.' : 
               filter === 'all' ? "You don't have any tasks assigned yet." : 
               `No ${filter} tasks at the moment.`}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedTasks.map((task) => (
              <div
                key={task._id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 ${
                  task.status === 'completed' 
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10' 
                    : isOverdue(task.dueDate, task.status) 
                    ? 'border-red-300 dark:border-red-700' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="p-6">
                  {/* Checkbox for bulk selection */}
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="checkbox"
                      checked={selectedTasks.has(task._id)}
                      onChange={() => toggleTaskSelection(task._id)}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div className="flex space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {isOverdue(task.dueDate, task.status) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800">
                          Overdue
                        </span>
                      )}
                      {(task.reallocated || (task.wasOverdue && task.extensionApproved)) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                          {task.reassigned ? 'Reassigned' : 'Reallocated'}
                        </span>
                      )}
                      {task.wasOverdue && (task.status === 'pending' || task.status === 'in-progress') && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Extended
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Task Header */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {task.title}
                  </h3>

                  {/* Task Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {task.description}
                  </p>

                  {/* Task Metadata */}
                  <div className="space-y-2 mb-4">
                    {task.category && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>{task.category}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 012 2z" />
                      </svg>
                      <span className={isOverdue(task.dueDate, task.status) ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                    {task.wasOverdue && task.originalDueDate && (
                      <div className="flex items-center text-sm bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg border border-orange-200 dark:border-orange-800">
                        <svg className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div>
                          <div className="text-orange-800 dark:text-orange-300 font-medium text-xs">Extension Approved</div>
                          <div className="text-orange-600 dark:text-orange-400 text-xs">
                            Original due: {formatDate(task.originalDueDate)}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {task.status === 'completed' && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {task.status === 'ForApproval' ? 'For Approval' : 
                         task.status === 'completed' ? 'Completed' :
                         task.status === 'in-progress' ? 'In Progress' :
                         task.status || 'New'}
                      </span>
                    </div>
                  </div>

                  {/* Completion Status for Completed Tasks */}
                  {task.status === 'completed' && (
                    <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                          Task Approved & Completed
                        </span>
                      </div>
                      {task.completedAt && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Completed on {new Date(task.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openTaskDetails(task)}
                      className={`w-full px-3 py-2 rounded-md text-sm transition-colors ${
                        task.status === 'completed' 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {task.status === 'completed' ? 'View Completed Task' : 'View Details'}
                    </button>
                    
                    {/* Show Accept/Reject buttons for new tasks (pending or no status) ONLY if not overdue */}
                    {(!task.status || task.status === 'pending') && !isOverdue(task.dueDate, task.status) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptTask(task._id)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                        >
                          ✅ Accept
                        </button>
                        <button
                          onClick={() => handleRejectTask(task._id)}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}

                    {/* Show overdue notification for overdue pending tasks */}
                    {(!task.status || task.status === 'pending') && isOverdue(task.dueDate, task.status) && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                          </svg>
                          <div className="text-sm">
                            <p className="text-red-800 dark:text-red-300 font-medium">Task Overdue</p>
                            <p className="text-red-600 dark:text-red-400">Request extension in Overdue section to continue working</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Submit button for in-progress tasks */}
                    {task.status === 'in-progress' && (
                      <button
                        onClick={() => handleSubmitTask(task)}
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                      >
                        📤 Submit Task
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTasks(new Set(filteredAndSortedTasks.map(t => t._id)));
                            setShowBulkActions(true);
                          } else {
                            setSelectedTasks(new Set());
                            setShowBulkActions(false);
                          }
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAndSortedTasks.map((task) => (
                    <tr key={task._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      isOverdue(task.dueDate, task.status) ? 'bg-red-50 dark:bg-red-900/20' : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTasks.has(task._id)}
                          onChange={() => toggleTaskSelection(task._id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {task.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                              {task.description}
                            </div>
                            {task.category && (
                              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                📁 {task.category}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                            {task.status === 'completed' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            {task.status === 'ForApproval' ? 'For Approval' : 
                             task.status === 'completed' ? 'Completed' :
                             task.status === 'in-progress' ? 'In Progress' :
                             task.status || 'New'}
                          </span>
                          {(task.reallocated || (task.wasOverdue && task.extensionApproved)) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800">
                              🔄 {task.reassigned ? 'Reassigned' : 'Reallocated'}
                            </span>
                          )}
                          {task.wasOverdue && (task.status === 'pending' || task.status === 'in-progress') && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800">
                              📅 Extended
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className={`${
                          isOverdue(task.dueDate, task.status) 
                            ? 'text-red-600 dark:text-red-400 font-medium' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatDate(task.dueDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openTaskDetails(task)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                        >
                          View
                        </button>
                        {/* Show Accept/Reject for new tasks ONLY if not overdue */}
                        {(!task.status || task.status === 'pending') && !isOverdue(task.dueDate, task.status) && (
                          <>
                            <button
                              onClick={() => handleAcceptTask(task._id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectTask(task._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {/* Show overdue notification for overdue pending tasks */}
                        {(!task.status || task.status === 'pending') && isOverdue(task.dueDate, task.status) && (
                          <span className="text-red-600 dark:text-red-400 font-medium text-xs">
                            ⚠️ Overdue - Request Extension
                          </span>
                        )}
                        {/* Show Submit button for in-progress tasks */}
                        {task.status === 'in-progress' && (
                          <button
                            onClick={() => handleSubmitTask(task)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            Submit
                          </button>
                        )}
                        {/* Show Delete for other tasks */}
                        {task.status && task.status !== 'pending' && task.status !== 'in-progress' && (
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Task Details Modal */}
      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Task Details
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Task Title and Priority */}
              <div className="flex items-start justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white pr-4">
                  {selectedTask.title}
                </h3>
                <div className="flex space-x-2 flex-shrink-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </span>
                  {isOverdue(selectedTask.dueDate, selectedTask.status) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800">
                      Overdue
                    </span>
                  )}
                </div>
              </div>

              {/* Task Description */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedTask.description}
                </p>
              </div>

              {/* Task Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Status:</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedTask.status)}`}>
                        {selectedTask.status === 'completed' && (
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {selectedTask.status === 'ForApproval' ? 'For Approval' : 
                         selectedTask.status === 'completed' ? 'Completed' :
                         selectedTask.status === 'in-progress' ? 'In Progress' :
                         selectedTask.status || 'New'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Category:</span>
                    <div className="mt-1 text-gray-600 dark:text-gray-300">
                      {selectedTask.category || 'No category'}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Due Date:</span>
                    <div className={`mt-1 ${
                      isOverdue(selectedTask.dueDate, selectedTask.status) 
                        ? 'text-red-600 dark:text-red-400 font-semibold' 
                        : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {formatDate(selectedTask.dueDate)}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Created:</span>
                    <div className="mt-1 text-gray-600 dark:text-gray-300">
                      {new Date(selectedTask.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Display completion description and files if For Approval */}
              {selectedTask.status === 'ForApproval' && selectedTask.completionDescription && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">Completion Description</h4>
                  <p className="text-green-800 dark:text-green-200 whitespace-pre-wrap">
                    {selectedTask.completionDescription}
                  </p>
                </div>
              )}

              {selectedTask.files && selectedTask.files.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Files For Approval:</span>
                  <div className="mt-2 space-y-2">
                    {selectedTask.files.map((file, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({Math.round(file.size / 1024)} KB)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Tags:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Bar (if in progress) */}
              {selectedTask.status === 'in-progress' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Progress:</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">In Progress</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {/* Show Accept/Reject for new tasks ONLY if not overdue */}
                  {(!selectedTask.status || selectedTask.status === 'pending') && !isOverdue(selectedTask.dueDate, selectedTask.status) && (
                    <>
                      <button
                        onClick={() => {
                          handleAcceptTask(selectedTask._id);
                          setIsModalOpen(false);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        ✅ Accept Task
                      </button>
                      <button
                        onClick={() => handleRejectTask(selectedTask._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        ❌ Reject Task
                      </button>
                    </>
                  )}

                  {/* Show overdue notification for overdue pending tasks in modal */}
                  {(!selectedTask.status || selectedTask.status === 'pending') && isOverdue(selectedTask.dueDate, selectedTask.status) && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 w-full">
                      <div className="flex items-center">
                        <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                        </svg>
                        <div>
                          <p className="text-red-800 dark:text-red-300 font-semibold">Task is Overdue</p>
                          <p className="text-red-600 dark:text-red-400 text-sm">This task cannot be accepted as it has passed its due date. Please visit the Overdue section to request an extension from your HOD.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Show Submit button for in-progress tasks */}
                  {selectedTask.status === 'in-progress' && (
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        handleSubmitTask(selectedTask);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      📤 Submit Task
                    </button>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                  {(selectedTask.status && selectedTask.status !== 'pending' && selectedTask.status !== 'in-progress') && (
                    <button
                      onClick={() => handleDeleteTask(selectedTask._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Delete Task
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Submission Modal */}
      {isSubmitModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Submit Task: {selectedTask.title}
                </h2>
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Completion Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Completion Description *
                </label>
                <textarea
                  value={completionData.description}
                  onChange={(e) => setCompletionData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what you have completed and any important details..."
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Attach Files (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload files</span>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="sr-only"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF, DOC, TXT, Images, ZIP up to 10MB each
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Files Display */}
              {completionData.files.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Files:
                  </h4>
                  <div className="space-y-2">
                    {completionData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({Math.round(file.size / 1024)} KB)</span>
                        </div>
                        <button
                          onClick={() => {
                            const newFiles = completionData.files.filter((_, i) => i !== index);
                            setCompletionData(prev => ({ ...prev, files: newFiles }));
                          }}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCompletion}
                  disabled={!completionData.description.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📤 Submit Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}