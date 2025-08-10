import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";

// Your original staticTasks array (for fallback)
const staticTasks = [
  {
    sno: 1,
    taskname: "Prepare Semester Report",
    description: "Compile and submit the semester academic report for your department.",
    status: "allocated",
    due: "2025-08-15",
    category: "Documentation",
    attachments: [{ name: "Report Template.docx", url: "#" }],
  },
  {
    sno: 2,
    taskname: "Lab Equipment Audit",
    description: "Audit all lab equipment and update the inventory list.",
    status: "allocated",
    due: "2025-08-20",
    category: "Audit",
    attachments: [],
  },
  {
    sno: 3,
    taskname: "Faculty Meeting",
    description: "Attend the monthly faculty meeting in the conference hall.",
    status: "allocated",
    due: "2025-08-10",
    category: "Meeting",
    attachments: [{ name: "Agenda.pdf", url: "#" }],
  },
  {
    sno: 4,
    taskname: "Student Feedback Collection",
    description: "Collect and compile student feedback for all subjects.",
    status: "allocated",
    due: "2025-08-18",
    category: "Survey",
    attachments: [{ name: "Feedback Form.xlsx", url: "#" }],
  },
  {
    sno: 5,
    taskname: "Update Faculty Profiles",
    description: "Update faculty profiles with latest publications and awards.",
    status: "allocated",
    due: "2025-08-25",
    category: "Documentation",
    attachments: [],
  },
  {
    sno: 6,
    taskname: "Organize Workshop",
    description: "Plan and organize the upcoming technical workshop.",
    status: "allocated",
    due: "2025-09-02",
    category: "Event",
    attachments: [{ name: "Workshop Plan.pdf", url: "#" }],
  },
  {
    sno: 7,
    taskname: "Library Book Purchase",
    description: "Prepare a list of new books to be purchased for the library.",
    status: "allocated",
    due: "2025-08-30",
    category: "Procurement",
    attachments: [{ name: "Book List.xlsx", url: "#" }],
  },
  
];

