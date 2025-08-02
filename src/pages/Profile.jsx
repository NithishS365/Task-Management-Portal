import React from 'react';
import { Header } from '../components/Header';
import Img from '../assets/cuteboy.png';

export const Profile = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />

      <div className="max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 flex justify-between items-center rounded-t-2xl">
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
            <p className="text-gray-500 font-medium">Admin ID</p>
            <p className="text-indigo-800 font-semibold">110A</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">Full Name</p>
            <p className="text-indigo-800 font-semibold">Nithish S</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">Role</p>
            <p className="text-indigo-800 font-semibold">Administrator</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">Gender</p>
            <p className="text-indigo-800 font-semibold">Male</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">Date of Birth</p>
            <p className="text-indigo-800 font-semibold">15 August 2002</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">Email Address</p>
            <p className="text-indigo-800 font-semibold">abc123@gmail.com</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">Phone Number</p>
            <p className="text-indigo-800 font-semibold">984123XXXX</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">Address</p>
            <p className="text-indigo-800 font-semibold">Pollachi, Tamil Nadu, India</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">Username</p>
            <p className="text-indigo-800 font-semibold">nithish_admin</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">Password</p>
            <p className="text-indigo-800 font-semibold">********</p>
          </div>
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
