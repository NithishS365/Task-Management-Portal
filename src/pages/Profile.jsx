import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import staffData from '../Data/Staff.json';

export const Profile = () => {
  const [staff, setStaff] = useState(null);

  useEffect(() => {
    // Assume currentStaffId is stored in localStorage after login/selection
    const currentStaffId = localStorage.getItem('currentStaffId');
    if (currentStaffId) {
      const found = staffData.find(
        (s) => String(s.id) === String(currentStaffId) || String(s.t_id) === String(currentStaffId)
      );
      setStaff(found);
    }
  }, []);

  if (!staff) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-600 text-xl">
        No staff data found. Please log in.
      </div>
    );
  }

  return (
    <div className="bg-gray-100 overflow-auto h-screen">
      <Header />

      <div className="max-w-4xl mx-auto mt-12 bg-white shadow-2xl rounded-3xl overflow-hidden border border-blue-100">
        {/* Profile Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-400 p-8 flex flex-col md:flex-row items-center gap-6 rounded-t-3xl">
          <img
            src={staff.img_url}
            alt={staff.t_name}
            className="w-34 h-32 rounded-md border-2 border-white shadow-lg object-cover"
          />
          <div className="flex-1 flex flex-col items-center md:items-start">
            <h2 className="text-3xl font-bold text-white mb-1">{staff.t_name || staff.name}</h2>
            <p className="text-indigo-100 text-lg font-medium mb-1">{staff.design}</p>
            <p className="text-blue-100 text-sm">{staff.dep}</p>
            <div className="flex gap-2 mt-3">
              {staff.linked_in_id && (
                <a
                  href={`https://${staff.linked_in_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shadow hover:bg-blue-50 transition"
                >
                  LinkedIn
                </a>
              )}
              <a
                href={`mailto:${staff.email}`}
                className="bg-white text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shadow hover:bg-blue-50 transition"
              >
                Email
              </a>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="px-8 pt-10 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12 text-gray-700 text-base bg-white">
          <div>
            <p className="text-gray-500 font-medium mb-1">Full Name</p>
            <p className="text-indigo-800 font-semibold">{staff.t_name || staff.name}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Email Address</p>
            <p className="text-indigo-800 font-semibold">{staff.email}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Department</p>
            <p className="text-indigo-800 font-semibold">{staff.dep}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Designation</p>
            <p className="text-indigo-800 font-semibold">{staff.design}</p>
          </div>
          {staff.phone && (
            <div>
              <p className="text-gray-500 font-medium mb-1">Phone</p>
              <p className="text-indigo-800 font-semibold">{staff.phone}</p>
            </div>
          )}
          {staff.qual && (
            <div>
              <p className="text-gray-500 font-medium mb-1">Qualification</p>
              <p className="text-indigo-800 font-semibold">{staff.qual}</p>
            </div>
          )}
          {staff.exp && (
            <div>
              <p className="text-gray-500 font-medium mb-1">Experience</p>
              <p className="text-indigo-800 font-semibold">{staff.exp}</p>
            </div>
          )}
          {staff.username && (
            <div>
              <p className="text-gray-500 font-medium mb-1">Username</p>
              <p className="text-indigo-800 font-semibold">{staff.username}</p>
            </div>
          )}
        </div>

        {/* Bio Section */}
        {staff.bio && (
          <div className="px-8 pb-8">
            <h3 className="text-lg font-bold text-indigo-700 mb-2">Bio</h3>
            <p className="text-gray-700 bg-indigo-50 rounded-xl p-4 shadow">{staff.bio}</p>
          </div>
        )}

        <div className="px-8 py-6 flex justify-end bg-white rounded-b-3xl">
          <button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-sm px-8 py-3 rounded-lg shadow font-semibold transition">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};
