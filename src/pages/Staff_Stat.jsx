import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export const Staff_Stat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [staff, setStaff] = useState(null);
  const [taskData, setTaskData] = useState([]);
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    forApprovalTasks: 0,
    rejectedTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    avgCompletionTime: 0,
    // ✅ NEW PERFORMANCE METRICS
    tasksWithRatings: 0,
    averageHodRating: 0,
    averageSubmissionRating: 0,
    averagePerformanceScore: 0,
    performanceGrade: {
      grade: 'N/A',
      description: 'No Data',
      color: '#6B7280',
      percentage: 0
    }
  });
  const [priorityDistribution, setPriorityDistribution] = useState({});
  const [categoryDistribution, setCategoryDistribution] = useState({});
  const [recentRatedTasks, setRecentRatedTasks] = useState([]);
  const [userPerformanceStats, setUserPerformanceStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch task statistics for the staff member
  const fetchTaskStatistics = async (staffId, token) => {
    try {
      console.log('📊 Fetching enhanced performance statistics for staff:', staffId);
      
      const response = await fetch(`http://localhost:5000/api/tasks/staff/${staffId}/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Performance statistics loaded successfully:', data);
          
          setTaskStats(data.statistics);
          setTaskData(data.monthlyData || []);
          setPriorityDistribution(data.priorityDistribution || {});
          setCategoryDistribution(data.categoryDistribution || {});
          setRecentRatedTasks(data.recentRatedTasks || []);
          setUserPerformanceStats(data.userPerformanceStats || {});
          return true;
        } else {
          throw new Error(data.message || 'Failed to fetch statistics');
        }
      } else {
        // Fallback to basic statistics if enhanced endpoint fails
        console.warn('📊 Enhanced stats unavailable, falling back to basic stats');
        return await fetchBasicTaskStatistics(staffId, token);
      }
    } catch (error) {
      console.error('❌ Error fetching enhanced task statistics:', error);
      // Fallback to basic statistics
      return await fetchBasicTaskStatistics(staffId, token);
    }
  };

  // Fallback function for basic task statistics
  const fetchBasicTaskStatistics = async (staffId, token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/user/${staffId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.tasks) {
          const tasks = data.tasks;
          
          // Calculate basic stats from tasks
          const stats = {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            pendingTasks: tasks.filter(t => t.status === 'pending').length,
            forApprovalTasks: tasks.filter(t => t.status === 'ForApproval').length,
            rejectedTasks: tasks.filter(t => t.status === 'rejected').length,
            overdueTasks: tasks.filter(t => {
              const dueDate = new Date(t.dueDate);
              const now = new Date();
              return dueDate < now && !['completed', 'ForApproval'].includes(t.status);
            }).length,
            completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0,
            avgCompletionTime: 0,
            // Performance metrics (empty for basic fallback)
            tasksWithRatings: 0,
            averageHodRating: 0,
            averageSubmissionRating: 0,
            averagePerformanceScore: 0,
            performanceGrade: {
              grade: 'N/A',
              description: 'Basic Stats Only',
              color: '#6B7280',
              percentage: 0
            }
          };
          
          setTaskStats(stats);
          return true;
        } else {
          throw new Error('Failed to fetch basic statistics');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error fetching basic task statistics:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        let staffData = null;

        // First, try to get staff data from location state (passed from FacultyOverview)
        if (location.state && location.state.staff) {
          staffData = location.state.staff;
          setStaff(staffData);
        } else {
          // If no state data, fetch from API using the ID
          const response = await fetch(`http://localhost:5000/api/users/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch staff data: HTTP ${response.status}`);
          }

          const data = await response.json();
          if (data.success && data.user) {
            staffData = data.user;
            setStaff(staffData);
          } else {
            throw new Error('Staff not found');
          }
        }

        // Fetch dynamic task statistics for this staff member
        if (staffData) {
          await fetchTaskStatistics(staffData._id || staffData.id, token);
        }

      } catch (error) {
        console.error('Error fetching staff data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaffData();
    } else {
      setError('No staff ID provided');
      setLoading(false);
    }
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading staff details...</p>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Unable to Load Staff Data</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Staff data not found.'}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="flex flex-col items-center py-0 px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 absolute top-20 left-4 text-gray-400 hover:text-gray-700 text-3xl z-10"
          aria-label="Go Back"
        >
          &times;
        </button>
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center max-w-6xl w-full mt-6">
        <div className="flex flex-col md:flex-row w-full gap-8">
          <div className="flex flex-col items-center md:w-1/3">
            <img
              src={staff.profileImage || staff.imageUrl || 'https://via.placeholder.com/150'}
              alt={staff.fullName || staff.name}
              className="w-36 h-48 border-4 mb-4 shadow object-cover rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
            <h2 className="text-2xl font-bold text-indigo-800 mb-1">{staff.fullName || staff.name}</h2>
            <p className="text-gray-600 font-medium mb-1">{staff.designation || 'Faculty'}</p>
            <p className="text-gray-500 text-center text-sm mb-2">{staff.department || 'Department N/A'}</p>
            
            {/* Quick Performance Indicator */}
            <div className="w-full bg-gray-200 rounded-full px-3 py-1 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700">Performance</span>
                <span className={`font-bold ${
                  taskStats.completionRate >= 80 ? 'text-green-600' :
                  taskStats.completionRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {taskStats.completionRate}%
                </span>
              </div>
            </div>

            <div className="w-full border-t pt-4 mt-4">
              {staff.username && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Username:</span> {staff.username}
                </p>
              )}
              {staff.dateOfBirth && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Date of Birth:</span> {
                    (() => {
                      try {
                        return new Date(staff.dateOfBirth).toLocaleDateString();
                      } catch (error) {
                        return staff.dateOfBirth;
                      }
                    })()
                  }
                </p>
              )}
              {staff.experience && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Experience:</span> {staff.experience}
                </p>
              )}
              {staff.specialization && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Specialization:</span> {staff.specialization}
                </p>
              )}
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Email:</span>{" "}
                <a href={`mailto:${staff.email}`} className="text-indigo-600 hover:underline">{staff.email}</a>
              </p>
              {staff.phone && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Phone:</span> {staff.phone}
                </p>
              )}
              {staff.linkedIn && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">LinkedIn:</span>{" "}
                  <a
                    href={staff.linkedIn && staff.linkedIn.startsWith('http') ? staff.linkedIn : `https://${staff.linkedIn || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {staff.linkedIn}
                  </a>
                </p>
              )}
              {staff.address && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Address:</span> {staff.address}
                </p>
              )}
              {staff.createdAt && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Joined:</span> {
                    (() => {
                      try {
                        return new Date(staff.createdAt).toLocaleDateString();
                      } catch (error) {
                        return staff.createdAt;
                      }
                    })()
                  }
                </p>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-6">
    
            {/* Performance Indicator */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">Overall Performance</div>
                  <div className="text-sm opacity-90">
                    Grade: {taskStats.performanceGrade?.grade} - {taskStats.performanceGrade?.description}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {taskStats.averagePerformanceScore ? taskStats.averagePerformanceScore.toFixed(1) : '0.0'}/10
                  </div>
                  <div className="text-sm opacity-90">Performance Score</div>
                </div>
              </div>
              <div className="mt-2 bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${taskStats.performanceGrade?.percentage || 0}%` }}
                ></div>
              </div>
            </div>


            {/* ✅ NEW: Recent Rated Tasks Section */}
            {recentRatedTasks.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Recent Performance
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {recentRatedTasks.slice(0, 5).map((task) => (
                    <div key={task._id} className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-lg p-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-center">
                          <div className="text-xs font-bold text-green-600">
                            {task.hodRating?.score || 'N/A'}/5
                          </div>
                          <div className="text-xs text-gray-500">HOD</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-blue-600">
                            {task.performanceScore ? task.performanceScore.toFixed(1) : 'N/A'}/10
                          </div>
                          <div className="text-xs text-gray-500">Score</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completion Rate Indicator (Enhanced) */}
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg p-4 text-white mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">Task Completion</div>
                  <div className="text-sm opacity-90">Based on completed vs total tasks</div>
                </div>
                <div className="text-3xl font-bold">{taskStats.completionRate}%</div>
              </div>
              <div className="mt-2 bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${taskStats.completionRate}%` }}
                ></div>
              </div>
              {taskStats.avgCompletionTime > 0 && (
                <div className="mt-2 text-sm opacity-90">
                  Avg. completion time: {taskStats.avgCompletionTime} days
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-8">
            <div className="bg-gray-50 rounded-xl p-4 shadow flex-1">
              <h3 className="text-lg font-bold text-indigo-700 mb-2">Monthly Task Performance (Bar Chart)</h3>
              {taskData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={taskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Completed" fill="#10B981" name="Completed" />
                    <Bar dataKey="Pending" fill="#F59E0B" name="Pending" />
                    <Bar dataKey="Missed" fill="#EF4444" name="Missed/Overdue" />
                    {/* ✅ NEW: Performance Score Bar */}
                    <Bar dataKey="Performance" fill="#8B5CF6" name="Avg Performance" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <div className="font-medium">No task data available</div>
                    <div className="text-sm mt-1">No tasks found for this staff member</div>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-4 shadow flex-1">
              <h3 className="text-lg font-bold text-indigo-700 mb-2">Performance Trend (Area Chart)</h3>
              {taskData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={taskData}>
                    <CartesianGrid stroke="#ccc" strokeDasharray="7 5" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <defs>
                      <linearGradient id="CompletedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="RatingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="PerformanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="Completed" stroke="#10B981" fill="url(#CompletedGradient)" name="Completed Tasks" />
                    <Area type="monotone" dataKey="Rating" stroke="#3B82F6" fill="url(#RatingGradient)" name="Average Rating" />
                    <Area type="monotone" dataKey="Performance" stroke="#8B5CF6" fill="url(#PerformanceGradient)" name="Performance Score" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <div className="font-medium">No performance data available</div>
                    <div className="text-sm mt-1">Performance trends will appear here once tasks are rated</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
