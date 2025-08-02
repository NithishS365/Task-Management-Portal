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

  useEffect(() => {
    getJson(
      'https://trial.mobiscroll.com/events/?vers=5',
      (events) => {
        setEvents(events);
      },
      'jsonp',
    );
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
    <div className="p-4 bg-gray-100 h-screen ">
      <div className=" flex justify-between items-center">  
      <h1 className="text-2xl font-bold text-center mb-2">Hello! User</h1>
      <div className='flex justify-center items-center mb-2'>
      <button className="hover:scale-110 transition-transform ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="27px" fill="00000">
            <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/>
          </svg>
        </button>
        <button className="hover:scale-110 transition-transform ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="27px" fill="00000">
            <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z"/>
          </svg>
        </button>
        <select className="p-2 rounded-xl bg-white text-gray-700 shadow-sm focus:outline-none">
          <option hidden value="">User</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="student">Student</option>
        </select>
        </div>
      </div>    
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
          <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center gap-2">
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

        <div className="bg-white flex shadow row-span-2 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center "></h3>
                <h3 className="text-lg font-semibold mb-4">📋 Task Statistics</h3>

  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 text-sm">
      <thead className="bg-gray-100 text-gray-700 text-left">
        <tr>
          <th className="px-4 py-2 font-medium">#</th>
          <th className="px-4 py-2 font-medium">Task Name</th>
          <th className="px-4 py-2 font-medium">Assigned To</th>
          <th className="px-4 py-2 font-medium">Status</th>
          <th className="px-4 py-2 font-medium">Deadline</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {[1, 2, 3, 4].map((i) => (
          <tr key={i} className="hover:bg-gray-50 transition">
            <td className="px-4 py-2 font-medium text-gray-600">{i}</td>
            <td className="px-4 py-2 text-gray-800">Design Landing Page</td>
            <td className="px-4 py-2 text-gray-800">John Doe</td>
            <td className="px-4 py-2">
              <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                Completed
              </span>
            </td>
            <td className="px-4 py-2 text-gray-600">Aug 5, 2025</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="my-2" />

      {/* Bottom Section: Charts */}
      <div className="grid grid-cols-2 gap-4 h-[35%]">
        {/* Line Chart */}
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-lg font-semibold mb-2">Task Completion Over Time</h3>
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
  <h3 className="text-lg font-semibold mb-4">Task Distribution</h3>

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
