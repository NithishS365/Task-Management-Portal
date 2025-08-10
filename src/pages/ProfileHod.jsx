import React from "react";
import hodData from "../Data/hod.json";
import { Header } from "../components/Header";

export const ProfileHod = () => {
  const hod = hodData;

  return (
    <>
    <Header />
    <div className=" bg-gray-100 flex flex-col items-center py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl shadow-slate-400 p-8 flex flex-col items-center max-w-4xl w-full">
        <img
          src={hod.img_url}
          alt={hod.t_name}
          className="w-36 h-38 rounded-md  border-4 border-indigo-300 shadow mb-4"
        />
        <h2 className="text-3xl font-bold text-indigo-800 mb-1">{hod.t_name}</h2>
        <p className="text-lg text-gray-600 font-medium mb-1">{hod.design}</p>
        <p className="text-gray-500 text-sm mb-2">{hod.dep}</p>
        <div className="w-full border-t pt-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Email:</span>{" "}
                <a href={`mailto:${hod.email}`} className="text-indigo-600 hover:underline">{hod.email}</a>
              </p>
              {hod.username && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Username:</span> {hod.username}
                </p>
              )}
              {hod.phone && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Phone:</span> {hod.phone}
                </p>
              )}
              {hod.spec && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Specialization:</span> {hod.spec}
                </p>
              )}
            </div>
            <div>
              {hod.dob && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Date of Birth:</span> {hod.dob}
                </p>
              )}
              {hod.exp && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Experience:</span> {hod.exp}
                </p>
              )}
              {hod.linked_in_id && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">LinkedIn:</span>{" "}
                  <a
                    href={hod.linked_in_id}
                    target="_blank"      
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {hod.linked_in_id}
                  </a>
                </p>
              )}
              {hod.pwd && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Password:</span> {hod.pwd.slice(0, 3)}{hod.pwd.slice(4).replace(/./g, '*')}
                </p>
              )}
            </div>
          </div>
        </div>
        {hod.bio && (
          <div className="w-full mt-8 bg-indigo-50 rounded-xl p-4 shadow">
            <h3 className="text-lg font-bold text-indigo-700 mb-2">About</h3>
            <p className="text-gray-700">{hod.bio}</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};
