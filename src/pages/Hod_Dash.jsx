import React from 'react'
import { Header } from '../components/Header'
import logo from "../assets/logo2.png"

export const Hod_Dash = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-[230px] bg-white flex flex-col py-5 px-4">
        <div className="flex items-center justify-center mb-10">
          <img src={logo} width={40} alt="Logo" />
          <h1 className="text-3xl font-mono font-bold ml-2">TaskRise</h1>
        </div>
        <nav className="flex flex-col gap-4 font-Montserrat text-lg">
          <button className="text-indigo-600 font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="#6366f1"><path d="M12 2 2 7v2c0 5.25 3.66 10.74 10 13 6.34-2.26 10-7.75 10-13V7Zm0 2.18 7.5 3.75V9c0 4.5-3.09 9.09-7.5 11.13C7.59 18.09 4.5 13.5 4.5 9V7.93ZM12 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/></svg>
            HoD Dashboard
          </button>
          <button className="text-gray-500 flex items-center gap-2 hover:text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" height="22" width="22" fill="#6b7280"><path d="M3 6v12h16V6zm2 2h12v8H5zm2 2v4h8v-4z"/></svg>
            Department Tasks
          </button>
          <button className="text-gray-500 flex items-center gap-2 hover:text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" height="22" width="22" fill="#6b7280"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            Faculty Overview
          </button>
        </nav>
        <button className="mt-auto p-2 text-red-500 font-bold rounded hover:bg-red-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" height="22" width="22" fill="#dc2626"><path d="M16 13v-2H8v2zm-4-9C6.48 4 2 8.48 2 14c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4 0-5.52-4.48-10-10-10zm0 16c-2.21 0-4-1.79-4-4 0-4.42 3.58-8 8-8s8 3.58 8 8c0 2.21-1.79 4-4 4z"/></svg>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <Header />
        <div className="p-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6">Welcome, HoD!</h2>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <span className="text-4xl font-bold text-green-600">12</span>
              <span className="text-gray-700 font-semibold mt-2">Pending Approvals</span>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <span className="text-4xl font-bold text-blue-600">8</span>
              <span className="text-gray-700 font-semibold mt-2">Faculty Submissions</span>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <span className="text-4xl font-bold text-purple-600">3</span>
              <span className="text-gray-700 font-semibold mt-2">Upcoming Meetings</span>
            </div>
          </div>
          {/* Department Overview Table */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-indigo-600 mb-4">Department Task Overview</h3>
            <table className="w-full table-auto text-sm text-left border-collapse">
              <thead>
                <tr className="bg-indigo-100">
                  <th className="px-4 py-2">Faculty</th>
                  <th className="px-4 py-2">Task</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Due Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2">Dr. Smith</td>
                  <td className="px-4 py-2">Prepare Syllabus</td>
                  <td className="px-4 py-2 text-green-600 font-semibold">Completed</td>
                  <td className="px-4 py-2">2024-06-10</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">Ms. Johnson</td>
                  <td className="px-4 py-2">Lab Setup</td>
                  <td className="px-4 py-2 text-yellow-600 font-semibold">Pending</td>
                  <td className="px-4 py-2">2024-06-15</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Mr. Lee</td>
                  <td className="px-4 py-2">Research Paper Review</td>
                  <td className="px-4 py-2 text-blue-600 font-semibold">In Progress</td>
                  <td className="px-4 py-2">2024-06-20</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
