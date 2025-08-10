import React, { useEffect, useState } from "react";
import { FaFileExport } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { IoNotifications } from "react-icons/io5";

const Header = () => {
  const location = useLocation();
  const [headerClass, setHeaderClass] = useState("p-3 bg-gray-100  transition-all duration-300");
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      setHeaderClass("bg-gray-100 ");
    } else {
      setHeaderClass("p-3 bg-gray-100 transition-all duration-300 ");
    }
  }, [location.pathname]);

  useEffect(() => {
    // Try to get name from localStorage for HoD or Staff
    const role = localStorage.getItem('currentRole');
    let name = '';
    if (role === "hod") {
      name = "HoD";
    } else if (role === "faculty") {
      name = localStorage.getItem("currentStaffUsername") || localStorage.getItem("currentStaffEmail") || "Faculty";
    } else {
      // fallback to users object if present
      const email = localStorage.getItem('currentUser');
      const users = JSON.parse(localStorage.getItem('users')) || {};
      if (email && users[email]) {
        name = users[email].fullName;
      }
    }
    setFullName(name);
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className={headerClass}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-lg font-bold text-gray-800 mb-0">
              Welcome back, {fullName || 'Admin'}!
            </h1>
            <p className="text-gray-500 text-xs">
              Dashboard Overview &mdash; {today}
            </p>
          </div>
          <div className="flex items-center gap-2 ">
            <span className="bg-blue-100 text-blue-700 px-2  rounded-full text-xs font-semibold">
              Admin Panel
            </span>
            <span className="bg-green-100 text-green-700 px-2  rounded-full text-xs font-semibold">
              All Systems Operational
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 text-gray-600 text-xs font-medium flex items-center gap-1 shadow-sm">
            <FaFileExport className="w-4 h-4" />
            Export
          </button>
          <button className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 text-gray-600 text-xs font-medium flex items-center gap-1 shadow-sm">
             <IoNotifications className="w-4 h-4" />
            Notifications
          </button>
          <img
            src="https://randomuser.me/api/portraits/men/1.jpg"
            alt="User"
            className="w-8 h-8 rounded-full border-2 border-blue-200 ml-2 shadow"
          />
        </div>
      </div>
    </div>
  );
};

export { Header };
