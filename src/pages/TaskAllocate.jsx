import React, { useState } from "react";
import staffData from "../Data/staff.json"; // Your staff JSON file
import { Dialog } from "@headlessui/react"; // For popup modal

export  function TaskAllocate() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [task, setTask] = useState("");
  const [dueDate,setDueDate] = useState("")

  const toggleStaffSelection = (staff) => {
    setSelectedStaff((prev) =>
      prev.some((s) => s.email === staff.email)
        ? prev.filter((s) => s.email !== staff.email)
        : [...prev, staff]
    );
  };

  const assignTask = () => {
    if (!task || selectedStaff.length === 0) {
      alert("Please enter task and select at least one staff.");
      return;
    }
    console.log("Task:", task, "Assigned to:", selectedStaff);
    alert("Task Assigned Successfully!");
    setTask("");
    setSelectedStaff([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">Task Allocation</h1>

      <input type="text" placeholder="Task Title" className="w-full max-w-lg p-3 border rounded-lg shadow-sm mb-4" />

      <select name="" id="">
              <option index >Select Categories</option>
              <option value="">Academics</option>
              <option value="">Placements</option>
              <option value="">Event Organisation</option>
              <option value="">COE</option>
              <option value="">Exam</option>
              <option value="">Student achievement</option>
              <option value="">Faculty achivement</option>
      </select>
      
      <input type="text" placeholder="Subject" className="w-full max-w-lg p-3 border rounded-lg shadow-sm mb-4" />

      {/* Task Input */}
      <textarea
        placeholder="Enter task description*"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        className="w-full max-w-lg p-3 border rounded-lg shadow-sm mb-4"/>

          {/* Due Date Selector */}
      <label className="block mb-2 font-medium">Due Date</label>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="border rounded-lg p-2 mb-4 w-full"
      />  

      {/* Selected Staff Preview */}
      <div className="flex flex-wrap gap-3 mb-4">
        {selectedStaff.map((staff) => (
          <div
            key={staff.email}
            className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow"
          >
            <img
              src={staff.img_url}
              alt={staff.t_name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm">{staff.t_name}</span>
          </div>
        ))}
      </div>

      {/* Open Modal Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
      >
        Select Staff
      </button>

      {/* Assign Button */}
      <button
        onClick={assignTask}
        className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
      >
        Assign Task
      </button>



      {/* Popup Modal */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <Dialog.Title className="text-lg font-bold mb-4">Select Staff</Dialog.Title>
            <div className="max-h-60 overflow-y-auto">
              {staffData.map((staff) => (
                <div
                  key={staff.email}
                  onClick={() => toggleStaffSelection(staff)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                    selectedStaff.some((s) => s.email === staff.email)
                      ? "bg-blue-100"
                      : ""
                  }`}
                >
                  <img
                    src={staff.img_url}
                    alt={staff.t_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span>{staff.t_name}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
