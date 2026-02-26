import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/Taskcontext';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';

// Analytics Summary Card Component
const AnalyticsCard = ({ title, value, subtitle, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-gray-600 dark:text-gray-400 font-medium">{title}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Request Table Component
const RequestTable = ({ 
  requests, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter,
  onApprove,
  onReassign,
  onReject,
  loading 
}) => {
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.taskTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.staffName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Search and Filter Bar */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by task or staff name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Task Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Staff
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-lg font-medium">No extension requests found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {request.taskTitle}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {request.taskId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {request.staffName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {request.staffEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      Original: {formatDate(request.originalDueDate)}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      Requested: {formatDate(request.requestedDueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {request.reasonLabel}
                    </div>
                    {request.customReason && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {request.customReason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {request.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onApprove(request)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReassign(request)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          Reassign
                        </button>
                        <button
                          onClick={() => onReject(request)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        {request.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Action Modals
const ApprovalModal = ({ isOpen, onClose, request, onSubmit, submitting }) => {
  const [newDueDate, setNewDueDate] = useState('');
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (isOpen && request) {
      setNewDueDate(request.requestedDueDate ? request.requestedDueDate.split('T')[0] : '');
      setComments('');
    }
  }, [isOpen, request]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDueDate) {
      toast.error('Please select a new due date');
      return;
    }
    onSubmit({
      requestId: request._id,
      taskId: request.taskId,
      newDueDate,
      comments
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Approve Extension Request
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {request && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {request.taskTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Staff: {request.staffName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Requested Date: {new Date(request.requestedDueDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newDueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Due Date *
              </label>
              <input
                type="date"
                id="newDueDate"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comments (Optional)
              </label>
              <textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows="3"
                placeholder="Add any comments for the extension approval..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors flex items-center"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Approving...
                  </>
                ) : (
                  'Approve Extension'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ReassignModal = ({ isOpen, onClose, request, onSubmit, submitting, staffList }) => {
  const [newStaffId, setNewStaffId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [penaltyFlag, setPenaltyFlag] = useState(false);
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewStaffId('');
      setNewDueDate(request?.requestedDueDate ? request.requestedDueDate.split('T')[0] : '');
      setPenaltyFlag(false);
      setComments('');
    }
  }, [isOpen, request]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newStaffId) {
      toast.error('Please select a staff member');
      return;
    }
    if (!newDueDate) {
      toast.error('Please select a new due date');
      return;
    }
    onSubmit({
      requestId: request._id,
      taskId: request.taskId,
      newStaffId,
      newDueDate,
      penaltyFlag,
      comments
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Reassign Task
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newStaff" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign to Staff *
              </label>
              <select
                id="newStaff"
                value={newStaffId}
                onChange={(e) => setNewStaffId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select staff member</option>
                {staffList.map(staff => (
                  <option key={staff._id} value={staff._id}>
                    {staff.fullName || staff.name} ({staff.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="newDueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Due Date *
              </label>
              <input
                type="date"
                id="newDueDate"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="penaltyFlag"
                checked={penaltyFlag}
                onChange={(e) => setPenaltyFlag(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="penaltyFlag" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Mark penalty for original assignee
              </label>
            </div>

            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comments
              </label>
              <textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows="3"
                placeholder="Reason for reassignment..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
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
                    Reassigning...
                  </>
                ) : (
                  'Reassign Task'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const RejectModal = ({ isOpen, onClose, request, onSubmit, submitting }) => {
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (isOpen) {
      setComments('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      requestId: request._id,
      taskId: request.taskId,
      comments
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Reject Extension Request
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {request && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {request.taskTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Staff: {request.staffName}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rejection Reason *
              </label>
              <textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows="4"
                placeholder="Please provide a reason for rejecting this extension request..."
                required
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Rejecting...
                  </>
                ) : (
                  'Reject Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Component
export const HodOverdue = () => {
  const { user } = useAuth();
  const { fetchTasks } = useTask();
  
  // State for analytics data
  const [analytics, setAnalytics] = useState({
    totalOverdue: 0,
    overdueByStaff: [],
    overduePercentages: [],
    trendData: [],
    priorityDistribution: []
  });
  
  // State for extension requests
  const [requests, setRequests] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('📊 Fetching historical overdue analytics data...');
      const response = await fetch('http://localhost:5000/api/tasks/analytics/historical-overdue', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Historical overdue analytics API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Historical overdue analytics data received:', data);
        
        if (data.success && data.analytics) {
          setAnalytics({
            // Current overdue metrics
            totalOverdue: data.analytics.totalOverdue,
            criticalOverdue: data.analytics.criticalOverdue,
            
            // Historical metrics
            totalHistoricalOverdue: data.analytics.totalHistoricalOverdue,
            resolvedOverdueCount: data.analytics.resolvedOverdueCount,
            
            // Staff analytics with historical data
            overdueByStaff: data.analytics.overdueByStaff,
            mostOverdueStaff: data.analytics.mostOverdueStaff,
            
            // Priority distribution with historical data
            overduePercentages: data.analytics.overdueByPriority.map(item => ({
              name: item._id,
              value: item.totalCount,
              currentCount: item.currentCount,
              resolvedCount: item.resolvedCount,
              percentage: Math.round((item.totalCount / data.analytics.totalHistoricalOverdue) * 100) || 0
            })),
            priorityDistribution: data.analytics.overdueByPriority.map(item => ({
              name: item._id,
              value: item.totalCount,
              currentCount: item.currentCount,
              resolvedCount: item.resolvedCount,
              color: item._id === 'High' ? '#EF4444' : 
                     item._id === 'Medium' ? '#F59E0B' : '#10B981'
            })),
            
            // Category and department with historical data
            categoryDistribution: data.analytics.overdueByCategory,
            departmentDistribution: data.analytics.overdueByDepartment,
            
            // Trend with historical data
            trendData: data.analytics.overdueTrend,
            
            // Summary with historical metrics
            summary: {
              ...data.analytics.summary,
              totalHistoricalOverdue: data.analytics.totalHistoricalOverdue,
              resolvedOverdueCount: data.analytics.resolvedOverdueCount,
              resolutionRate: data.analytics.summary.resolutionRate
            }
          });
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Overdue analytics API error:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('❌ Error fetching tracked analytics:', err);
      setError(`Failed to load tracked analytics data: ${err.message}`);
      // Set empty analytics with proper structure
      setAnalytics({
        totalOverdue: 0,
        overdueByStaff: [],
        overduePercentages: [],
        trendData: [],
        priorityDistribution: [],
        categoryDistribution: [],
        departmentDistribution: [],
        mostOverdueStaff: [],
        criticalOverdue: 0,
        summary: {
          totalTasks: 0,
          totalReallocated: 0,
          overduePercentage: 0,
          averageDaysOverdue: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch extension requests
  const fetchRequests = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('📋 Fetching extension requests...');
      const response = await fetch('http://localhost:5000/api/requests/overdue', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Extension requests received:', data);
        setRequests(data.data?.requests || data.requests || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('❌ Error fetching requests:', err);
      setError(`Failed to load extension requests: ${err.message}`);
      // Set empty requests instead of mock data
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Fetch staff list
  const fetchStaffList = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('� Fetching staff list...');
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Staff list received:', data);
        // Filter to get only faculty members
        const facultyMembers = (data.users || []).filter(user => user.role === 'faculty');
        setStaffList(facultyMembers);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('❌ Error fetching staff list:', err);
      // Set empty staff list instead of mock data
      setStaffList([]);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAnalytics();
    fetchRequests();
    fetchStaffList();
  }, []);

  // Role-based access control - Check after all hooks are declared
  const handleApprove = (request) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };

  const handleReassign = (request) => {
    setSelectedRequest(request);
    setShowReassignModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  // Submit approval
  const submitApproval = async (data) => {
    try {
      setSubmitting(true);
      
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/requests/overdue/${data.requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newDueDate: data.newDueDate,
          comments: data.comments
        })
      });

      if (response.ok) {
        toast.success('Extension request approved successfully!');
        setShowApprovalModal(false);
        fetchRequests();
        fetchAnalytics();
        // Refresh task context so faculty sees updated tasks
        fetchTasks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to approve request');
      }
    } catch (err) {
      console.error('Error approving request:', err);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reassignment
  const submitReassignment = async (data) => {
    try {
      setSubmitting(true);
      
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/requests/overdue/${data.requestId}/reassign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newStaffId: data.newStaffId,
          newDueDate: data.newDueDate,
          penaltyFlag: data.penaltyFlag,
          comments: data.comments
        })
      });

      if (response.ok) {
        toast.success('Task reassigned successfully!');
        setShowReassignModal(false);
        fetchRequests();
        fetchAnalytics();
        // Refresh task context so both original and new faculty see updated tasks
        fetchTasks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to reassign task');
      }
    } catch (err) {
      console.error('Error reassigning task:', err);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit rejection
  const submitRejection = async (data) => {
    try {
      setSubmitting(true);
      
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/requests/overdue/${data.requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comments: data.comments
        })
      });

      if (response.ok) {
        toast.success('Extension request rejected');
        setShowRejectModal(false);
        fetchRequests();
        fetchAnalytics();
        // Refresh task context so faculty sees task removed
        fetchTasks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to reject request');
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Role-based access control - Check after all hooks are declared
  if (user?.role !== 'hod') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">This page is only accessible to HOD users.</p>
        </div>
      </div>
    );
  }

  if (loading && requestsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-white mb-2">
            Overdue Tasks Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive analysis of current and previously overdue tasks with extension request management
          </p>
        </div>

        {/* Analytics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Analytics Overview</h2>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AnalyticsCard
              title="Current Overdue"
              value={analytics.totalOverdue || 0}
              subtitle={`${analytics.summary?.currentOverduePercentage || 0}% of all tasks`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
              color="red"
            />
            <AnalyticsCard
              title="Historical Overdue"
              value={analytics.totalHistoricalOverdue || 0}
              subtitle={`${analytics.summary?.historicalOverduePercentage || 0}% total exposure`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2a2 2 0 002-2V7a2 2 0 00-2-2H9m0 0V3m0 0h2M9 3v2m3 6v3m0 0l-3-3m3 3l3-3"/>
                </svg>
              }
              color="red"
            />
            <AnalyticsCard
              title="Resolved Overdue"
              value={analytics.resolvedOverdueCount || 0}
              subtitle={`${analytics.summary?.resolutionRate || 0}% resolution rate`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              }
              color="green"
            />
            <AnalyticsCard
              title="Critical Overdue"
              value={analytics.criticalOverdue || 0}
              subtitle="More than 7 days overdue"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              }
              color="red"
            />
            <AnalyticsCard
              title="Average Days Overdue"
              value={analytics.summary?.averageDaysOverdue || 0}
              subtitle="Historical average"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              }
              color="blue"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Overdue by Staff Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historical Overdue Tasks by Staff</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.overdueByStaff || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="staffName" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip formatter={(value, name) => {
                    const labels = {
                      'totalOverdueCount': 'Total Historical Overdue',
                      'currentOverdueCount': 'Current Overdue',
                      'resolvedOverdueCount': 'Resolved Overdue'
                    };
                    return [value, labels[name] || name];
                  }} />
                  <Legend />
                  <Bar dataKey="totalOverdueCount" fill="#EF4444" name="Total Historical" />
                  <Bar dataKey="currentOverdueCount" fill="#DC2626" name="Current Overdue" />
                  <Bar dataKey="resolvedOverdueCount" fill="#10B981" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Priority Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historical Overdue Tasks by Priority</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.priorityDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => {
                    const labels = {
                      'value': 'Total Historical',
                      'currentCount': 'Current Overdue',
                      'resolvedCount': 'Resolved Overdue'
                    };
                    return [value, labels[name] || name];
                  }} />
                  <Legend />
                  <Bar dataKey="value" fill="#EF4444" name="Total Historical" />
                  <Bar dataKey="currentCount" fill="#DC2626" name="Current Overdue" />
                  <Bar dataKey="resolvedCount" fill="#10B981" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Category Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historical Overdue Tasks by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.categoryDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => {
                    const labels = {
                      'totalCount': 'Total Historical',
                      'currentCount': 'Current Overdue',
                      'resolvedCount': 'Resolved Overdue'
                    };
                    return [value, labels[name] || name];
                  }} />
                  <Legend />
                  <Bar dataKey="totalCount" fill="#F59E0B" name="Total Historical" />
                  <Bar dataKey="currentCount" fill="#DC2626" name="Current Overdue" />
                  <Bar dataKey="resolvedCount" fill="#10B981" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Department Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historical Overdue Tasks by Department</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.departmentDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => {
                    const labels = {
                      'totalCount': 'Total Historical',
                      'currentCount': 'Current Overdue',
                      'resolvedCount': 'Resolved Overdue'
                    };
                    return [value, labels[name] || name];
                  }} />
                  <Legend />
                  <Bar dataKey="totalCount" fill="#8B5CF6" name="Total Historical" />
                  <Bar dataKey="currentCount" fill="#7C3AED" name="Current Overdue" />
                  <Bar dataKey="resolvedCount" fill="#10B981" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historical Overdue Tasks Trend (Last 12 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => {
                  const labels = {
                    'totalOverdueCount': 'Total Historical Overdue',
                    'currentOverdueCount': 'Current Overdue',
                    'resolvedOverdueCount': 'Resolved Overdue',
                    'averageDaysOverdue': 'Avg Days Overdue'
                  };
                  return [value, labels[name] || name];
                }} />
                <Legend />
                <Line type="monotone" dataKey="totalOverdueCount" stroke="#EF4444" strokeWidth={2} name="Total Historical" />
                <Line type="monotone" dataKey="currentOverdueCount" stroke="#DC2626" strokeWidth={2} name="Current Overdue" />
                <Line type="monotone" dataKey="resolvedOverdueCount" stroke="#10B981" strokeWidth={2} name="Resolved Overdue" />
                <Line type="monotone" dataKey="averageDaysOverdue" stroke="#F59E0B" strokeWidth={2} name="Avg Days Overdue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Overdue Staff Details */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Historical Overdue Staff Performance</h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Staff Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Historical
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Current Overdue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Resolved Overdue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Avg Days Overdue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Max Days Overdue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.mostOverdueStaff && analytics.mostOverdueStaff.length > 0 ? (
                    analytics.mostOverdueStaff.map((staff, index) => (
                      <tr key={staff._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {staff.staffName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {staff.staffEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {staff.totalOverdueCount || 0} total
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                            {staff.currentOverdueCount || 0} current
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            {staff.resolvedOverdueCount || 0} resolved
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {Math.round(staff.averageDaysOverdue || 0)} days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            {staff.maxDaysOverdue || 0} days
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {staff.maxDaysOverdue > 14 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                              Critical
                            </span>
                          ) : staff.maxDaysOverdue > 7 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                              High Risk
                            </span>
                          ) : staff.totalOverdueCount > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                              Moderate
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Good
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-4">✅</div>
                        <p className="text-lg font-medium">No overdue tasks found</p>
                        <p className="text-sm">All staff are up to date with their assignments</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Extension Requests Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Extension Requests</h2>
          
          <RequestTable
            requests={requests}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onApprove={handleApprove}
            onReassign={handleReassign}
            onReject={handleReject}
            loading={requestsLoading}
          />
        </div>
      </div>

      {/* Modals */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        request={selectedRequest}
        onSubmit={submitApproval}
        submitting={submitting}
      />

      <ReassignModal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        request={selectedRequest}
        onSubmit={submitReassignment}
        submitting={submitting}
        staffList={staffList}
      />

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        request={selectedRequest}
        onSubmit={submitRejection}
        submitting={submitting}
      />
    </div>
  );
};