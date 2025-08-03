import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import Img from '../assets/cuteboy.png';

export const Profile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const currentEmail = localStorage.getItem('currentUser');
    const allUsers = JSON.parse(localStorage.getItem('users')) || {};

    if (currentEmail && allUsers[currentEmail]) {
      setUserData(allUsers[currentEmail]);
    }
  }, []);

  if (!userData) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-600 text-xl">
        No user data found. Please log in.
      </div>
    );
  }

  return (
    <div className="bg-gray-100 overflow-auto h-screen">
      <Header />

      <div className="max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-white text-xl font-bold">Admin Profile</h2>
            <p className="text-indigo-200 text-sm">Manage your personal info & account</p>
          </div>
          <img
            src={Img}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
          />
        </div>

        {/* Profile Info Section */}
        <div className="px-6 pt-8 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-gray-700 text-sm">
          <div>
            <p className="text-gray-500 font-medium">Full Name</p>
            <p className="text-indigo-800 font-semibold">{userData.fullName}</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">Email Address</p>
            <p className="text-indigo-800 font-semibold">{userData.email}</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">Password</p>
            <p className="text-indigo-800 font-semibold"></p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">Role</p>
            <p className="text-indigo-800 font-semibold">User</p>
          </div>

          {/* Optional: Add more fields if saved during registration */}
        </div>

        {/* Edit Button */}
        <div className="px-6 py-4 flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded-md shadow">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};
