import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTask } from '../context/Taskcontext';
import { getStaff } from '../services/api';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  PieChart,
  Pie,
  Cell,
  Label,
} from 'recharts';

import '@mobiscroll/react/dist/css/mobiscroll.min.css';

import  Header  from "../components/Header";
import {
  IoClipboardOutline,
  IoPeopleOutline,
  IoGitNetworkOutline,
  IoCheckmarkDoneCircleOutline,
  IoHourglassOutline,
  IoAlertCircleOutline
} from "react-icons/io5";
import { setOptions } from "@mobiscroll/react";
import { ToastContainer, toast } from 'react-toastify';
setOptions({
  theme: 'ios',
  themeVariant: 'light'
});

export function HodHome() {
  const [myEvents, setEvents] = useState([]);
  const [isToastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState();
  const [staff, setStaff] = useState([]);
  // ✅ NEW: Add view mode state
  const [viewMode, setViewMode] = useState('days'); // 'days' or 'months'

  const myView = useMemo(() => ({ calendar: { labels: true } }), []);

  const handleToastClose = useCallback(() => {
    setToastOpen(false);
  }, []);

  const handleEventClick = useCallback((args) => {
    setToastText(args.event.title);
    setToastOpen(true);
  }, []);

  // Get tasks data from context
  const { tasks, fetchTasks } = useTask();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch staff data from MongoDB
        const response = await getStaff();
        console.log('📋 Staff data fetched:', response);
        
        // Extract users array from response and map fields for compatibility
        const staffData = response.users || response || [];
        const mappedStaff = staffData.map(user => ({
          ...user,
          t_name: user.name || user.fullName,
          img_url: user.imageUrl || 'https://via.placeholder.com/150'
        }));
        
        setStaff(mappedStaff);
      } catch (error) {
        console.error('❌ Error fetching staff data:', error);
        setStaff([]); // Set empty array as fallback
      }
    };

    fetchData();
    fetchTasks(); // Fetch tasks when component mounts
  }, [fetchTasks]);

  // Dynamic data for MixBarChart based on real tasks and view mode
  const mixBarData = useMemo(() => {
    if (viewMode === 'months') {
      // Monthly view (existing logic)
      const monthlyData = {};
      const currentDate = new Date();
      
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        monthlyData[monthKey] = { name: monthKey, Completed: 0, Pending: 0, Missed: 0 };
      }
      
      // Process real tasks data if available
      if (tasks && tasks.length > 0) {
        tasks.forEach(task => {
          const taskDate = new Date(task.completedAt || task.dueDate || task.createdAt);
          const monthKey = taskDate.toLocaleDateString('en-US', { month: 'short' });
          
          if (monthlyData[monthKey]) {
            if (task.status === 'completed') {
              monthlyData[monthKey].Completed++;
            } else if (task.status === 'pending' || !task.status) {
              monthlyData[monthKey].Pending++;
            } else if (new Date(task.dueDate) < currentDate && task.status !== 'completed') {
              monthlyData[monthKey].Missed++;
            }
          }
        });
      }
      
      return Object.values(monthlyData);
    } else {
      // Daily view for last 30 days
      const dailyData = {};
      const today = new Date();
      const currentDate = new Date();
      
      // Initialize last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
        const dayKey = `Day ${date.getDate()}`; // Format as "Day 14" to avoid date parsing issues
        dailyData[dayKey] = { 
          name: dayKey, 
          date: date.toISOString().split('T')[0],
          Completed: 0, 
          Pending: 0, 
          Missed: 0 
        };
      }

      // Process real tasks data if available
      if (tasks && tasks.length > 0) {
        tasks.forEach(task => {
          const taskDate = new Date(task.completedAt || task.dueDate || task.createdAt);
          const dayKey = `Day ${taskDate.getDate()}`; // Format as "Day 14" to avoid date parsing issues
          
          if (dailyData[dayKey]) {
            if (task.status === 'completed') {
              dailyData[dayKey].Completed++;
            } else if (task.status === 'pending' || !task.status) {
              dailyData[dayKey].Pending++;
            } else if (new Date(task.dueDate) < currentDate && task.status !== 'completed') {
              dailyData[dayKey].Missed++;
            }
          }
        });
      }
      
      return Object.values(dailyData);
    }
  }, [tasks, viewMode]);

  // Dynamic donut chart data based on task priorities
  const donutData = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return [
        { name: 'No Data', value: 1 }
      ];
    }
    
    const priorities = { high: 0, medium: 0, low: 0 };
    tasks.forEach(task => {
      const priority = task.priority || 'medium';
      priorities[priority]++;
    });
    
    return [
      { name: 'High', value: priorities.high },
      { name: 'Medium', value: priorities.medium },
      { name: 'Low', value: priorities.low }
    ].filter(item => item.value > 0);
  }, [tasks]);
  
  const COLORS = ['#EF4444', '#3B82F6','#10B981'];

  // Dynamic overdue tasks from real data
  const overdueTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    const currentDate = new Date();
    return tasks
      .filter(task => 
        new Date(task.dueDate) < currentDate && 
        task.status !== 'completed' && 
        task.status !== 'submitted'
      )
      .slice(0, 4) // Show only first 4
      .map(task => ({
        id: task._id,
        title: task.title,
        staff: task.assignedTo?.name || 'Unassigned',
        due: new Date(task.dueDate).toISOString().split('T')[0],
        urgent: task.priority === 'high' || task.priority === 'urgent'
      }));
  }, [tasks]);

  // Dynamic task statistics
  const taskStats = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        total: 0,
        completed: 0,
        forApproval: 0,
        pending: 0,
        totalStaff: staff.length || 0,
        ratio: 0
      };
    }
    
    const completed = tasks.filter(task => task.status === 'completed').length;
    const forApproval = tasks.filter(task => task.status === 'ForApproval').length;
    const pending = tasks.filter(task => task.status === 'pending' || !task.status).length;
    const totalStaff = staff.length || 0;
    const ratio = totalStaff > 0 ? (tasks.length / totalStaff).toFixed(2) : 0;
    
    return {
      total: tasks.length,
      completed,
      forApproval,
      pending,
      totalStaff,
      ratio
    };
  }, [tasks, staff]);

  return (
<div className="p-2 h-screen bg-gray-100 dark:bg-gray-900 overflow-y-auto">
      <Header />
      <ToastContainer />
      <div className="w-full  mx-auto flex flex-col gap-6 py-4 px-2">

      
       
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Tasks */}
          <div className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-200 dark:border-orange-700/50 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-500 dark:bg-orange-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                <IoClipboardOutline className="text-white" size={20} />
              </div>
              <div className="text-right">
                <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">Total</div>
                <div className="text-xs text-orange-500 dark:text-orange-500">Tasks</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
                  {taskStats.total}
                </h2>
                <span className="text-xs text-white dark:text-white font-medium bg-orange-600 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                  +5 this week
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-xs">Active Tasks in System</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-orange-200 dark:bg-orange-800 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-1.5 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
                </div>
                <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">85%</span>
              </div>
            </div>
          </div>

          {/* Total Staff */}
          <div className="group bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-200 dark:border-yellow-700/50 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-500 dark:bg-yellow-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                <IoPeopleOutline className="text-white" size={20} />
              </div>
              <div className="text-right">
                <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Total</div>
                <div className="text-xs text-yellow-500 dark:text-yellow-500">Staff</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-700 dark:group-hover:text-yellow-300 transition-colors">
                  {taskStats.totalStaff}
                </h2>
                <span className="text-xs text-white dark:text-white font-medium bg-yellow-500 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                  100% active
                </span>
              </div>
             <p className="text-gray-700 dark:text-gray-300 font-medium text-xs">Faculty Members</p>
              <div className="flex -space-x-1 items-center">
                {staff.slice(0, 4).map((person, i) => (
                  <div 
                    key={i} 
                    className="w-4 h-4 rounded-full border border-white dark:border-gray-800 overflow-hidden animate-pulse group-hover:scale-110 transition-transform duration-300" 
                    style={{ animationDelay: `${i * 0.2}s` }}
                    title={person.t_name}
                  >
                    <img
                      src={person.img_url}
                      alt={person.t_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {staff.length > 4 && (
                  <div className="w-4 h-4 bg-yellow-300 dark:bg-yellow-600 rounded-full border border-white dark:border-gray-800 flex items-center justify-center ml-1">
                    <span className="text-xs text-yellow-800 dark:text-yellow-200 font-bold">+{staff.length - 4}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Task Distribution Ratio */}
          <div className="group bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-sky-200 dark:border-sky-700/50 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-sky-500 dark:bg-sky-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                <IoGitNetworkOutline className="text-white" size={20} />
              </div>
              <div className="text-right">
                <div className="text-xs text-sky-600 dark:text-sky-400 font-medium">Average</div>
                <div className="text-xs text-sky-500 dark:text-sky-500">Per Staff</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl font-bold text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors">
                  {taskStats.ratio}
                </h2>
                <span className="text-xs text-white dark:text-white font-medium bg-sky-500 dark:bg-sky-900/30 px-2 py-1 rounded-full">
                  Balanced
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-xs">Tasks per Staff Member</p>
              <div className="grid grid-cols-7 gap-1">
                {[100, 85, 92, 78, 95, 88, 77].map((value, i) => (
                  <div key={i} className="bg-sky-200 dark:bg-sky-800 rounded-sm h-3 flex items-end">
                    <div 
                      className="bg-sky-500 dark:bg-sky-600 rounded-sm w-full transition-all duration-700" 
                      style={{ height: `${value}%`, animationDelay: `${i * 0.1}s` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks Completed */}
          <div className="group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200 dark:border-green-700/50 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-500 dark:bg-green-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                <IoCheckmarkDoneCircleOutline className="text-white" size={20} />
              </div>
              <div className="text-right">
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Success</div>
                <div className="text-xs text-green-500 dark:text-green-500">Rate: 83%</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                  {taskStats.completed}
                </h2>
                <span className="text-xs text-white dark:text-white font-medium bg-green-500 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  ↗ +12%
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-xs">Successfully Completed</p>
              <div className="relative">
                <div className="flex items-center gap-1">
                  <div className="flex-1 bg-green-200 dark:bg-green-800 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full animate-pulse transition-all duration-500" style={{ width: '83%' }}></div>
                  </div>
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks on Approval */}
          <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 dark:border-blue-700/50 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-500 dark:bg-blue-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300 relative">
                <IoHourglassOutline className="text-white" size={20} />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full"></div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">⏳ Pending</div>
                <div className="text-xs text-blue-500 dark:text-blue-500">Review</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  {taskStats.forApproval}
                </h2>
                <span className="text-xs text-white dark:text-white font-medium bg-blue-500 dark:bg-blue-900/30 px-2 py-1 rounded-full ">
                  2.3 days avg
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-xs">Awaiting Approval</p>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className={`h-2 flex-1 rounded-sm ${i <= 3 ? 'bg-blue-500 dark:bg-blue-600' : 'bg-blue-200 dark:bg-blue-800'} transition-all duration-300`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold ml-1">60%</span>
              </div>
            </div>
          </div>

          {/* Tasks Pending */}
          <div className="group bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-200 dark:border-red-700/50 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-500 dark:bg-red-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300 relative">
                <IoAlertCircleOutline className="text-white" size={20} />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
              </div>
              <div className="text-right">
                <div className="text-xs text-red-600 dark:text-red-400 font-medium">⚠ Alert</div>
                <div className="text-xs text-red-500 dark:text-red-500">3 Overdue</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                  {taskStats.pending}
                </h2>
                <span className="text-xs text-white dark:text-white font-medium bg-red-500 dark:bg-red-900/30 px-2 py-1 rounded-full">
                  Urgent
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-xs">Pending Tasks</p>
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-xs text-red-600 dark:text-red-400 font-semibold">3 due in 24h</span>
              </div>
            </div>
          </div>
        </div>



         {/* Overdue Tasks & Top Staff */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-0">
          {/* Overdue Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 flex flex-col">
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <span className="text-xl">⏰</span> Overdue Tasks
            </h2>
            <ul className="space-y-3">
              {overdueTasks.map((task) => (
                <li
                  key={task.id}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl shadow-sm ${
                    task.urgent
                      ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600"
                      : "bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600"
                  }`}
                >
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{task.title}</span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({task.staff})</span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">Due: {task.due}</span>
                  </div>
                  {task.urgent && (
                    <button
                      className="ml-2 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow transition"
                      onClick={() => toast.success(`Notify sent to ${task.staff}`)}
                    >
                      Notify
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {/* Top Performing Staffs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 flex flex-col">
            <h2 className="text-center text-indigo-600 dark:text-indigo-400 font-bold text-lg mb-4">
              Top Performing Staffs
            </h2>
            {/* Table header */}
            <div className="grid grid-cols-5 text-gray-600 dark:text-gray-400 font-semibold px-2 mb-2 text-sm">
              <span>S.No</span>
              <span>Staff</span>
              <span className="text-center">Rating</span>
              <span className="text-center">Tasks Completed</span>
              <span className="text-right">On Progress</span>
            </div>
            <hr className="dark:border-gray-700" />
            <div
              className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
              style={{ maxHeight: "180px" }}
            >
              {staff.slice(0, 3).map((person, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 px-2 py-2 text-sm border-b dark:border-gray-700 last:border-none items-center"
                >
                  <span className=" dark:text-gray-300">{index + 1}</span>
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 py-1 px-2 rounded-full shadow-sm w-fit">
                    <img
                      src={person.img_url}
                      alt={person.t_name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[100px]">
                      {person.t_name}
                    </span>
                  </div>
                  <span className="text-center text-yellow-500">★★★★★</span>
                  <span className="text-center text-indigo-600 dark:text-indigo-400 font-semibold">1</span>
                  <span className="text-right text-indigo-600 font-semibold">1</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* MixBarChart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow flex flex-col justify-center min-h-[400px]">
            <div className="flex justify-between items-center mb-20">
              <h3 className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                Task Progress Overview
              </h3>
              {/* ✅ Add dropdown for view mode */}
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="days">Last 30 Days</option>
                <option value="months">Last 6 Months</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={mixBarData}>
                <CartesianGrid stroke="#4A5568" strokeDasharray="7 5" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#A0AEC0' }}
                  angle={viewMode === 'days' ? -45 : 0}
                  textAnchor={viewMode === 'days' ? 'end' : 'middle'}
                  height={viewMode === 'days' ? 60 : 30}
                  interval={viewMode === 'days' ? 'preserveStartEnd' : 0}
                />
                <YAxis tick={{ fill: '#A0AEC0' }} />
                <Tooltip 
                  labelFormatter={(value, payload) => {
                    if (viewMode === 'days' && payload && payload[0]) {
                      return `Date: ${value}`;
                    }
                    return viewMode === 'days' ? `Day: ${value}` : `Month: ${value}`;
                  }}
                />
                <Legend />
                <Bar dataKey="Completed" stackId="a" fill="#10B981" barSize={18} />
                <Bar dataKey="Pending" stackId="a" fill="#3B82F6" barSize={18} />
                <Bar dataKey="Missed" stackId="a" fill="#EF4444" barSize={18} />
                <Line type="monotone" dataKey="Completed" stroke="#10B981" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {/* Donut Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow flex flex-col justify-center items-center min-h-[400px]">
            <h3 className="text-indigo-600 dark:text-indigo-400 font-bold text-lg mb-4">
              <span className="text-orange-500">📊</span> Task Distribution (Priority-Based)
            </h3>
            <div className="w-full flex justify-center items-center">
              <PieChart width={540} height={320}>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <Label value="Total Tasks" position="center" fill="#A0AEC0" fontSize={20} />
                </Pie>
              </PieChart>
            </div>
            {/* Custom Legend */}
            <div className="flex flex-col space-y-2 mt-2">
              {donutData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

       
       
      </div>
    </div>
  );
}