import { useState } from 'react';
import { Header } from '../components/Header';
import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

export const TaskAllocate = ({tasks,setTasks}) => {

    const [formData, setFormData] = useState({
    sno: "",
    taskname: "",
    submitted: "-",
    approved: "-",
    due: ""
  });

  useEffect(() => {
    const nsno = tasks.length > 0 ? tasks[tasks.length - 1].sno + 1 : 1;
    setFormData((prev) => ({ ...prev, sno: nsno }));
  }, [tasks]); // runs only when 'tasks' changes


  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Task:", formData);
    setTasks([...tasks,formData]);

    setFormData({
    sno: "",
    taskname: "",
    submitted: "-",
    approved: "-",
    due: ""
  });

    toast.info("Data Added Successfully")
  };

  return (
    <>
    <Header />
    < ToastContainer />
     <div className=" bg-gray-100  flex justify-center items-start">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-2xl animate-fadeIn">
        <h2 className="text-2xl font-bold text-indigo-600 mb-1 text-center">
          Task Allocation Form
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Task ID</label>
            <input
              type="text"
              name="taskId"
              className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Task Name</label>
            <input
              type="text"
              name="taskname"
              value={formData.taskname}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Task Description</label>
            <textarea
              name="description"
              rows="1"
              
              className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Assign To</label>
            <input
              type="text"
              name="assignedTo"
              
              className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Member name or ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              name="due"
              value={formData.due}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="1"
              className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            ></textarea>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition-all duration-300"
            >
              Allocate Task
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}