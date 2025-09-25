import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import staffData from "../Data/Staff.json";
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

const taskData = [
  { name: 'Jan', Completed: 30, Pending: 20, Missed: 5 },
  { name: 'Feb', Completed: 50, Pending: 15, Missed: 2 },
  { name: 'Mar', Completed: 40, Pending: 25, Missed: 4 },
  { name: 'Apr', Completed: 60, Pending: 10, Missed: 1 },
  { name: 'May', Completed: 45, Pending: 20, Missed: 3 },
  { name: 'Jun', Completed: 70, Pending: 15, Missed: 10 }
];

export const Staff_Stat = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const staff = staffData.find((s) => String(s.id) === String(id) || String(s.t_id) === String(id));

  if (!staff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-red-600 mb-4">Staff data not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-4 px-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2  absolute top-3 text-gray-400 hover:text-gray-700 text-3xl self-start"
        aria-label="Close"
      >
        &times;
      </button>
      <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center max-w-6xl max-h-screen w-full">
        <div className="flex flex-col md:flex-row w-full gap-8">
          <div className="flex flex-col items-center md:w-1/3">
            <img
              src={staff.img_url}
              alt={staff.t_name}
              className="w-36 h-48 border-4 mb-4 shadow object-cover rounded-lg"
            />
            <h2 className="text-sm font-bold text-indigo-800 mb-1">{staff.t_id}</h2>
            <h2 className="text-2xl font-bold text-indigo-800 mb-1">{staff.t_name}</h2>
            <p className="text-gray-600 font-medium mb-1">{staff.design}</p>
            <p className="text-gray-500 text-center text-sm mb-2">{staff.dep}</p>
            <div className="w-full border-t pt-4 mt-4">
              {staff.username && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Username:</span> {staff.username}
                </p>
              )}
              {staff.dob && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Date of Birth:</span> {staff.dob}
                </p>
              )}
              {staff.exp && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Experience:</span> {staff.exp}
                </p>
              )}
              {staff.spec && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Specialization:</span> {staff.spec}
                </p>
              )}
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Email:</span>{" "}
                <a href={`mailto:${staff.email}`} className="text-indigo-600 hover:underline">{staff.email}</a>
              </p>
              {staff.linked_in_id && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">LinkedIn:</span>{" "}
                  <a
                    href={`https://${staff.linked_in_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {staff.linked_in_id}
                  </a>
                </p>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-8">
            <div className="bg-gray-50 rounded-xl p-4 shadow flex-1">
              <h3 className="text-lg font-bold text-indigo-700 mb-2">Faculty Activity (Bar Graph)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={taskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Completed" fill="#10B981" />
                  <Bar dataKey="Pending" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 shadow flex-1">
              <h3 className="text-lg font-bold text-indigo-700 mb-2">Work Distribution (Area Chart)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={taskData}>
                  <CartesianGrid stroke="#ccc" strokeDasharray="7 5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <defs>
                    <linearGradient id="CompletedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10B988" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="PendingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#f59e42" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#f59e42" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="MissedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="Completed" stroke="#10B981" fill="url(#CompletedGradient)" />
                  <Area type="monotone" dataKey="Pending" stroke="#f59e42" fill="url(#PendingGradient)" />
                  <Area type="monotone" dataKey="Missed" stroke="#EF4444" fill="url(#MissedGradient)" />
                  <Area type="monotone" dataKey="Missed" stroke="#EF4444" fill="#f26161" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};