export const TaskPortal = () => {
  const [tasks, setTasks] = useState([]);

  // Only load tasks from localStorage that were added via TaskAllocate
  useEffect(() => {
    const localTasks = JSON.parse(localStorage.getItem("taskportal_tasks") || "[]");
    setTasks(localTasks);
  }, []);

  const [selectedTask, setSelectedTask] = useState(null);
  const [modalMode, setModalMode] = useState(""); // "accept", "submit", "ignore"
  const [uploadFiles, setUploadFiles] = useState([]);
  const [ignoreReason, setIgnoreReason] = useState("");
  const [alternate, setAlternate] = useState("");

  const handleAccept = (task) => {
    setSelectedTask(task);
    setModalMode("submit");
  };

  const handleIgnore = (task) => {
    setSelectedTask(task);
    setModalMode("ignore");
    setIgnoreReason("");
    setAlternate("");
  };

  const handleTaskNameClick = (task) => {
    if (task.status === "allocated") {
      setSelectedTask(task);
      setModalMode("accept");
    } else if (task.status === "progress") {
      setSelectedTask(task);
      setModalMode("submit");
    }
  };

  // When submitting a task, update localStorage and approval queue
  const handleSubmitTask = () => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.sno === selectedTask.sno
          ? {
              ...t,
              status: "progress",
              attachments: [
                ...(t.attachments || []),
                ...uploadFiles.map((f) => ({
                  name: f.name,
                  url: URL.createObjectURL(f),
                })),
              ],
              notDone: false,
            }
          : t
      );
      localStorage.setItem("taskportal_tasks", JSON.stringify(updated));

      // Add to approval queue for HoD
      const approvalTasks = JSON.parse(localStorage.getItem("taskapproval_tasks") || "[]");
      const submittedTask = updated.find((t) => t.sno === selectedTask.sno);
      localStorage.setItem(
        "taskapproval_tasks",
        JSON.stringify([
          ...approvalTasks.filter((t) => String(t.sno) !== String(selectedTask.sno)),
          { ...submittedTask, status: "progress" },
        ])
      );

      return updated;
    });
    setSelectedTask(null);
    setModalMode("");
    setUploadFiles([]);
  };

  const handleSubmitIgnore = () => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.sno === selectedTask.sno
          ? {
              ...t,
              status: "progress",
              notDone: true,
              ignoreReason,
              alternate,
            }
          : t
      );
      localStorage.setItem("taskportal_tasks", JSON.stringify(updated));
      return updated;
    });
    setSelectedTask(null);
    setModalMode("");
    setIgnoreReason("");
    setAlternate("");
  };

  // Listen for approval from HoD and move to completed
  useEffect(() => {
    const approvalTasks = JSON.parse(localStorage.getItem("taskapproval_tasks") || "[]");
    const completedSnos = approvalTasks
      .filter((t) => t.status === "completed")
      .map((t) => t.sno);

    if (completedSnos.length > 0) {
      setTasks((prev) => {
        const updated = prev.map((t) =>
          completedSnos.includes(t.sno)
            ? { ...t, status: "completed" }
            : t
        );
        localStorage.setItem("taskportal_tasks", JSON.stringify(updated));
        // Remove completed from approval queue
        const stillPending = approvalTasks.filter((t) => t.status !== "completed");
        localStorage.setItem("taskapproval_tasks", JSON.stringify(stillPending));
        return updated;
      });
    }
  }, [tasks]);

  // Merge static tasks (always present) with local tasks (from TaskAllocate)
  const allTasks = [
    ...staticTasks,
    ...tasks.filter(
      (lt) => !staticTasks.some((st) => String(st.sno) === String(lt.sno))
    ),
  ];

  const allocatedTasks = allTasks.filter((t) => t.status === "allocated");
  const progressTasks = allTasks.filter((t) => t.status === "progress");
  const completedTasks = allTasks.filter((t) => t.status === "completed");

  return (
    <>
      <Header />
      <div className="flex gap-4 px-8 py-8 min-h-[80vh] bg-gray-100">
        {/* Allocated Column */}
        <div className="w-1/2 relative h-[80vh] overflow-y-auto  scrollbar-hide">
          <div className="bg-white rounded-xl shadow p-4 min-h-[80vh]">
            <h2 className="text-xl font-bold  text-indigo-700 mb-4 text-center">
              Allocated
            </h2>
            <ul className="space-y-3">
              {allocatedTasks.length === 0 && (
                <li className="text-gray-400 text-center py-12">
                  No Allocated Tasks
                </li>
              )}
              {allocatedTasks.map((task) => (
                <li
                  key={task.sno}
                  className="bg-indigo-50 hover:bg-indigo-100 rounded-lg px-4 py-3 shadow transition flex items-center justify-between"
                >
                  <span
                    className="font-semibold text-indigo-700 cursor-pointer"
                    onClick={() => handleTaskNameClick(task)}
                  >
                    {task.taskname}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 mr-2">{task.due}</span>
                    {/* Accept Icon */}
                    <button
                      className="text-green-600 hover:bg-green-100 rounded-full p-1"
                      title="Accept"
                      onClick={() => handleAccept(task)}
                    >
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                    {/* Ignore Icon */}
                    <button
                      className="text-red-500 hover:bg-red-100 rounded-full p-1"
                      title="Ignore"
                      onClick={() => handleIgnore(task)}
                    >
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18 6L6 18M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Accept Modal */}
          {selectedTask && modalMode === "accept" && (
            <div className="absolute top-0 left-0 w-full h-full z-20 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-2xl shadow-2xl shadow-black w-[95%] h-[95%] max-w-[570px] mx-auto p-10 relative animate-slideIn flex flex-col">
                {/* Top Row */}
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                    #{selectedTask.sno}
                  </span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                    {selectedTask.category || "General"}
                  </span>
                </div>
                {/* Task Name */}
                <h3 className="text-2xl font-bold text-center text-indigo-800 mb-2">
                  {selectedTask.taskname}
                </h3>
                {/* Description */}
                <p className="text-gray-700 text-center mb-4">
                  {selectedTask.description || "No description provided."}
                </p>
                {/* Attachments */}
                {selectedTask.attachments &&
                  selectedTask.attachments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-600 mb-1">
                        Attachments:
                      </h4>
                      <ul className="space-y-1">
                        {selectedTask.attachments.map((att, idx) => (
                          <li key={idx}>
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline text-sm"
                            >
                              {att.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                {/* Due Date */}
                <div className="flex justify-center mb-6">
                  <span className="bg-yellow-200 text-yellow-800 px-4 py-1 rounded-full font-bold text-md shadow">
                    Due: {selectedTask.due}
                  </span>
                </div>
                {/* Accept Button */}
                <div className="flex gap-4 justify-center mt-auto">
                  <button
                    onClick={() => {
                      setModalMode("submit");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-lg font-bold shadow transition"
                  >
                    Accept Task
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTask(null);
                      setModalMode("");
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-2 rounded-lg font-bold shadow transition"
                  >
                    Cancel
                  </button>
                </div>
                {/* Close Button */}
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setModalMode("");
                  }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              <style>
                {`
                @keyframes slideIn {
                  from { transform: translateY(40px); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
                }
                .animate-slideIn {
                  animation: slideIn 0.25s cubic-bezier(.4,0,.2,1);
                }
              `}
              </style>
            </div>
          )}
          {/* Submit Modal */}
          {selectedTask && modalMode === "submit" && (
            <div className="absolute top-0 left-0 w-full h-full z-20 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-2xl shadow-2xl shadow-black w-[95%] h-[95%] max-w-[570px] mx-auto p-10 relative animate-slideIn flex flex-col">
                {/* Top Row */}
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                    #{selectedTask.sno}
                  </span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                    {selectedTask.category || "General"}
                  </span>
                </div>
                {/* Task Name */}
                <h3 className="text-2xl font-bold text-center text-indigo-800 mb-2">
                  {selectedTask.taskname}
                </h3>
                {/* Description */}
                <p className="text-gray-700 text-center mb-4">
                  {selectedTask.description || "No description provided."}
                </p>
                {/* Attachments */}
                {selectedTask.attachments &&
                  selectedTask.attachments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-600 mb-1">
                        Attachments:
                      </h4>
                      <ul className="space-y-1">
                        {selectedTask.attachments.map((att, idx) => (
                          <li key={idx}>
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline text-sm"
                            >
                              {att.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                {/* Due Date */}
                <div className="flex justify-center mb-6">
                  <span className="bg-yellow-200 text-yellow-800 px-4 py-1 rounded-full font-bold text-md shadow">
                    Due: {selectedTask.due}
                  </span>
                </div>
                {/* Upload Attachments */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Upload Attachments
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                    className="block w-full text-sm text-gray-600
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  {uploadFiles.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-gray-500">
                      {uploadFiles.map((file, idx) => (
                        <li key={idx}>{file.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Submit Button */}
                <div className="flex gap-4 justify-center mt-auto">
                  <button
                    onClick={handleSubmitTask}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold shadow transition"
                  >
                    Submit Task
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTask(null);
                      setModalMode("");
                      setUploadFiles([]);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-2 rounded-lg font-bold shadow transition"
                  >
                    Cancel
                  </button>
                </div>
                {/* Close Button */}
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setModalMode("");
                    setUploadFiles([]);
                  }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              <style>
                {`
                @keyframes slideIn {
                  from { transform: translateY(40px); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
                }
                .animate-slideIn {
                  animation: slideIn 0.25s cubic-bezier(.4,0,.2,1);
                }
              `}
              </style>
            </div>
          )}
          {/* Ignore Modal */}
          {selectedTask && modalMode === "ignore" && (
            <div className="absolute top-0 left-0 w-full h-full z-30 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-2xl shadow-2xl shadow-black w-[95%] h-[95%] max-w-[570px] mx-auto p-10 relative animate-slideIn flex flex-col">
                {/* Top Row */}
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                    #{selectedTask.sno}
                  </span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                    {selectedTask.category || "General"}
                  </span>
                </div>
                {/* Task Name */}
                <h3 className="text-2xl font-bold text-center text-indigo-800 mb-2">
                  {selectedTask.taskname}
                </h3>
                {/* Reason Input */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Reason for not completing the task
                  </label>
                  <textarea
                    className="w-full border rounded-lg p-2 text-gray-700"
                    rows={3}
                    value={ignoreReason}
                    onChange={(e) => setIgnoreReason(e.target.value)}
                    placeholder="Enter your reason..."
                  />
                </div>
                {/* Alternate Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Alternate arrangement (if any)
                  </label>
                  <input
                    className="w-full border rounded-lg p-2 text-gray-700"
                    value={alternate}
                    onChange={(e) => setAlternate(e.target.value)}
                    placeholder="Suggest alternate arrangement..."
                  />
                </div>
                {/* Submit Button */}
                <div className="flex gap-4 justify-center mt-auto">
                  <button
                    onClick={handleSubmitIgnore}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-lg font-bold shadow transition"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTask(null);
                      setModalMode("");
                      setIgnoreReason("");
                      setAlternate("");
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-2 rounded-lg font-bold shadow transition"
                  >
                    Cancel
                  </button>
                </div>
                {/* Close Button */}
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setModalMode("");
                    setIgnoreReason("");
                    setAlternate("");
                  }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              <style>
                {`
                @keyframes slideIn {
                  from { transform: translateY(40px); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
                }
                .animate-slideIn {
                  animation: slideIn 0.25s cubic-bezier(.4,0,.2,1);
                }
              `}
              </style>
            </div>
          )}
        </div>
        {/* Progress Column */}
        <div className="w-1/4">
          <div className="bg-white rounded-xl shadow p-4 min-h-[80vh] overflow-y-auto  scrollbar-hide">
            <h2 className="text-xl font-bold text-blue-700 mb-4 text-center">
              Progress
            </h2>
            <ul className="space-y-3">
              {progressTasks.length === 0 && (
                <li className="text-gray-400 text-center py-12">
                  No Tasks In Progress
                </li>
              )}
              {progressTasks.map((task) => (
                <li
                  key={task.sno}
                  className="bg-blue-50 rounded-lg px-2 py-2 shadow flex items-center justify-between  "
                >
                  <span
                    className={`font-semibold cursor-pointer ${
                      task.notDone ? "text-red-600" : "text-blue-700"
                    }`}
                    onClick={() => handleTaskNameClick(task)}
                  > 
                    {task.taskname}
                    {task.notDone && (
                      <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                        Not Done
                      </span>
                    )}
                    {!task.notDone && (
                      <span className="ml-2 bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full text-xs font-bold">
                        Review
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500">{task.due}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Completed Column */}
        <div className="w-1/4">
          <div className="bg-white rounded-xl shadow p-4 min-h-[80vh] overflow-y-auto  scrollbar-hide">
            <h2 className="text-xl font-bold text-green-700 mb-4 text-center">
              Completed
            </h2>
            <ul className="space-y-3">
              {completedTasks.length === 0 && (
                <li className="text-gray-400 text-center py-12">
                  No Completed Tasks
                </li>
              )}
              {completedTasks.map((task) => (
                <li
                  key={task.sno}
                  className="bg-green-50 rounded-lg px-4 py-3 shadow flex items-center justify-between"
                >
                  <span className="font-semibold text-green-700">
                    {task.taskname}
                  </span>
                  <span className="text-xs text-gray-500">{task.due}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

