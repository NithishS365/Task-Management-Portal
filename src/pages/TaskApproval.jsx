import React, { useState } from "react";
import { Header } from "../components/Header";

// Simulate fetching submitted tasks (in real app, fetch from backend or context)
const initialSubmittedTasks = [
  {
    sno: 2,
    taskname: "Lab Equipment Audit",
    description: "Audit all lab equipment and update the inventory list.",
    status: "progress",
    due: "2025-08-20",
    category: "Audit",
    attachments: [],
    submittedBy: "John Doe",
    notDone: false,
  },
  {
    sno: 3,
    taskname: "Faculty Meeting",
    description: "Attend the monthly faculty meeting in the conference hall.",
    status: "progress",
    due: "2025-08-10",
    category: "Meeting",
    attachments: [{ name: "Minutes.pdf", url: "#" }],
    submittedBy: "Jane Smith",
    notDone: false,
  },
];

export const TaskApproval = () => {
  const [submittedTasks, setSubmittedTasks] = useState(initialSubmittedTasks);
  const [approvedTasks, setApprovedTasks] = useState([]);

  const handleApprove = (task) => {
    setApprovedTasks((prev) => [...prev, { ...task, status: "completed" }]);
    setSubmittedTasks((prev) => prev.filter((t) => t.sno !== task.sno));
    // In a real app, also update the backend and TaskPortal state!
  };

  return (
    <>
      <Header />
      <div className=" bg-gray-100 py-2 px-2 flex flex-col items-center justify-start">
        <div className="w-full max-w-6xl flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-center text-indigo-700 mt-2 mb-4">
            Task Approval Portal
          </h1>
          <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* Submitted Tasks - wider */}
            <div className="flex-[2] bg-white rounded-xl shadow-lg p-6 overflow-y-auto max-h-[72vh]">
              <h2 className="text-xl font-bold text-blue-700 mb-6 text-center">
                Submitted Tasks
              </h2>
              {submittedTasks.length === 0 ? (
                <div className="text-gray-400 text-center py-12">
                  No tasks pending approval.
                </div>
              ) : (
                <ul className="space-y-6">
                  {submittedTasks.map((task) => (
                    <li
                      key={task.sno}
                      className="border rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between bg-blue-50 hover:bg-blue-100 transition"
                    >
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                            #{task.sno}
                          </span>
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                            {task.category}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {task.due}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-indigo-800 mb-1">
                          {task.taskname}
                        </h3>
                        <p className="text-gray-700 mb-2">{task.description}</p>
                        {task.attachments && task.attachments.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-gray-600 text-xs">
                              Attachments:{" "}
                            </span>
                            {task.attachments.map((att, idx) => (
                              <a
                                key={idx}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline text-xs ml-2"
                              >
                                {att.name}
                              </a>
                            ))}
                          </div>
                        )}
                        <div className="text-sm text-gray-500 mb-1">
                          <span className="font-semibold">Submitted By:</span>{" "}
                          {task.submittedBy}
                        </div>
                        {task.notDone && (
                          <div className="mt-2">
                            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold mr-2">
                              Not Done
                            </span>
                            <span className="text-xs text-gray-700">
                              Reason: {task.ignoreReason || "N/A"}
                            </span>
                            {task.alternate && (
                              <span className="ml-2 text-xs text-gray-700">
                                | Alternate: {task.alternate}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end mt-4 md:mt-0 md:ml-6">
                        <button
                          onClick={() => handleApprove(task)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow transition"
                        >
                          Approve
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Approved Tasks - smaller */}
            <div className="flex-1 bg-white rounded-xl shadow-lg p-6 overflow-y-auto max-h-[40vh] self-start">
              <h2 className="text-xl font-bold text-green-700 mb-6 text-center">
                Recently Approved
              </h2>
              {approvedTasks.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  No tasks approved yet.
                </div>
              ) : (
                <ul className="space-y-4">
                  {approvedTasks.map((task) => (
                    <li
                      key={task.sno}
                      className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between bg-green-50"
                    >
                      <div>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold mr-2">
                          #{task.sno}
                        </span>
                        <span className="font-semibold text-green-700">
                          {task.taskname}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {task.due}
                        </span>
                      </div>
                      <span className="text-xs text-green-700 font-bold mt-2 md:mt-0">
                        Approved & Moved to Completed
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
