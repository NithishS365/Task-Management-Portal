import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useTask } from '../context/Taskcontext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

export const AddTask = ({ tasks, setTasks, task, setTask }) => {
  const [due, setDue] = useState(task.due || "");
  const [loading, setLoading] = useState(false);
  
  // Get contexts
  const { createTask } = useTask();
  const { user } = useAuth();

  const handletask = async (e) => {
    e.preventDefault();
    
    if (!task.name || !due) {
      toast.error("Please enter a task and select a due date.");
      return;
    }

    try {
      setLoading(true);
      
      // ✅ Convert to backend format
      const taskData = {
        title: task.name,           // ✅ Map 'name' to 'title'
        description: task.description || '',
        dueDate: due,
        priority: 'Medium',
        category: 'General',
        assignedTo: user?._id,      // ✅ Assign to self if no specific user
        status: 'pending'
      };

      console.log('📝 Creating task with data:', taskData);

      if (task.id) {
        // Update existing task
        const updatedTask = await createTask(taskData);
        
        // Update local state for compatibility
        const updatedtasks = tasks.map((todo) =>
          todo.id === task.id
            ? {
                id: updatedTask._id,
                name: updatedTask.title,
                date: new Date().toLocaleString(),
                due: due,
                _id: updatedTask._id,
                ...updatedTask
              }
            : todo
        );
        setTasks(updatedtasks);
        toast.success("✅ Task updated successfully!");
      } else {
        // Create new task
        const createdTask = await createTask(taskData);
        
        // Add to local state for compatibility
        const newTask = {
          id: createdTask._id,
          name: createdTask.title,
          date: new Date().toLocaleString(),
          due: due,
          _id: createdTask._id,
          ...createdTask
        };
        setTasks([...tasks, newTask]);
        toast.success("✅ Task created successfully!");
      }

      // Reset form
      setTask({});
      setDue("");
      
    } catch (error) {
      console.error('❌ Task creation failed:', error);
      toast.error(`Failed to create task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update due date if editing a existing task 
  React.useEffect(() => {
    setDue(task.due || "");
  }, [task]);

  return (
    <section className="flex font-Montserrat justify-center items-center mt-8">
      <ToastContainer />
      <form
        onSubmit={handletask}
        className="bg-white dark:bg-gray-800 min-w-[400px] max-w-2xl w-full flex flex-col md:flex-row md:justify-evenly items-center gap-4 px-6 py-6 shadow-lg rounded-3xl border border-gray-200 dark:border-gray-700"
        style={{ transition: "box-shadow 0.3s" }}
      >
        <input
          type="text"
          placeholder="Add a Task"
          name="input"
          value={task.name || ""}
          onChange={(e) => setTask({ ...task, name: e.target.value })}
          className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300 focus:outline-none shadow-sm transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-green-500"
          disabled={loading}
        />
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className="px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300 focus:outline-none shadow-sm transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-green-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow hover:from-green-700 hover:to-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "⏳" : task.id ? "Update" : "Add"}
        </button>
      </form>
    </section>
  );
};