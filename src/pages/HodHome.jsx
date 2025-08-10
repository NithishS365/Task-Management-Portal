import React, { useState, useEffect, useMemo, useCallback } from 'react';
import staff from "../Data/Staff.json";
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
import { data } from "../Data/data";
import { Header } from "../components/Header";
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

  const myView = useMemo(() => ({ calendar: { labels: true } }), []);

  const handleToastClose = useCallback(() => {
    setToastOpen(false);
  }, []);

  const handleEventClick = useCallback((args) => {
    setToastText(args.event.title);
    setToastOpen(true);
  }, []);

  useEffect(() => {
    setEvents(data);
  }, []);

  // Sample data for MixBarChart
  const mixBarData = [
    { name: 'Jan', Completed: 30, Pending: 20, Missed: 5 },
    { name: 'Feb', Completed: 50, Pending: 15, Missed: 2 },
    { name: 'Mar', Completed: 40, Pending: 25, Missed: 4 },
    { name: 'Apr', Completed: 60, Pending: 10, Missed: 1 },
    { name: 'May', Completed: 45, Pending: 20, Missed: 3 },
    { name: 'Jun', Completed: 70, Pending: 5, Missed: 0 }
  ];

  // Donut chart data
  const donutData = [
    { name: 'High', value: 60 },
    { name: 'Medium', value: 25 },
    { name: 'Low', value: 15 }
  ];
  const COLORS = ['#EF4444', '#3B82F6','#10B981'];

  // Overdue tasks (sample)
  const overdueTasks = [
    { id: 1, title: "Submit Internal Marks", staff: "Shobana", due: "2025-08-10", urgent: true },
    { id: 2, title: "Update Lab Records", staff: "Diwakar", due: "2025-08-12", urgent: false },
    { id: 3, title: "Course File Review", staff: "Parvathy", due: "2025-08-13", urgent: true },
    { id: 4, title: "Syllabus Upload", staff: "Priya", due: "2025-08-14", urgent: false }
  ];

  return (
    <div className=" bg-gray-100  overflow-y-auto">
      <Header />
      <ToastContainer />
      <div className="w-full  max-w-7xl mx-auto flex flex-col gap-6 py-6 px-2">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-100 rounded-2xl p-6 shadow text-center flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-orange-600">54</h2>
            <p className="text-gray-700 font-semibold mt-2">Total Tasks</p>
          </div>
          <div className="bg-yellow-100 rounded-2xl p-6 shadow text-center flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-yellow-600">7</h2>
            <p className="text-gray-700 font-semibold mt-2">Total Staffs</p>
          </div>
          <div className="bg-sky-200 rounded-2xl p-6 shadow text-center flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-sky-600">5.64/staff</h2>
            <p className="text-gray-700 font-semibold mt-2">Task Distribution Ratio</p>
          </div>
          <div className="bg-green-100 rounded-2xl p-6 shadow text-center flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-green-600">45</h2>
            <p className="text-gray-700 font-semibold mt-2">Tasks Completed</p>
          </div>
          <div className="bg-blue-100 rounded-2xl p-6 shadow text-center flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-blue-600">12</h2>
            <p className="text-gray-700 font-semibold mt-2">Tasks on Approval</p>
          </div>
          <div className="bg-red-100 rounded-2xl p-6 shadow text-center flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-red-600">8</h2>
            <p className="text-gray-700 font-semibold mt-2">Tasks Pending</p>
          </div>
        </div>

        {/* Overdue Tasks & Top Staff */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Overdue Tasks */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col">
            <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
              <span className="text-xl">⏰</span> Overdue Tasks
            </h2>
            <ul className="space-y-3">
              {overdueTasks.map((task) => (
                <li
                  key={task.id}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl shadow-sm ${
                    task.urgent
                      ? "bg-red-50 border-l-4 border-red-400"
                      : "bg-yellow-50 border-l-4 border-yellow-400"
                  }`}
                >
                  <div>
                    <span className="font-semibold text-gray-800">{task.title}</span>
                    <span className="ml-2 text-xs text-gray-500">({task.staff})</span>
                    <span className="ml-2 text-xs text-gray-500">Due: {task.due}</span>
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
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col">
            <h2 className="text-center text-indigo-600 font-bold text-lg mb-4">
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
            <div
              className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
              style={{ maxHeight: "180px" }}
            >
              {staff.slice(0, 3).map((person, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 px-2 py-2 text-sm border-b last:border-none items-center"
                >
                  <span>{index + 1}</span>
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
                  <span className="text-center text-yellow-500">★★★★★</span>
                  <span className="text-center text-indigo-600 font-semibold">1</span>
                  <span className="text-right text-indigo-600 font-semibold">1</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* MixBarChart */}
          <div className="bg-white rounded-2xl p-6 shadow flex flex-col justify-center min-h-[400px]">
            <h3 className="text-center text-indigo-600 font-bold text-lg mb-20">
              Task Progress Overview
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={mixBarData}>
                <CartesianGrid stroke="#ccc" strokeDasharray="7 5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Completed" stackId="a" fill="#10B981" barSize={18} />
                <Bar dataKey="Pending" stackId="a" fill="#3B82F6" barSize={18} />
                <Bar dataKey="Missed" stackId="a" fill="#EF4444" barSize={18} />
                <Line type="monotone" dataKey="Completed" stroke="#10B981" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {/* Donut Chart */}
          <div className="bg-white rounded-2xl p-6 shadow flex flex-col justify-center items-center min-h-[400px]">
            <h3 className="text-indigo-600 font-bold text-lg mb-4">
              <span className="text-orange-500">📊</span> Task Distribution (Priority-Based)
            </h3>
            <div className="w-full flex justify-center items-center">
              <ResponsiveContainer width={340} height={320}>
                <PieChart>
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
                    <Label value="Total Tasks" position="center" fill="#374151" fontSize={20} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="flex flex-col space-y-2 mt-2">
              {donutData.map((entry, index) => (
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