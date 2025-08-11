import React, { useState, useEffect, useMemo, useCallback } from 'react';
import staff from "../Data/staff.json"
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
        Cell,
        Legend
} from 'recharts';
import { Eventcalendar, getJson, setOptions, Toast } from '@mobiscroll/react';
import '@mobiscroll/react/dist/css/mobiscroll.min.css';
import { data } from "../Data/data"
import { Header } from "../components/Header"
setOptions({
        theme: 'ios',
        themeVariant: 'light'
});

export function HodHome() {
        const [myEvents, setEvents] = useState([]);
        const [isToastOpen, setToastOpen] = useState(false);
        const [toastText, setToastText] = useState();

        const myView = useMemo(() => ({ calendar: { labels: true } }), []);

                const tasks = [
        {
        name: "Prepare Semester Report",
        dueDate: "2025-08-10",

        },
        {
        name: "Lab Equipment Audit",
        dueDate: "2025-08-10",

        },
        {
        name: "Faculty Meeting",
        dueDate: "2025-08-10",

        },
        {
        name: "Student Feedback Collection",
        dueDate: "2025-08-10",

        },
        {
        name: "Update Faculty Profiles",
        dueDate: "2025-08-10",

        },
        {
        name: "Organize Workshop",
        dueDate: "2025-09-10",

        },
        {
        name: "Library Book Purchase",
        dueDate: "2025-08-10",

        }
        ];


        const handleToastClose = useCallback(() => {
                setToastOpen(false);
        }, []);

        const handleEventClick = useCallback((args) => {
                setToastText(args.event.title);
                setToastOpen(true);
        }, []);

        useEffect(() => {console.log(data)
    setEvents(data);
}, []);


        const taskData = [
                { name: 'Jan', Completed: 30, Pending: 20 },
                { name: 'Feb', Completed: 50, Pending: 15 },
                { name: 'Mar', Completed: 40, Pending: 25 },
                { name: 'Apr', Completed: 60, Pending: 10 },
                { name: 'May', Completed: 45, Pending: 20 },
                { name: 'Jun', Completed: 70, Pending: 5 }
        ];

        const pieData = [
                { name: 'Completed', value: 60 },
                { name: 'On Process', value: 25 },
                { name: 'Pending', value: 15 }
        ];

        const COLORS = ['#10B981', '#3B82F6', '#EF4444'];

        return (
                <div className="p-4  h-screen ">
                        < Header />
                        {/* Top Section */}
                        <div className="grid grid-cols-2 grid-rows-3 gap-2 h-[58%]">
                                {/* Left column - stacked status cards */}
                                <div className=" flex gap-3 row-span-1 ">
                                        <div className="bg-green-100 h-auto w-60 rounded-xl p-4 shadow text-center">
                                                <h2 className="text-4xl font-bold text-green-600">45</h2>
                                                <p className="text-gray-700 font-semibold">Tasks Assigned</p>
                                        </div>
                                        <div className="bg-blue-100 h-auto w-52 rounded-xl p-4 shadow text-center">
                                                <h2 className="text-4xl font-bold text-blue-600">12</h2>
                                                <p className="text-gray-700 font-semibold">On Process</p>
                                        </div>
                                        <div className="bg-red-100 h-auto w-40 rounded-xl p-4 shadow text-center">
                                                <h2 className="text-4xl font-bold text-red-600">8</h2>
                                                <p className="text-gray-700 font-semibold">For Approval </p>
                                        </div>
                                </div>


                                {/* Overdues Card */}
<div className="bg-white rounded-xl shadow p-4 flex flex-col justify-between">
  <h2 className="text-center text-red-500 font-bold text-lg mb-3">Overdues</h2>
  <div className="overflow-y-auto max-h-[280px]">
    {tasks.slice(0, 4).map((task, idx) => (
      <div key={idx} className="border-b py-2 last:border-0 flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-800">{task.name}</p>
          <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
        </div>
        <button className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs hover:bg-red-200">
          Remind
        </button>
      </div>
    ))}
  </div>
</div>


                                <div className="bg-white flex shadow gap-4 row-span-2 rounded-xl">
                                <div className="w-full p-4">
                                <h2 className="text-center text-indigo-600 font-bold text-lg mb-2">
                                Top Performing Staffs
                                </h2>

                                {/* Table header */}
                                <div className="grid grid-cols-5 text-gray-600 font-semibold px-2 mb-2 text-sm">
                                <span>S.No</span>
                                <span>Staff</span>
                                <span className="text-center">Rating</span>
                                <span className="text-center">Tasks Completed</span>
                                <span className="text-right">On Progress</span>
                                </div>
                                <hr />

                                {/* Limit container height to exactly fit 3 rows */}
                                <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
                                        style={{ maxHeight: "180px" }}> 
                                {staff.slice(0, 3).map((person, index) => (
                                        <div
                                        key={index}
                                        className="grid grid-cols-5 px-2 py-1 text-sm border-b last:border-none items-center"
                                        >
                                        {/* Serial No */}
                                        <span>{index + 1}</span>

                                        {/* Staff image + name */}
                                        <div className="flex items-center gap-2 bg-blue-50 py-1 px-2 rounded-full shadow-sm w-fit">
                                        <img
                                        src={person.img_url}
                                        alt={person.t_name}
                                        className="w-7 h-7 rounded-full object-cover"
                                        />
                                        <span className="text-sm font-medium text-gray-800 truncate max-w-[100px]">
                                        {person.t_name}
                                        </span>
                                        </div>

                                        {/* Rating */}
                                        <span className="text-center text-yellow-500">★★★★★</span>

                                        {/* Tasks Completed */}
                                        <span className="text-center text-indigo-600 font-semibold">1</span>

                                        {/* On Progress */}
                                        <span className="text-right text-indigo-600 font-semibold">1</span>
                                        </div>
                                ))}
                                </div>
                                </div>
                                </div>

                        </div>
   
                        {/* Spacer */}
                        <div className="my-2" />

                        {/* Bottom Section: Charts */}
                        <div className="grid grid-cols-2 gap-2 h-[35%]">
                                {/* Line Chart */}
                                <div className="bg-white rounded-xl p-4 shadow">
                                        <h3 className="text-center  text-indigo-600 font-bold text-lg  mb-2">Task Completion Over Time</h3>
                                        <ResponsiveContainer width="90%" height="90%">
                                                <LineChart data={taskData}>
                                                        <Line type="monotone" dataKey="Completed" stroke="#10B981" strokeWidth={2} />
                                                        <Line type="monotone" dataKey="Pending" stroke="#EF4444" strokeWidth={2} />
                                                        <CartesianGrid stroke="#ccc" strokeDasharray="7 5" />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip />
                                                </LineChart>
                                        </ResponsiveContainer>
                                </div>

                                {/* Pie Chart */}
                                <div className="bg-white rounded-xl p-4 shadow flex flex-col">
                                        <h3 className=" text-indigo-600 font-bold text-lg  mb-4"><span className="text-orange-500">📅</span> Task Distribution</h3>

                                        {/* Flex container for pie chart and custom legend */}
                                        <div className="flex items-center justify-between h-full">
                                                {/* Pie Chart */}
                                                <ResponsiveContainer width="50%" height="100%">
                                                        <PieChart>
                                                                <Pie
                                                                        data={pieData}
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        labelLine={false}
                                                                        outerRadius={80}
                                                                        dataKey="value"

                                                                >
                                                                        {pieData.map((entry, index) => (
                                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                        ))}
                                                                </Pie>
                                                        </PieChart>
                                                </ResponsiveContainer>

                                                {/* Custom Legend */}
                                                <div className="flex flex-col space-y-2 pr-4">
                                                        {pieData.map((entry, index) => (
                                                                <div key={index} className="flex items-center space-x-2">
                                                                        <div
                                                                                className="w-4 h-4 rounded-sm"
                                                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                                        />
                                                                        <span className="text-gray-700 font-medium">{entry.name}</span>
                                                                </div>
                                                        ))}
                                                </div>
                                        </div>
                                </div>

                        </div>
                </div>
        );
}
