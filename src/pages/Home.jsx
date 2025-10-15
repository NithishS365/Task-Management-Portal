import React, { useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Label,
    Cell,
} from 'recharts';
import { Eventcalendar, setOptions, Toast } from '@mobiscroll/react';
import '@mobiscroll/react/dist/css/mobiscroll.min.css';
import Header from "../components/Header";
import { useTask } from '../context/Taskcontext';
import { useAuth } from '../context/AuthContext';

setOptions({
    theme: 'ios',
    themeVariant: 'light',
});

export function Home() {
    const { tasks, loading } = useTask();
    const { user } = useAuth();
    const [myEvents, setEvents] = useState([]);
    const [isToastOpen, setToastOpen] = useState(false);
    const [toastText, setToastText] = useState();
    const [taskStats, setTaskStats] = useState({
        completed: 0,
        inProgress: 0,
        pending: 0,
        total: 0
    });
    const [taskData, setTaskData] = useState([]);
    const [taskCategories, setTaskCategories] = useState([]);
    const [viewMode, setViewMode] = useState('days'); 
    const myView = { calendar: { labels: true } };

    const handleToastClose = () => {
        setToastOpen(false);
    };
    const handleEventClick = (args) => {
        setToastText(args.event.title);
        setToastOpen(true);
    };

    useEffect(() => {
        if (tasks && tasks.length > 0) {
            // Filter tasks for current user
            const userTasks = tasks.filter(task => 
                task.assignedTo === user?._id || 
                task.assignedTo?._id === user?._id ||
                task.createdBy === user?._id
            );

            const stats = {
                completed: userTasks.filter(task => task.status === 'completed').length,
                inProgress: userTasks.filter(task => task.status === 'in-progress').length,
                pending: userTasks.filter(task => task.status === 'pending' || !task.status).length,
                total: userTasks.length
            };
            setTaskStats(stats);

            // ✅ Generate data based on view mode
            let chartData = [];
            
            if (viewMode === 'months') {
                // Generate monthly data for charts
                const currentYear = new Date().getFullYear();
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                
                for (let i = 0; i < 12; i++) {
                    const monthTasks = userTasks.filter(task => {
                        const taskDate = new Date(task.createdAt);
                        return taskDate.getFullYear() === currentYear && taskDate.getMonth() === i;
                    });
                    
                    chartData.push({
                        name: monthNames[i],
                        Completed: monthTasks.filter(task => task.status === 'completed').length,
                        Pending: monthTasks.filter(task => task.status !== 'completed').length
                    });
                }
            } else {
                // Generate daily data for the last 30 days
                const today = new Date();
                const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
                
                for (let i = 0; i < 30; i++) {
                    const currentDate = new Date(thirtyDaysAgo.getTime() + (i * 24 * 60 * 60 * 1000));
                    const dayString = `Day ${currentDate.getDate()}`; // Format as "Day 14" to avoid date parsing issues
                    
                    const dayTasks = userTasks.filter(task => {
                        const taskDate = new Date(task.createdAt);
                        return taskDate.toDateString() === currentDate.toDateString();
                    });
                    
                    chartData.push({
                        name: dayString,
                        date: currentDate.toISOString().split('T')[0], // for tooltip
                        Completed: dayTasks.filter(task => task.status === 'completed').length,
                        Pending: dayTasks.filter(task => task.status !== 'completed').length
                    });
                }
            }
            
            setTaskData(chartData);

            // Generate task categories from actual data
            const categories = {};
            userTasks.forEach(task => {
                const category = task.category || 'General';
                if (!categories[category]) {
                    categories[category] = { completed: 0, total: 0 };
                }
                categories[category].total++;
                if (task.status === 'completed') {
                    categories[category].completed++;
                }
            });

            const categoryList = Object.entries(categories).map(([name, data]) => ({
                name,
                completed: data.completed,
                rating: data.total > 0 ? ((data.completed / data.total) * 5).toFixed(1) : '0.0'
            }));
            setTaskCategories(categoryList);

            // Generate calendar events from tasks
            const events = userTasks
                .filter(task => task.dueDate)
                .map(task => ({
                    id: task._id,
                    title: task.title,
                    start: new Date(task.dueDate),
                    end: new Date(task.dueDate),
                    color: task.status === 'completed' ? '#10B981' : 
                           task.status === 'in-progress' ? '#3B82F6' : '#EF4444',
                    allDay: true
                }));
            setEvents(events);
        } else {
            setTaskStats({ completed: 0, inProgress: 0, pending: 0, total: 0 });
            setTaskData([]);
            setTaskCategories([]);
            setEvents([]);
        }
    }, [tasks, user, viewMode]); // ✅ Add viewMode to dependency array

    // Pie chart data
    const pieData = [
        { name: 'Completed', value: taskStats.completed },
        { name: 'On Process', value: taskStats.inProgress },
        { name: 'Pending', value: taskStats.pending },
    ].filter(item => item.value > 0); // Only show categories with data

    const COLORS = ['#10B981', '#3B82F6', '#EF4444'];

    return (
        <div className="h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden font-Montserrat flex flex-col">
            <Header />
            {/* Main Content */}
            <div className='p-4 flex-1 flex flex-col min-h-0'>
                {/* Top Section - Reduced height for cards */}
                <div className="grid grid-cols-2 gap-4 h-[55vh] mb-4">

                    {/* Left Column */}
                    <div className="flex flex-col gap-4">
                        {/* Status Cards - Reduced height */}
                        <div className="flex gap-4 h-[25%]">
                            <div className="bg-green-100 h-full w-60 rounded-xl p-3 shadow text-center flex flex-col justify-center">
                                <h2 className="text-4xl font-bold text-green-600">{taskStats.completed}</h2>
                                <p className="text-gray-700 font-semibold text-sm">Tasks Completed</p>
                            </div>
                            <div className="bg-blue-100 h-full w-60 rounded-xl p-3 shadow text-center flex flex-col justify-center">
                                <h2 className="text-4xl font-bold text-blue-600">{taskStats.inProgress}</h2>
                                <p className="text-gray-700 font-semibold text-sm">On Process</p>
                            </div>
                            <div className="bg-red-100 h-full w-60 rounded-xl p-3 shadow text-center flex flex-col justify-center">
                                <h2 className="text-4xl font-bold text-red-600">{taskStats.pending}</h2>
                                <p className="text-gray-700 font-semibold text-sm">Pending</p>
                            </div>
                        </div>

                        {/* Task Categories - Increased height */}
                        <div className="bg-white flex shadow gap-4 flex-1 rounded-xl">
                            <div className="w-full p-4">
                                <h2 className="text-center text-indigo-600 font-bold text-lg mb-4">
                                    Task Categories
                                </h2>
                                
                                {/* Table header */}
                                <div className="grid grid-cols-3 text-gray-600 font-semibold px-2 mb-2">
                                    <span>Category</span>
                                    <span className="text-center">Completed</span>
                                    <span className="text-right">Rating</span>
                                </div>
                                <hr className="mb-2" />

                                {/* Task categories */}
                                {taskCategories.map((task, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-3 px-2 py-3 border-b last:border-none"
                                    >
                                        <span className="font-medium">{task.name}</span>
                                        <span className="text-center">{task.completed}</span>
                                        <span className="text-right text-indigo-600 font-semibold">
                                            {task.rating}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow overflow-hidden">
                        <h3 className="text-lg text-indigo-600 font-bold mb-4">
                            📅 Upcoming Scheduled Tasks
                        </h3>
                        <div className="h-[calc(100%-3rem)]">
                            <Eventcalendar
                                clickToCreate={false}
                                dragToCreate={false}
                                dragToMove={false}
                                dragToResize={false}
                                eventDelete={false}
                                data={myEvents}
                                view={myView}
                                onEventClick={handleEventClick}
                            />
                        </div>
                        <Toast message={toastText} isOpen={isToastOpen} onClose={handleToastClose} />
                    </div>

                </div>

                {/* Bottom Section: Charts - Increased height */}
                <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                    {/* Line Chart */}
                    <div className="bg-white rounded-xl p-4 shadow flex flex-col">
                        <div className="flex items-center mb-4">
                            <h3 className="text-indigo-600 ml-52 font-bold text-lg">
                                Task Progress
                            </h3>
                            {/* ✅ Add dropdown for view mode */}
                            <select
                                value={viewMode}
                                onChange={(e) => setViewMode(e.target.value)}
                                className="px-3 py-1 ml-20 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="days">Last 30 Days</option>
                                <option value="months">This Year (Months)</option>
                            </select>
                        </div>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={taskData}>
                                    <Line type="monotone" dataKey="Completed" stroke="#10B981" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Pending" stroke="#EF4444" strokeWidth={2} />
                                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                    <XAxis 
                                        dataKey="name" 
                                        angle={viewMode === 'days' ? 0 : 0}
                                        textAnchor={viewMode === 'days' ? 'end' : 'middle'}
                                        height={viewMode === 'days' ? 30 : 30}
                                        interval={viewMode === 'days' ? 'preserveStartEnd' : 0}
                                    />
                                    <YAxis />
                                    <Tooltip 
                                        labelFormatter={(value, payload) => {
                                            if (viewMode === 'days' && payload && payload[0]) {
                                                return `Date: ${value}`;
                                            }
                                            return viewMode === 'days' ? `Day: ${value}` : `Month: ${value}`;
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white rounded-xl p-4 shadow flex flex-col">
                        <h3 className="text-indigo-600 font-bold text-lg mb-4 text-center">
                            📊 Task Distribution
                        </h3>
                        <div className="flex items-center justify-center flex-1 min-h-0">
                            {/* Pie Chart - Optimized for label visibility */}
                            <div className="flex-1 h-full max-w-[60%]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius="90%"
                                            innerRadius="60%"
                                            dataKey="value"
                                            label={false}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                            <Label value="Total Tasks" position="center" fill="#A0AEC0" fontSize={13} />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Legend - Better positioned and sized */}
                            <div className="flex flex-col justify-center space-y-3 ml-6 min-w-[120px]">
                                {pieData.map((entry, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <div className="w-4 h-4 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <div className="text-gray-700 font-medium text-sm">
                                            <div>{entry.name}</div>
                                            <div className="text-gray-500 text-xs">({entry.value} tasks)</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}