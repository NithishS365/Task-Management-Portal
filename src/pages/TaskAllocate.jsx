import React, { useState } from "react";
import staffData from "../Data/Staff.json";
import { Dialog } from "@headlessui/react";
import { Header } from "../components/Header";

export function TaskAllocate() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [dueDate, setDueDate] = useState("");

  const toggleStaffSelection = (staff) => {
    setSelectedStaff((prev) =>
      prev.some((s) => s.email === staff.email)
        ? prev.filter((s) => s.email !== staff.email)
        : [...prev, staff]
    );
  };

  const assignTask = () => {
    if (!taskTitle || !taskDesc || !category || selectedStaff.length === 0 || !dueDate) {
      alert("Please fill all fields and select at least one staff.");
      return;
    }

    // Prepare the task object
    const newTask = {
      sno: Date.now(),
      taskname: taskTitle,
      description: taskDesc,
      status: "allocated",
      due: dueDate,
      category,
      subject,
      attachments: [],
    };

    // Save to localStorage for TaskPortal to pick up
    // We'll use a key 'taskportal_tasks' to store all allocated tasks
    const prevTasks = JSON.parse(localStorage.getItem("taskportal_tasks") || "[]");
    localStorage.setItem("taskportal_tasks", JSON.stringify([...prevTasks, newTask]));

    alert("Task Assigned Successfully!");
    setTaskTitle("");
    setTaskDesc("");
    setCategory("");
    setSubject("");
    setDueDate("");
    setSelectedStaff([]);
  };

  return (
    <>
    <Header />
    <div className=" bg-gray-100 flex flex-col items-center py-6">
      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-md shadow-gray-300 w-full max-w-3xl p-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
          Task Allocation
        </h1>

        {/* Task Title */}
        <input
          type="text"
          placeholder="Task Title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm mb-5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        {/* Category & Subject in One Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select Category</option>
            <option>Academics</option>
            <option>Placements</option>
            <option>Event Organisation</option>
            <option>COE</option>
            <option>Exam</option>
            <option>Student achievement</option>
            <option>Faculty achievement</option>
          </select>

          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Task Description */}
        <textarea
          placeholder="Enter task description*"
          value={taskDesc}
          onChange={(e) => setTaskDesc(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm mb-5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows="4"
        />

        {/* Due Date */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Selected Staff Preview */}
        {selectedStaff.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {selectedStaff.map((staff) => (
              <div
                key={staff.email}
                className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full shadow-sm"
              >
                <img
                  src={staff.img_url}
                  alt={staff.t_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-800">
                  {staff.t_name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setIsOpen(true)}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg shadow hover:bg-blue-700 transition duration-200"
          >
            Select Staff
          </button>
          <button
            onClick={assignTask}
            className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg shadow hover:bg-green-700 transition duration-200"
          >
            Assign Task
          </button>
        </div>
      </div>

      {/* Staff Selection Modal */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <Dialog.Title className="text-lg font-bold mb-4 text-gray-800">
              Select Staff
            </Dialog.Title>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {staffData.map((staff) => (
                <div
                  key={staff.email}
                  onClick={() => toggleStaffSelection(staff)}
                  className={`flex items-center gap-3 p-2 border rounded-lg cursor-pointer transition ${
                    selectedStaff.some((s) => s.email === staff.email)
                      ? "bg-blue-100 border-blue-400"
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  <img
                    src={staff.img_url}
                    alt={staff.t_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className="font-medium text-gray-700">
                    {staff.t_name}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition duration-200"
              >
                Done
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
    </>
  );
}