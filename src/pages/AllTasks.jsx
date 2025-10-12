import React, { useState, useEffect } from 'react';
import { useTask } from '../context/Taskcontext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

export const AllTasks = () => {
  const { tasks, loading, error, fetchTasks } = useTask();
  const { user } = useAuth();
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (tasks) {
      filterTasks();
    }
  }, [tasks, activeFilter, searchTerm]);

  const filterTasks = () => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedTo?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'approved':
        filtered = filtered.filter(task => task.status === 'completed');
        break;
      case 'overdue':
        filtered = filtered.filter(task => {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          return dueDate < today && task.status !== 'completed';
        });
        break;
      case 'in-progress':
        filtered = filtered.filter(task => task.status === 'in-progress');
        break;
      case 'for-approval':
        filtered = filtered.filter(task => task.status === 'ForApproval');
        break;
      case 'pending':
        filtered = filtered.filter(task => task.status === 'pending');
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredTasks(filtered);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'ForApproval': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
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

  const isOverdue = (dueDate, status) => {
    const due = new Date(dueDate);
    const today = new Date();
    return due < today && status !== 'completed';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTaskStats = () => {
    const stats = {
      total: tasks.length,
      approved: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => isOverdue(t.dueDate, t.status)).length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      forApproval: tasks.filter(t => t.status === 'ForApproval').length,
      pending: tasks.filter(t => t.status === 'pending').length
    };
    return stats;
  };

  if (loading) {
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
          <div className="text-red-600 dark:text-red-400 text-lg">Error: {error}</div>
        </div>
      </div>
    );
  }

  const stats = getTaskStats();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            All Tasks Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive view of all tasks across the department
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.forApproval}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">For Approval</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tasks by title, description, or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Tasks', count: stats.total },
                { key: 'approved', label: 'Approved', count: stats.approved },
                { key: 'overdue', label: 'Overdue', count: stats.overdue },
                { key: 'in-progress', label: 'In Progress', count: stats.inProgress },
                { key: 'for-approval', label: 'For Approval', count: stats.forApproval },
                { key: 'pending', label: 'Pending', count: stats.pending }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Task Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-4">📋</div>
                      <p className="text-lg font-medium">No tasks found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {task.description?.substring(0, 100)}
                            {task.description?.length > 100 && '...'}
                          </div>
                          {isOverdue(task.dueDate, task.status) && (
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                              ⚠️ OVERDUE
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {task.assignedTo?.name || 'Unassigned'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {task.assignedTo?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(task.status)}`}>
                          {task.status === 'ForApproval' ? 'For Approval' : task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(task.priority)}`}>
                          {task.priority || 'medium'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(task.dueDate)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Created: {formatDate(task.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              task.status === 'completed' ? 'bg-green-500' :
                              task.status === 'ForApproval' ? 'bg-purple-500' :
                              task.status === 'in-progress' ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}
                            style={{
                              width: task.status === 'completed' ? '100%' :
                                     task.status === 'ForApproval' ? '90%' :
                                     task.status === 'in-progress' ? '60%' :
                                     '20%'
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {task.status === 'completed' ? '100%' :
                           task.status === 'ForApproval' ? '90%' :
                           task.status === 'in-progress' ? '60%' :
                           '20%'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredTasks.length} of {tasks.length} total tasks
        </div>
      </div>
    </div>
  );
};
