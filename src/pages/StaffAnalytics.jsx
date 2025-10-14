import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Header from '../components/Header';

export const StaffAnalytics = () => {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryStats, setSummaryStats] = useState({});
  const [topPerformers, setTopPerformers] = useState([]);
  const [mostOverdue, setMostOverdue] = useState([]);
  const [chartData, setChartData] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'hod') {
      loadStaffAnalytics();
    }
  }, [user]);

  const loadStaffAnalytics = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading staff analytics...');
      
      const response = await apiService.getAllStaffPerformance();
      console.log('✅ Staff analytics response:', response);
      
      if (response.success) {
        const { staff, summary } = response;
        
        setStaffData(staff);
        setSummaryStats(summary);
        
        // Prepare top performers (top 5)
        const topFive = staff.slice(0, 5);
        setTopPerformers(topFive);
        
        // Prepare most overdue staff (top 5 with highest overdue tasks)
        const overdueStaff = [...staff]
          .sort((a, b) => b.stats.overdueTasks - a.stats.overdueTasks)
          .slice(0, 5)
          .filter(s => s.stats.overdueTasks > 0);
        setMostOverdue(overdueStaff);
        
        // Prepare chart data
        const chartDataFormatted = staff.map(s => ({
          name: s.user.name.split(' ').slice(-1)[0], // Last name only for better display
          completionRate: s.stats.completionRate,
          totalTasks: s.stats.totalTasks,
          completedTasks: s.stats.completedTasks,
          overdueTasks: s.stats.overdueTasks,
          performanceScore: s.stats.averagePerformanceScore || 0,
          fullName: s.user.name
        }));
        setChartData(chartDataFormatted);
        
        toast.success(`Loaded analytics for ${staff.length} staff members`);
      } else {
        throw new Error(response.message || 'Failed to load staff analytics');
      }
    } catch (error) {
      console.error('❌ Error loading staff analytics:', error);
      toast.error(`Failed to load staff analytics: ${error.message}`);
      setStaffData([]);
      setSummaryStats({});
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (completionRate) => {
    if (completionRate >= 90) return 'text-green-600 dark:text-green-400';
    if (completionRate >= 80) return 'text-blue-600 dark:text-blue-400';
    if (completionRate >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (completionRate >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeBadgeColor = (grade) => {
    const colors = {
      'A+': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'A': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'B+': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'B': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'C+': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'C': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[grade] || colors['C'];
  };

  // Chart colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">{data.fullName}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${entry.dataKey === 'completionRate' ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading staff analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-gray-100 mb-2">
            Staff Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive performance analysis and ranking for all faculty members
          </p>
        </div>

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Staff</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {summaryStats.totalStaff || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Completion</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {summaryStats.averageCompletionRate || 0}%
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {summaryStats.totalTasks || 0}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Tasks</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {summaryStats.totalCompletedTasks || 0}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Completion Rate Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Staff Completion Rates
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis className="text-gray-600 dark:text-gray-400" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completionRate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Task Distribution Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Task Distribution Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis className="text-gray-600 dark:text-gray-400" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="totalTasks" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="completedTasks" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.8} />
                <Area type="monotone" dataKey="overdueTasks" stackId="3" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Top Performers
              </h3>
            </div>
            <div className="p-6">
              {topPerformers.length > 0 ? (
                <div className="space-y-4">
                  {topPerformers.map((staff, index) => (
                    <div key={staff.user._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {staff.user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {staff.user.designation}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeBadgeColor(staff.stats.performanceGrade)}`}>
                          {staff.stats.performanceGrade}
                        </span>
                        <p className={`text-sm font-semibold ${getPerformanceColor(staff.stats.completionRate)}`}>
                          {staff.stats.completionRate}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No performance data available
                </p>
              )}
            </div>
          </div>

          {/* Most Overdue */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Attention Needed
              </h3>
            </div>
            <div className="p-6">
              {mostOverdue.length > 0 ? (
                <div className="space-y-4">
                  {mostOverdue.map((staff, index) => (
                    <div key={staff.user._id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {staff.user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {staff.user.designation}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                          {staff.stats.overdueTasks} overdue
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {staff.stats.completionRate}% completion
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">
                    Great! No staff members have overdue tasks
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Staff Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Detailed Staff Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Overdue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {staffData.map((staff, index) => (
                  <tr key={staff.user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-semibold">
                        {staff.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {staff.user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {staff.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {staff.stats.totalTasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                      {staff.stats.completedTasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                      {staff.stats.overdueTasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${staff.stats.completionRate}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${getPerformanceColor(staff.stats.completionRate)}`}>
                          {staff.stats.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeBadgeColor(staff.stats.performanceGrade)}`}>
                        {staff.stats.performanceGrade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={loadStaffAnalytics}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Analytics
              </>
            )}
          </button>
        </div>
      </div>

      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};
