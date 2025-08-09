import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

export function Home() {
        const [myEvents, setEvents] = useState([]);
        const [isToastOpen, setToastOpen] = useState(false);
        const [toastText, setToastText] = useState();

        const myView = useMemo(() => ({ calendar: { labels: true } }), []);

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
                                                <p className="text-gray-700 font-semibold">Tasks Completed</p>
                                        </div>
                                        <div className="bg-blue-100 h-auto w-52 rounded-xl p-4 shadow text-center">
                                                <h2 className="text-4xl font-bold text-blue-600">12</h2>
                                                <p className="text-gray-700 font-semibold">On Process</p>
                                        </div>
                                        <div className="bg-red-100 h-auto w-40 rounded-xl p-4 shadow text-center">
                                                <h2 className="text-4xl font-bold text-red-600">8</h2>
                                                <p className="text-gray-700 font-semibold">Pending</p>
                                        </div>
                                </div>


                                {/* Calendar spans 3 columns */}
                                <div className="col-span-1 row-span-3 bg-white rounded-xl p-4 shadow overflow-hidden">
                                        <h3 className="text-lg  text-center  text-indigo-600 font-bold mb-2 flex items-center gap-2">
                                                <span className="text-orange-500">📅</span> Upcoming Scheduled Tasks
                                        </h3>
                                        <div className="h-[100%]">
                                                <Eventcalendar
                                                        clickToCreate={true}
                                                        dragToCreate={true}
                                                        dragToMove={true}
                                                        dragToResize={true}
                                                        eventDelete={true}
                                                        data={myEvents}
                                                        view={myView}
                                                        onEventClick={handleEventClick}
                                                />
                                        </div>
                                        <Toast message={toastText} isOpen={isToastOpen} onClose={handleToastClose} />
                                </div>

                                <div className="bg-white flex shadow gap-4 row-span-2 rounded-xl">
                                        <div className="w-full  p-4">
                                                <h2 className="text-center text-indigo-600 font-bold text-lg mb-4">Task Categories Completed</h2>

                                                {/* Table header */}
                                                <div className="grid grid-cols-3 text-gray-600 font-semibold px-2 mb-2 text-sm">
                                                        <span>Task Type</span>
                                                        <span className="text-center">Completed</span>
                                                        <span className="text-right">Rating</span>
                                                </div>
                                                <hr />

                                                {/* Task Data */}
                                                {[
                                                        { name: 'Documentation', completed: 12, rating: 4.7 },
                                                        { name: 'Data Collection', completed: 8, rating: 4.6 },
                                                        { name: 'Time Table Allotment', completed: 5, rating: 4.8 },
                                                        { name: 'Audits', completed: 3, rating: 4.4 }
                                                ].map((task, index) => (
                                                        <div
                                                                key={index}
                                                                className="grid grid-cols-3 px-2 py-2 text-sm border-b last:border-none"
                                                        >
                                                                <span>{task.name}</span>
                                                                <span className="text-center">{task.completed}</span>
                                                                <span className="text-right text-indigo-600 font-semibold">{task.rating}</span>
                                                        </div>
                                                ))}
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
