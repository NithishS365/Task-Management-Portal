import React from "react";
import { useNavigate } from "react-router-dom";
import staffData from "../Data/Staff.json";

export const FacultyOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-6">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">
        Staff Profiles
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {staffData.map((staff, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition p-6 flex flex-col items-center cursor-pointer"
            onClick={() => navigate(`/HodDash/faculty_overview/staff/${staff.t_id}`, { state: { staff } })}
          >
            <img
              src={staff.img_url}
              alt={staff.t_name}
              className="w-28 h-36 border-4 mb-4 shadow object-cover rounded-lg"
            />
            <h2 className="text-xl font-bold text-indigo-800 mb-1">
              {staff.t_name}
            </h2>
            <p className="text-gray-600 font-medium mb-2">
              {staff.design}
            </p>
            <p className="text-gray-500 text-xs mb-2">{staff.dep}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
